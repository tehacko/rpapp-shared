/**
 * Still-image decode (file upload + video frame grab) with preprocessing pipeline.
 */
import { scanImageData } from '@undecaf/zbar-wasm';
import { prepareScanPayloadForEmit } from '../barcode/normalizeScanPayload.js';
import type { BarcodeScannerFormatProfile } from './scannerFormats.js';
import { resolveScannerFormatConfig } from './scannerFormats.js';
import { resolveScannerPlatformProfile } from './scannerPlatformProfile.js';
import { buildMaxSensitivityScanPasses } from './scannerScanPasses.js';
import {
  createConfiguredZbarScanner,
  isZbarWasmUrlConfigured,
} from './zbarWasmEngine.js';
import {
  createSensitiveZxingReader,
} from './zxingJsSensitiveDecode.js';
import './scannerNativeTypes.js';

export interface StillDecodeResult {
  readonly payload: string;
  readonly engine: 'zbar-wasm' | 'zxing' | 'native-detector';
}

function otsuThreshold(histogram: Uint32Array, total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i += 1) {
    sum += i * (histogram[i] ?? 0);
  }
  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 0;
  for (let t = 0; t < 256; t += 1) {
    wB += histogram[t] ?? 0;
    if (wB === 0) {
      continue;
    }
    const wF = total - wB;
    if (wF === 0) {
      break;
    }
    sumB += t * (histogram[t] ?? 0);
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * Grayscale → contrast stretch → Otsu binarization → optional 2× upscale.
 */
export function preprocessStillImageData(source: ImageData, upscale: boolean): ImageData {
  const { width, height, data } = source;
  const outW = upscale ? width * 2 : width;
  const outH = upscale ? height * 2 : height;
  const out = new ImageData(outW, outH);
  const histogram = new Uint32Array(256);
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    min = Math.min(min, gray);
    max = Math.max(max, gray);
    histogram[gray] = (histogram[gray] ?? 0) + 1;
  }

  const range = Math.max(1, max - min);
  const threshold = otsuThreshold(histogram, width * height);

  const writePixel = (x: number, y: number, gray: number): void => {
    const stretched = Math.round(((gray - min) / range) * 255);
    const bin = stretched > threshold ? 255 : 0;
    const idx = (y * outW + x) * 4;
    out.data[idx] = bin;
    out.data[idx + 1] = bin;
    out.data[idx + 2] = bin;
    out.data[idx + 3] = 255;
  };

  if (!upscale) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const gray = Math.round(
          0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0),
        );
        writePixel(x, y, gray);
      }
    }
    return out;
  }

  for (let y = 0; y < outH; y += 1) {
    for (let x = 0; x < outW; x += 1) {
      const sx = Math.min(width - 1, Math.floor(x / 2));
      const sy = Math.min(height - 1, Math.floor(y / 2));
      const i = (sy * width + sx) * 4;
      const gray = Math.round(
        0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0),
      );
      writePixel(x, y, gray);
    }
  }
  return out;
}

function decodeCanvasWithZxing(
  sourceCanvas: HTMLCanvasElement,
  workCanvas: HTMLCanvasElement,
  formatProfile: BarcodeScannerFormatProfile,
): string | null {
  const formatConfig = resolveScannerFormatConfig(formatProfile);
  const reader = createSensitiveZxingReader(formatConfig.zxingFormats);
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (width < 2 || height < 2) {
    return null;
  }
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) {
    return null;
  }
  ctx.imageSmoothingEnabled = false;
  const passes = buildMaxSensitivityScanPasses(width, height);
  for (const pass of passes) {
    const outW = Math.max(2, Math.floor(pass.sw * pass.scale));
    const outH = Math.max(2, Math.floor(pass.sh * pass.scale));
    workCanvas.width = outW;
    workCanvas.height = outH;
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(sourceCanvas, pass.sx, pass.sy, pass.sw, pass.sh, 0, 0, outW, outH);
    try {
      const result = reader.decodeFromCanvas(workCanvas);
      const text = result.getText();
      if (text.length > 0) {
        return text;
      }
    } catch {
      // try next pass
    }
  }
  return null;
}

async function decodeImageDataWithEngines(
  imageData: ImageData,
  canvas: HTMLCanvasElement,
  formatProfile: BarcodeScannerFormatProfile,
): Promise<StillDecodeResult | null> {
  const formatConfig = resolveScannerFormatConfig(formatProfile);
  const platform = resolveScannerPlatformProfile();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) {
    return null;
  }

  const attempts: ImageData[] = [imageData];
  attempts.push(preprocessStillImageData(imageData, false));
  if (platform.id === 'ios-safari' || platform.id === 'crios-ios' || platform.preferPreviewSnap) {
    attempts.push(preprocessStillImageData(imageData, true));
  }

  const workCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : canvas;

  for (const attempt of attempts) {
    canvas.width = attempt.width;
    canvas.height = attempt.height;
    ctx.putImageData(attempt, 0, 0);

    if (platform.nativeEnabled && typeof window !== 'undefined' && window.BarcodeDetector !== undefined) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const needs = formatConfig.nativeFormats;
        const ok = needs.every((f) => supported.includes(f));
        if (ok) {
          const detector = new window.BarcodeDetector({ formats: [...formatConfig.nativeFormats] });
          const results = await detector.detect(canvas);
          const first = results[0];
          if (first !== undefined) {
            const prepared = prepareScanPayloadForEmit(first.rawValue, formatProfile);
            if (prepared !== null) {
              return { payload: prepared, engine: 'native-detector' };
            }
          }
        }
      } catch {
        // continue
      }
    }

    if (isZbarWasmUrlConfigured()) {
      try {
        const scanner = await createConfiguredZbarScanner(formatProfile);
        try {
          const symbols = await scanImageData(attempt, scanner);
          for (const symbol of symbols) {
            const text = symbol.decode().trim();
            if (text.length > 0) {
              const prepared = prepareScanPayloadForEmit(text, formatProfile);
              if (prepared !== null) {
                return { payload: prepared, engine: 'zbar-wasm' };
              }
            }
          }
        } finally {
          scanner.destroy();
        }
      } catch {
        // continue
      }
    }

    const zxingText = decodeCanvasWithZxing(canvas, workCanvas, formatProfile);
    if (zxingText !== null) {
      const prepared = prepareScanPayloadForEmit(zxingText, formatProfile);
      if (prepared !== null) {
        return { payload: prepared, engine: 'zxing' };
      }
    }
  }

  return null;
}

async function loadImageFromFile(file: File): Promise<ImageData> {
  if (typeof document === 'undefined') {
    throw new Error('decodeBarcodeFromImageFile requires a browser document');
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = (): void => resolve(el);
      el.onerror = (): void => reject(new Error('Failed to load image'));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Canvas 2d unavailable');
    }
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function decodeBarcodeFromImageFile(
  file: File,
  formatProfile: BarcodeScannerFormatProfile = 'retail',
): Promise<StillDecodeResult | null> {
  if (typeof document === 'undefined') {
    return null;
  }
  const imageData = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  return decodeImageDataWithEngines(imageData, canvas, formatProfile);
}

export async function decodeBarcodeFromVideoFrame(
  video: HTMLVideoElement,
  formatProfile: BarcodeScannerFormatProfile = 'retail',
  canvas?: HTMLCanvasElement,
): Promise<StillDecodeResult | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width < 2 || height < 2) {
    return null;
  }
  const decodeCanvas =
    canvas ?? (typeof document !== 'undefined' ? document.createElement('canvas') : null);
  if (decodeCanvas === null) {
    return null;
  }
  const ctx = decodeCanvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) {
    return null;
  }
  decodeCanvas.width = width;
  decodeCanvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch {
    return null;
  }
  return decodeImageDataWithEngines(imageData, decodeCanvas, formatProfile);
}
