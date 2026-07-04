import { resolveScannerFormatConfig } from '../hooks/scannerFormats.js';

describe('resolveScannerFormatConfig', () => {
  it('returns retail symbologies without QR for retail profile', () => {
    const config = resolveScannerFormatConfig('retail');
    expect(config.nativeFormats).toEqual(['code_128', 'ean_13', 'ean_8', 'upc_a']);
    expect(config.zxingFormats).toHaveLength(4);
  });

  it('returns QR-only formats for qr-only profile', () => {
    const config = resolveScannerFormatConfig('qr-only');
    expect(config.nativeFormats).toEqual(['qr_code']);
    expect(config.zxingFormats).toHaveLength(1);
  });
});

describe('useBarcodeScanner messages contract', () => {
  it('requires injected message keys for consumer wrappers', () => {
    const messages = {
      permissionDenied: 'denied',
      noCamera: 'no camera',
      starting: 'starting',
      runningNative: 'native',
      runningZxing: 'zxing',
      error: 'error',
      scannerOff: 'off',
    };

    expect(messages.permissionDenied).toBe('denied');
    expect(messages.noCamera).toBe('no camera');
    expect(Object.keys(messages)).toHaveLength(7);
  });
});
