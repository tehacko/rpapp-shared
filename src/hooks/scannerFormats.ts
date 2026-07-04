import { BarcodeFormat } from '@zxing/library';

export type BarcodeScannerFormatProfile = 'retail' | 'qr-only' | 'all';

export const REQUIRED_NATIVE_FORMATS_RETAIL = [
  'code_128',
  'ean_13',
  'ean_8',
  'upc_a',
] as const;

export const REQUIRED_NATIVE_FORMATS_QR_ONLY = ['qr_code'] as const;

export const REQUIRED_NATIVE_FORMATS_ALL = [
  ...REQUIRED_NATIVE_FORMATS_RETAIL,
  'qr_code',
] as const;

const ZXING_RETAIL_FORMATS: BarcodeFormat[] = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
];

const ZXING_QR_ONLY_FORMATS: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

const ZXING_ALL_FORMATS: BarcodeFormat[] = [...ZXING_RETAIL_FORMATS, BarcodeFormat.QR_CODE];

export interface ScannerFormatConfig {
  readonly nativeFormats: readonly string[];
  readonly zxingFormats: readonly BarcodeFormat[];
}

export function resolveScannerFormatConfig(
  formatProfile: BarcodeScannerFormatProfile = 'retail',
): ScannerFormatConfig {
  if (formatProfile === 'qr-only') {
    return {
      nativeFormats: REQUIRED_NATIVE_FORMATS_QR_ONLY,
      zxingFormats: ZXING_QR_ONLY_FORMATS,
    };
  }
  if (formatProfile === 'all') {
    return {
      nativeFormats: REQUIRED_NATIVE_FORMATS_ALL,
      zxingFormats: ZXING_ALL_FORMATS,
    };
  }
  return {
    nativeFormats: REQUIRED_NATIVE_FORMATS_RETAIL,
    zxingFormats: ZXING_RETAIL_FORMATS,
  };
}
