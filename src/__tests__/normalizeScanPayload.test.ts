import {
  isGtinCheckDigitValidForTest,
  normalizeScanPayload,
  prepareScanPayloadForEmit,
} from '../barcode/normalizeScanPayload.js';

describe('normalizeScanPayload', () => {
  it('trims whitespace', () => {
    expect(normalizeScanPayload('  8593807360153  ')).toBe('8593807360153');
  });

  it('strips ASCII control characters', () => {
    expect(normalizeScanPayload('8593807360153\u0007')).toBe('8593807360153');
  });
});

describe('prepareScanPayloadForEmit', () => {
  it('rejects invalid GTIN check digit for retail', () => {
    expect(prepareScanPayloadForEmit('5901234123458', 'retail')).toBeNull();
  });

  it('accepts valid EAN-13', () => {
    expect(prepareScanPayloadForEmit('8593807360153', 'retail')).toBe('8593807360153');
  });

  it('normalizes UPC-A 12-digit to EAN-13 with leading zero', () => {
    expect(prepareScanPayloadForEmit('012345678905', 'all')).toBe('0012345678905');
  });

  it('pads 12-digit UPC-A style to EAN-13 when check digit valid', () => {
    const upc = '012345678905';
    const digits = upc.replace(/\D/g, '');
    expect(isGtinCheckDigitValidForTest(`0${digits}`) || isGtinCheckDigitValidForTest(digits)).toBe(
      true,
    );
    const result = prepareScanPayloadForEmit(upc, 'retail');
    expect(result).not.toBeNull();
    expect(result?.length).toBeGreaterThanOrEqual(12);
  });

  it('qr-only profile skips GTIN check digit validation', () => {
    expect(prepareScanPayloadForEmit('not-a-gtin', 'qr-only')).toBe('not-a-gtin');
  });
});
