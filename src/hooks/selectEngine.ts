import { resolveScannerFormatConfig, type BarcodeScannerFormatProfile } from './scannerFormats.js';
import './scannerNativeTypes.js';

export type ScannerEngine = 'native-detector' | 'zxing';

export async function selectBarcodeScannerEngine(
  formatProfile: BarcodeScannerFormatProfile = 'retail',
): Promise<ScannerEngine> {
  if (typeof window === 'undefined' || window.BarcodeDetector === undefined) {
    return 'zxing';
  }

  const { nativeFormats } = resolveScannerFormatConfig(formatProfile);

  try {
    const supported = (await window.BarcodeDetector.getSupportedFormats()).map((value) =>
      value.toLowerCase(),
    );
    const ok = nativeFormats.every((format) => supported.includes(format));
    return ok ? 'native-detector' : 'zxing';
  } catch {
    return 'zxing';
  }
}
