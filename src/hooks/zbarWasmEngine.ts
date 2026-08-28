/**
 * ZBar C/C++ WASM decode — primary live camera engine for retail EAN/UPC/Code128 + QR.
 * Uses @undecaf/zbar-wasm (same engine as the BarcodeDetector polyfill).
 *
 * Apps must call {@link setZbarWasmUrl} once at boot with a same-origin
 * `zbar.wasm?url` (Vite) so CSP + bundlers resolve the binary.
 */
import {
  scanImageData,
  setModuleArgs,
  ZBarConfigType,
  ZBarScanner,
  ZBarSymbolType,
} from '@undecaf/zbar-wasm';
import type { BarcodeScannerFormatProfile } from './scannerFormats.js';
import {
  buildMaxSensitivityScanPasses,
  buildQuickScanPass,
} from './scannerScanPasses.js';

export interface ZbarDecodeFrameOptions {
  /** When true, decode full frame only (every other ticks — G9 CPU bound). */
  readonly quickOnly?: boolean;
}

let wasmUrlConfigured = false;

/**
 * CSP-safe same-origin URL for `zbar.wasm`. Call once before any scan session.
 */
export function setZbarWasmUrl(url: string): void {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    throw new Error('setZbarWasmUrl requires a non-empty same-origin WASM URL');
  }
  setModuleArgs({
    locateFile: (filename: string, _directory: string): string => {
      if (filename.endsWith('.wasm')) {
        return trimmed;
      }
      return filename;
    },
  });
  wasmUrlConfigured = true;
}

export function isZbarWasmUrlConfigured(): boolean {
  return wasmUrlConfigured;
}

/** Test-only — reset boot flag between Jest cases. */
export function resetZbarWasmUrlForTests(): void {
  wasmUrlConfigured = false;
}

const RETAIL_SYMBOLS: readonly ZBarSymbolType[] = [
  ZBarSymbolType.ZBAR_EAN13,
  ZBarSymbolType.ZBAR_EAN8,
  ZBarSymbolType.ZBAR_UPCA,
  ZBarSymbolType.ZBAR_UPCE,
  ZBarSymbolType.ZBAR_CODE128,
  ZBarSymbolType.ZBAR_CODE39,
];

const QR_SYMBOLS: readonly ZBarSymbolType[] = [ZBarSymbolType.ZBAR_QRCODE];

function symbolsForProfile(
  formatProfile: BarcodeScannerFormatProfile,
): readonly ZBarSymbolType[] {
  if (formatProfile === 'qr-only') {
    return QR_SYMBOLS;
  }
  if (formatProfile === 'all') {
    return [...RETAIL_SYMBOLS, ...QR_SYMBOLS];
  }
  return RETAIL_SYMBOLS;
}

/**
 * Build a ZBar scanner enabled only for the active format profile.
 * Dense X/Y scan + inverted retry for close / low-contrast retail labels.
 */
export async function createConfiguredZbarScanner(
  formatProfile: BarcodeScannerFormatProfile = 'retail',
): Promise<ZBarScanner> {
  if (!wasmUrlConfigured) {
    throw new Error(
      'ZBar WASM URL not configured — call setZbarWasmUrl(zbar.wasm?url) at app boot',
    );
  }

  const scanner = await ZBarScanner.create();
  // Disable everything, then enable the profile symbologies.
  scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_ENABLE, 0);
  for (const sym of symbolsForProfile(formatProfile)) {
    scanner.setConfig(sym, ZBarConfigType.ZBAR_CFG_ENABLE, 1);
  }
  // Denser scan grid (default is often too sparse for close phone shots).
  scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_X_DENSITY, 1);
  scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_Y_DENSITY, 1);
  scanner.setConfig(
    ZBarSymbolType.ZBAR_NONE,
    ZBarConfigType.ZBAR_CFG_TEST_INVERTED,
    1,
  );
  scanner.enableCache(false);
  return scanner;
}

/**
 * Multi-pass digital crops → ZBar `scanImageData`.
 * Returns first non-empty payload or null.
 */
export async function decodeVideoFrameWithZbar(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  scanner: ZBarScanner,
  options?: ZbarDecodeFrameOptions,
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

  ctx.imageSmoothingEnabled = false;

  const passes = options?.quickOnly
    ? buildQuickScanPass(width, height)
    : buildMaxSensitivityScanPasses(width, height);
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

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, outW, outH);
    } catch {
      continue;
    }

    try {
      const symbols = await scanImageData(imageData, scanner);
      for (const symbol of symbols) {
        const text = symbol.decode().trim();
        if (text.length > 0) {
          return text;
        }
      }
    } catch {
      // keep trying next pass
    }
  }

  return null;
}
