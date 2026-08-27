/**
 * ZXing-C++ WebAssembly decode path (zxing-wasm).
 * Much more sensitive than pure-JS @zxing/library for live camera frames.
 *
 * WASM must be same-origin under CSP (`connect-src 'self'`). Apps call
 * {@link setZXingWasmUrl} once at boot with a Vite `?url` import.
 *
 * Sensitivity strategy (maximize hit rate for small / distant / low-contrast codes):
 * - Eager WASM instantiate (`fireImmediately`)
 * - Multi-pass digital zoom: full frame + center crops upscaled + 1D mid-band
 * - Alternate binarizer on tight crops
 * - tryDenoise + minLineCount: 1 (non-default reader deltas)
 */
import {
  prepareZXingModule,
  readBarcodes,
  type ReaderOptions,
} from 'zxing-wasm/reader';

import type { BarcodeScannerFormatProfile } from './scannerFormats.js';

let wasmUrl: string | null = null;
let prepared = false;

/**
 * Configure same-origin URL for `zxing_reader.wasm` (Vite `?url` or `/public`).
 * Empty / whitespace-only URL clears configuration (`isZXingWasmConfigured()` → false).
 */
export function setZXingWasmUrl(url: string): void {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    wasmUrl = null;
    prepared = false;
    return;
  }
  wasmUrl = trimmed;
  prepared = false;
}

/** True only when a non-empty URL was set via {@link setZXingWasmUrl}. */
export function isZXingWasmConfigured(): boolean {
  return wasmUrl !== null && wasmUrl.length > 0;
}

/**
 * Eagerly instantiate zxing-wasm (asset fetch + WASM compile).
 *
 * Must use `fireImmediately: true` and await the Promise — with the library
 * default `fireImmediately: false`, prepare only registers overrides and
 * `prepared = true` would lie; asset/instantiate failure then surfaces later
 * as `readBarcodes` rejects (G4 fallthrough) while status stays `running`.
 *
 * On reject/throw: leave `prepared = false` and rethrow so the caller can
 * hard-fail via G3 `wasmBootstrapFailed` (no native/@zxing fallthrough).
 * G4 ≥8 hard-fail fallthrough applies ONLY to post-start decode rejects after
 * a successfully instantiated module — unloadable WASM is a bootstrap error.
 */
export async function ensureZXingWasmPrepared(): Promise<void> {
  if (prepared) {
    return;
  }
  const url = wasmUrl;
  if (url === null) {
    throw new Error(
      'ZXing WASM URL not configured. Import initBarcodeScannerWasm in the app entry.',
    );
  }
  try {
    await prepareZXingModule({
      fireImmediately: true,
      overrides: {
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            return url;
          }
          return prefix + path;
        },
      },
    });
    prepared = true;
  } catch (err) {
    prepared = false;
    throw err;
  }
}

const WASM_RETAIL_FORMATS = ['Code128', 'EAN13', 'EAN8', 'UPCA'] as const;
const WASM_QR_ONLY_FORMATS = ['QRCode'] as const;
const WASM_ALL_FORMATS = [...WASM_RETAIL_FORMATS, 'QRCode'] as const;

export function resolveWasmReaderFormats(
  formatProfile: BarcodeScannerFormatProfile,
): ReaderOptions['formats'] {
  if (formatProfile === 'qr-only') {
    return [...WASM_QR_ONLY_FORMATS];
  }
  if (formatProfile === 'all') {
    return [...WASM_ALL_FORMATS];
  }
  return [...WASM_RETAIL_FORMATS];
}

/**
 * Reader options for the high-sensitivity WASM path.
 *
 * Note: `tryHarder` / `tryRotate` / `tryInvert` / `tryDownscale` already default to
 * `true` in zxing-wasm@3.1.3 — kept explicit but they are not the sensitivity upgrade.
 * Real deltas vs library defaults: `tryDenoise: true`, `minLineCount: 1`, earlier
 * downscale threshold, multi-pass digital zoom in {@link decodeVideoFrameWithZxingWasm},
 * plus camera constraints / optical zoom elsewhere.
 */
export function buildSensitiveReaderOptions(
  formatProfile: BarcodeScannerFormatProfile,
): ReaderOptions {
  return {
    tryHarder: true,
    tryRotate: true,
    tryInvert: true,
    tryDownscale: true,
    tryDenoise: true,
    minLineCount: 1,
    maxNumberOfSymbols: 1,
    // Start multi-scale search earlier on high-res frames.
    downscaleThreshold: 800,
    downscaleFactor: 2,
    formats: resolveWasmReaderFormats(formatProfile),
  };
}

export interface ScanPass {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  /** Upscale factor when drawing the crop into the decode canvas (digital zoom). */
  readonly scale: number;
}

/**
 * Full frame + center zooms + mid-band (1D). Digital zoom is the main lever for
 * distant / small symbols when the user does not fill the viewfinder.
 */
export function buildMaxSensitivityScanPasses(videoWidth: number, videoHeight: number): ScanPass[] {
  const vw = videoWidth;
  const vh = videoHeight;
  if (vw < 2 || vh < 2) {
    return [];
  }

  const center = (frac: number, scale: number): ScanPass => {
    const sw = Math.max(2, Math.floor(vw * frac));
    const sh = Math.max(2, Math.floor(vh * frac));
    return {
      sx: Math.floor((vw - sw) / 2),
      sy: Math.floor((vh - sh) / 2),
      sw,
      sh,
      scale,
    };
  };

  const bandH = Math.max(2, Math.floor(vh * 0.28));
  const midBand: ScanPass = {
    sx: 0,
    sy: Math.floor((vh - bandH) / 2),
    sw: vw,
    sh: bandH,
    scale: 2,
  };

  return [
    { sx: 0, sy: 0, sw: vw, sh: vh, scale: 1 },
    center(0.7, 1.75),
    center(0.5, 2.25),
    center(0.35, 3),
    midBand,
  ];
}

function firstBarcodeText(results: Array<{ text: string }>): string | null {
  const first = results[0];
  if (first === undefined || first.text.length === 0) {
    return null;
  }
  return first.text;
}

async function decodeImageDataPass(
  imageData: ImageData,
  readerOptions: ReaderOptions,
): Promise<string | null> {
  const primary = firstBarcodeText(await readBarcodes(imageData, readerOptions));
  if (primary !== null) {
    return primary;
  }
  // Alternate binarizer helps washed-out / low-contrast packaging.
  const alt = firstBarcodeText(
    await readBarcodes(imageData, {
      ...readerOptions,
      binarizer: 'GlobalHistogram',
    }),
  );
  return alt;
}

/**
 * Decode one video frame via multi-pass canvas crops → ImageData → zxing-wasm.
 * Returns the first payload or null when nothing is found.
 */
export async function decodeVideoFrameWithZxingWasm(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  readerOptions: ReaderOptions,
): Promise<string | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width < 2 || height < 2) {
    return null;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) {
    return null;
  }

  // Nearest-neighbor upscale keeps barcode edges sharp for digital zoom passes.
  ctx.imageSmoothingEnabled = false;

  const passes = buildMaxSensitivityScanPasses(width, height);
  for (const pass of passes) {
    const outW = Math.max(2, Math.floor(pass.sw * pass.scale));
    const outH = Math.max(2, Math.floor(pass.sh * pass.scale));
    if (canvas.width !== outW) {
      canvas.width = outW;
    }
    if (canvas.height !== outH) {
      canvas.height = outH;
    }

    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(video, pass.sx, pass.sy, pass.sw, pass.sh, 0, 0, outW, outH);
    const imageData = ctx.getImageData(0, 0, outW, outH);
    const text = await decodeImageDataPass(imageData, readerOptions);
    if (text !== null) {
      return text;
    }
  }

  return null;
}
