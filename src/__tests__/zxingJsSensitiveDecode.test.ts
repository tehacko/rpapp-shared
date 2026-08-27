/**
 * @jest-environment jsdom
 *
 * G8 — createSensitiveZxingReader must pass DecodeHintType.TRY_HARDER to
 * BrowserMultiFormatReader. Fails if the multi-pass path drops that hint.
 */
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { createSensitiveZxingReader } from '../hooks/zxingJsSensitiveDecode.js';

jest.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: jest.fn().mockImplementation((_hints?: Map<unknown, unknown>) => ({
    decodeFromCanvas: jest.fn(),
  })),
}));

jest.mock('@zxing/library', () => ({
  DecodeHintType: {
    POSSIBLE_FORMATS: 2,
    TRY_HARDER: 3,
  },
  BarcodeFormat: {
    CODE_128: 1,
    EAN_13: 2,
    EAN_8: 3,
    UPC_A: 4,
    QR_CODE: 5,
  },
}));

const BrowserMultiFormatReaderMock = BrowserMultiFormatReader as unknown as jest.Mock;

describe('createSensitiveZxingReader TRY_HARDER (G8)', () => {
  beforeEach(() => {
    BrowserMultiFormatReaderMock.mockClear();
  });

  it('constructs BrowserMultiFormatReader with hints.get(TRY_HARDER) === true', () => {
    createSensitiveZxingReader([BarcodeFormat.CODE_128, BarcodeFormat.EAN_13]);

    expect(BrowserMultiFormatReaderMock).toHaveBeenCalledTimes(1);
    const hints = BrowserMultiFormatReaderMock.mock.calls[0]?.[0] as Map<unknown, unknown>;
    expect(hints).toBeInstanceOf(Map);
    expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });

  it('also sets POSSIBLE_FORMATS from the formats argument', () => {
    const formats = [BarcodeFormat.QR_CODE] as const;
    createSensitiveZxingReader(formats);

    const hints = BrowserMultiFormatReaderMock.mock.calls[0]?.[0] as Map<unknown, unknown>;
    expect(hints.get(DecodeHintType.POSSIBLE_FORMATS)).toEqual([BarcodeFormat.QR_CODE]);
    expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });
});
