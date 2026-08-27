/**
 * High-sensitivity pure-JS @zxing decode (the library that previously worked).
 * Multi-pass digital zoom + TRY_HARDER for distant / small codes.
 */
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { buildMaxSensitivityScanPasses } from './scannerScanPasses.js';

export function createSensitiveZxingReader(
  formats: readonly BarcodeFormat[],
): BrowserMultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [...formats]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints);
}

/**
 * Decode one video frame via multi-pass canvas crops → @zxing decodeFromCanvas.
 * Returns the first payload or null when nothing is found.
 */
export function decodeVideoFrameWithZxingJs(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  reader: BrowserMultiFormatReader,
): string | null {
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

    try {
      const result = reader.decodeFromCanvas(canvas);
      const text = result.getText();
      if (text.length > 0) {
        return text;
      }
    } catch {
      // NotFoundException / checksum — try next pass
    }
  }

  return null;
}
