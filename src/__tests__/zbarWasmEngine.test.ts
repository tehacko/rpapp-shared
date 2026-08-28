/**
 * @jest-environment jsdom
 */
import {
  createConfiguredZbarScanner,
  decodeVideoFrameWithZbar,
  isZbarWasmUrlConfigured,
  resetZbarWasmUrlForTests,
  setZbarWasmUrl,
} from '../hooks/zbarWasmEngine.js';
import { buildMaxSensitivityScanPasses, buildQuickScanPass } from '../hooks/scannerScanPasses.js';

const scanImageDataMock = jest.fn();

jest.mock('@undecaf/zbar-wasm', () => ({
  scanImageData: (...args: unknown[]) => scanImageDataMock(...args),
  setModuleArgs: jest.fn(),
  ZBarConfigType: {
    ZBAR_CFG_ENABLE: 0,
    ZBAR_CFG_X_DENSITY: 256,
    ZBAR_CFG_Y_DENSITY: 257,
    ZBAR_CFG_TEST_INVERTED: 129,
  },
  ZBarScanner: {
    create: jest.fn(async () => ({
      setConfig: jest.fn(),
      enableCache: jest.fn(),
      destroy: jest.fn(),
    })),
  },
  ZBarSymbolType: { ZBAR_NONE: 0, ZBAR_EAN13: 13, ZBAR_QRCODE: 64 },
}));

describe('zbarWasmEngine boot policy', () => {
  beforeEach(() => {
    resetZbarWasmUrlForTests();
    scanImageDataMock.mockReset();
    scanImageDataMock.mockResolvedValue([]);
  });

  it('createConfiguredZbarScanner throws when setZbarWasmUrl was not called', async () => {
    await expect(createConfiguredZbarScanner('retail')).rejects.toThrow(/not configured/i);
    expect(isZbarWasmUrlConfigured()).toBe(false);
  });

  it('setZbarWasmUrl marks engine configured for createConfiguredZbarScanner', async () => {
    setZbarWasmUrl('/assets/zbar.wasm');
    expect(isZbarWasmUrlConfigured()).toBe(true);
    await expect(createConfiguredZbarScanner('retail')).resolves.toBeDefined();
  });
});

describe('decodeVideoFrameWithZbar', () => {
  const scanner = {
    setConfig: jest.fn(),
    enableCache: jest.fn(),
    destroy: jest.fn(),
  };

  let getContextMock: jest.Mock;

  beforeEach(() => {
    resetZbarWasmUrlForTests();
    setZbarWasmUrl('/assets/zbar.wasm');
    scanImageDataMock.mockReset();
    scanImageDataMock.mockResolvedValue([]);
    getContextMock = jest.fn(() => ({
      imageSmoothingEnabled: true,
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 2,
        height: 2,
      })),
    }));
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(getContextMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createVideo(width: number, height: number): HTMLVideoElement {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: width, configurable: true });
    Object.defineProperty(video, 'videoHeight', { value: height, configurable: true });
    return video;
  }

  it('returns null when video dimensions are too small', async () => {
    const video = createVideo(1, 1);
    const canvas = document.createElement('canvas');
    await expect(decodeVideoFrameWithZbar(video, canvas, scanner as never)).resolves.toBeNull();
    expect(scanImageDataMock).not.toHaveBeenCalled();
  });

  it('quickOnly uses a single full-frame pass', async () => {
    const video = createVideo(640, 480);
    const canvas = document.createElement('canvas');
    await decodeVideoFrameWithZbar(video, canvas, scanner as never, { quickOnly: true });
    expect(getContextMock).toHaveBeenCalled();
    expect(scanImageDataMock).toHaveBeenCalledTimes(buildQuickScanPass(640, 480).length);
  });

  it('full mode uses multi-pass sensitivity crops', async () => {
    const video = createVideo(640, 480);
    const canvas = document.createElement('canvas');
    await decodeVideoFrameWithZbar(video, canvas, scanner as never, { quickOnly: false });
    expect(scanImageDataMock).toHaveBeenCalledTimes(
      buildMaxSensitivityScanPasses(640, 480).length,
    );
  });

  it('returns decoded text from the first symbol', async () => {
    scanImageDataMock.mockResolvedValueOnce([
      { decode: () => '8593807360153' },
    ]);
    const video = createVideo(640, 480);
    const canvas = document.createElement('canvas');
    await expect(
      decodeVideoFrameWithZbar(video, canvas, scanner as never, { quickOnly: true }),
    ).resolves.toBe('8593807360153');
  });
});
