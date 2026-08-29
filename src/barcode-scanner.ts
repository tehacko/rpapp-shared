export {
  useBarcodeScanner,
  type UseBarcodeScannerMessages,
  type UseBarcodeScannerOptions,
  type UseBarcodeScannerReturn,
  type ScannerStatus,
  SCANNER_DISTANCE_ASSIST_DELAY_MS,
  SCANNER_DISTANCE_ZOOM_DELAY_MS,
  SCANNER_ZBAR_ZXING_ASSIST_DELAY_MS,
  SCANNER_POST_DECODE_COOLDOWN_MS,
} from './hooks/useBarcodeScanner.js';
export type { ScannerEngine } from './hooks/selectEngine.js';
export {
  resolveScannerFormatConfig,
  type BarcodeScannerFormatProfile,
  type ScannerFormatConfig,
} from './hooks/scannerFormats.js';
export {
  SCANNER_VIDEO_CONSTRAINTS,
  SCANNER_VIDEO_CONSTRAINT_FALLBACKS,
  openScannerMediaStream,
  applyScannerTrackEnhancements,
  applyScannerDistanceZoom,
  resolvePreferredOpticalZoom,
  SCANNER_OPTICAL_ZOOM_POLICY,
} from './hooks/scannerCameraConstraints.js';
export {
  setZbarWasmUrl,
  isZbarWasmUrlConfigured,
} from './hooks/zbarWasmEngine.js';
export {
  resolveScannerPlatformProfile,
  type ScannerPlatformProfile,
  type ScannerPlatformProfileId,
} from './hooks/scannerPlatformProfile.js';
export {
  decodeBarcodeFromImageFile,
  decodeBarcodeFromVideoFrame,
  preprocessStillImageData,
  type StillDecodeResult,
} from './hooks/decodeStillImage.js';
export {
  normalizeScanPayload,
  prepareScanPayloadForEmit,
} from './barcode/normalizeScanPayload.js';

