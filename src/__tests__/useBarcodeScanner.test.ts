/**
 * @jest-environment jsdom
 *
 * G7 / G21 — track.stop on disable/unmount; visibility-hidden camera release.
 * G4 / §13 Allow — getUserMedia allow → status running → onDecode (hook integration, not page E2E).
 * G5 — sensitivity/reliability regression guards (reader deltas, hi-res constraints,
 *      WASM bootstrap hard-fail, consecutive hard-decode fallthrough).
 * Format profile contract preserved (shared default remains retail).
 * Primary engine is zxing-wasm (ZXing-C++); pure-JS @zxing remains fallback.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { SCANNER_VIDEO_CONSTRAINTS } from '../hooks/scannerCameraConstraints.js';
import { resolveScannerFormatConfig } from '../hooks/scannerFormats.js';
import {
  useBarcodeScanner,
  type UseBarcodeScannerMessages,
} from '../hooks/useBarcodeScanner.js';
import {
  buildSensitiveReaderOptions,
  setZXingWasmUrl,
} from '../hooks/zxingWasmEngine.js';

const trackStop = jest.fn();
const zxingControlsStop = jest.fn();
const getUserMedia = jest.fn();
const prepareZXingModule = jest.fn();
const readBarcodes = jest.fn(async () => [] as Array<{ text: string }>);

type ZxingDecodeCallback = (
  result: { getText: () => string } | null | undefined,
  err: unknown,
  controls: { stop: () => void },
) => void;

const decodeFromStream = jest.fn(
  async (
    _stream: MediaStream,
    _video: HTMLVideoElement,
    _callback: ZxingDecodeCallback,
  ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
);

jest.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: jest.fn().mockImplementation(() => ({
    decodeFromStream: (
      stream: MediaStream,
      video: HTMLVideoElement,
      callback: ZxingDecodeCallback,
    ) => decodeFromStream(stream, video, callback),
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

jest.mock('zxing-wasm/reader', () => ({
  prepareZXingModule: (...args: unknown[]) =>
    (prepareZXingModule as (...a: unknown[]) => unknown)(...args),
  readBarcodes: (...args: unknown[]) =>
    (readBarcodes as (...a: unknown[]) => unknown)(...args),
}));

const messages: UseBarcodeScannerMessages = {
  permissionDenied: 'permission denied',
  noCamera: 'no camera',
  starting: 'starting',
  runningNative: 'native',
  runningZxing: 'zxing',
  error: 'error',
  scannerOff: 'off',
  wasmBootstrapFailed: 'wasm bootstrap failed',
};

function createVideoRef(): { current: HTMLVideoElement } {
  const video = document.createElement('video');
  Object.defineProperty(video, 'videoWidth', { configurable: true, get: () => 640 });
  Object.defineProperty(video, 'videoHeight', { configurable: true, get: () => 480 });
  Object.defineProperty(video, 'readyState', { configurable: true, get: () => 4 });
  video.play = jest.fn(async () => undefined) as unknown as HTMLVideoElement['play'];
  return { current: video };
}

function installMediaDevices(): void {
  const stream = {
    getTracks: () => [{ stop: trackStop }],
    getVideoTracks: () => [{ stop: trackStop }],
  } as unknown as MediaStream;
  getUserMedia.mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
}

/** Canvas path needed for zxing-wasm frame decode (G4 / G5 hard-fail tests). */
function stubCanvas2d(): jest.SpyInstance {
  const getContext = jest.fn(() => ({
    imageSmoothingEnabled: true,
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
  }));
  const originalCreateElement = document.createElement.bind(document);
  return jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
    const el = originalCreateElement(tagName);
    if (tagName === 'canvas') {
      (el as HTMLCanvasElement).getContext = getContext as unknown as HTMLCanvasElement['getContext'];
    }
    return el;
  }) as typeof document.createElement);
}

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

describe('buildSensitiveReaderOptions (G5)', () => {
  it.each(['retail', 'all', 'qr-only'] as const)(
    'includes tryDenoise:true and minLineCount:1 for %s',
    (profile) => {
      const options = buildSensitiveReaderOptions(profile);
      expect(options.tryDenoise).toBe(true);
      expect(options.minLineCount).toBe(1);
      expect(options.downscaleThreshold).toBe(800);
      expect(options.downscaleFactor).toBe(2);
    },
  );
});

describe('SCANNER_VIDEO_CONSTRAINTS (G5)', () => {
  it('requests max practical environment camera resolution', () => {
    expect(SCANNER_VIDEO_CONSTRAINTS).toEqual({
      facingMode: { ideal: 'environment' },
      width: { ideal: 3840, min: 1280 },
      height: { ideal: 2160, min: 720 },
      frameRate: { ideal: 30 },
    });
  });
});

describe('useBarcodeScanner messages contract', () => {
  it('requires injected message keys for consumer wrappers', () => {
    expect(messages.permissionDenied).toBe('permission denied');
    expect(messages.noCamera).toBe('no camera');
    expect(messages.wasmBootstrapFailed).toBe('wasm bootstrap failed');
    expect(Object.keys(messages)).toHaveLength(8);
  });
});

describe('useBarcodeScanner lifecycle (G7 / G21)', () => {
  let canvasSpy: jest.SpyInstance;

  beforeEach(() => {
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    prepareZXingModule.mockReset();
    // G1 — prepare may return void or a Promise; default resolves so await succeeds.
    prepareZXingModule.mockImplementation(() => Promise.resolve(undefined));
    readBarcodes.mockReset();
    readBarcodes.mockResolvedValue([]);
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    installMediaDevices();
    setZXingWasmUrl('/zxing_reader.wasm');
    canvasSpy = stubCanvas2d();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    canvasSpy.mockRestore();
  });

  /**
   * §13 Allow permission → scanner works (honest bar):
   * mediaDevices.getUserMedia resolves → status `running` → wasm decode → onDecode.
   * Hook integration only — not PlatformScanPage / browser permission UI E2E.
   */
  it('Allow getUserMedia → running → onDecode via zxing-wasm (G4 / §13)', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'RPAPP:{"v":1,"type":"salesPoint","sig":"allow-proof"}';

    readBarcodes.mockResolvedValue([{ text: decodedText }]);

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'qr-only',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(getUserMedia).toHaveBeenCalledWith({
      video: SCANNER_VIDEO_CONSTRAINTS,
      audio: false,
    });
    expect(result.current.engine).toBe('zxing-wasm');
    expect(result.current.errorMessage).toBeNull();
    expect(prepareZXingModule).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
  });

  it('stops MediaStream tracks when enabled becomes false', async () => {
    const videoRef = createVideoRef();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useBarcodeScanner({
          enabled,
          videoRef,
          onDecode: jest.fn(),
          messages,
        }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(getUserMedia).toHaveBeenCalled();
    expect(trackStop).not.toHaveBeenCalled();

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });
    expect(trackStop).toHaveBeenCalled();
  });

  it('stops MediaStream tracks on unmount', async () => {
    const videoRef = createVideoRef();
    const { result, unmount } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    unmount();
    expect(trackStop).toHaveBeenCalled();
  });

  it('releases camera on visibilitychange hidden and does not auto-restart on visible', async () => {
    const videoRef = createVideoRef();
    const onBackgroundStop = jest.fn();
    let hidden = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useBarcodeScanner({
          enabled,
          videoRef,
          onDecode: jest.fn(),
          messages,
          onBackgroundStop,
        }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    trackStop.mockClear();
    getUserMedia.mockClear();

    act(() => {
      hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(onBackgroundStop).toHaveBeenCalledTimes(1);
    });
    expect(trackStop).toHaveBeenCalled();
    expect(result.current.status).toBe('idle');

    act(() => {
      hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // G10/G7 — visible again must not restart while held off; parent syncs enabled=false.
    await act(async () => {
      await Promise.resolve();
    });
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');

    rerender({ enabled: false });
    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    getUserMedia.mockClear();
    rerender({ enabled: true });
    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(getUserMedia).toHaveBeenCalled();
  });

  it('releases camera on pagehide', async () => {
    const videoRef = createVideoRef();
    const onBackgroundStop = jest.fn();
    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
        onBackgroundStop,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    trackStop.mockClear();

    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    await waitFor(() => {
      expect(onBackgroundStop).toHaveBeenCalledTimes(1);
    });
    expect(trackStop).toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });
});

describe('useBarcodeScanner WASM bootstrap hard-fail (G3 / G5)', () => {
  beforeEach(() => {
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    prepareZXingModule.mockReset();
    prepareZXingModule.mockImplementation(() => Promise.resolve(undefined));
    readBarcodes.mockReset();
    readBarcodes.mockResolvedValue([]);
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    installMediaDevices();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    // Ensure no leftover prepared state from prior suites.
    setZXingWasmUrl('');
  });

  afterEach(() => {
    setZXingWasmUrl('/zxing_reader.wasm');
    prepareZXingModule.mockReset();
    prepareZXingModule.mockImplementation(() => Promise.resolve(undefined));
  });

  it('missing WASM URL → error wasmBootstrapFailed; does not start native/@zxing', async () => {
    setZXingWasmUrl('');
    const videoRef = createVideoRef();

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.errorMessage).toBe(messages.wasmBootstrapFailed);
    expect(result.current.engine).toBeNull();
    expect(prepareZXingModule).not.toHaveBeenCalled();
    expect(decodeFromStream).not.toHaveBeenCalled();
    expect(readBarcodes).not.toHaveBeenCalled();
  });

  it('empty setZXingWasmUrl clears config → error wasmBootstrapFailed', async () => {
    setZXingWasmUrl('/zxing_reader.wasm');
    setZXingWasmUrl('');
    const videoRef = createVideoRef();

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.errorMessage).toBe(messages.wasmBootstrapFailed);
    expect(result.current.engine).not.toBe('zxing-wasm');
    expect(result.current.engine).not.toBe('zxing');
    expect(result.current.engine).not.toBe('native-detector');
    expect(decodeFromStream).not.toHaveBeenCalled();
  });

  it('prepareZXingModule throws → error wasmBootstrapFailed; does not start @zxing', async () => {
    setZXingWasmUrl('/zxing_reader.wasm');
    prepareZXingModule.mockImplementation(() => {
      throw new Error('prepare failed');
    });
    const videoRef = createVideoRef();

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.errorMessage).toBe(messages.wasmBootstrapFailed);
    expect(result.current.engine).toBeNull();
    expect(decodeFromStream).not.toHaveBeenCalled();
  });

  it('prepareZXingModule rejects Promise (async instantiate failure) → wasmBootstrapFailed; no native/@zxing', async () => {
    setZXingWasmUrl('/zxing_reader.wasm');
    prepareZXingModule.mockImplementation(() =>
      Promise.reject(new Error('async instantiate failed')),
    );
    const videoRef = createVideoRef();

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.errorMessage).toBe(messages.wasmBootstrapFailed);
    expect(result.current.engine).toBeNull();
    expect(result.current.engine).not.toBe('zxing');
    expect(result.current.engine).not.toBe('native-detector');
    expect(result.current.engine).not.toBe('zxing-wasm');
    expect(decodeFromStream).not.toHaveBeenCalled();
    expect(readBarcodes).not.toHaveBeenCalled();
    expect(prepareZXingModule).toHaveBeenCalledWith(
      expect.objectContaining({ fireImmediately: true }),
    );
  });

  it('getUserMedia uses SCANNER_VIDEO_CONSTRAINTS high-res environment', async () => {
    setZXingWasmUrl('/zxing_reader.wasm');
    const createElementSpy = stubCanvas2d();
    const videoRef = createVideoRef();

    try {
      const { result } = renderHook(() =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
        }),
      );

      await waitFor(() => {
        expect(result.current.status).toBe('running');
      });
      expect(getUserMedia).toHaveBeenCalledWith({
        video: SCANNER_VIDEO_CONSTRAINTS,
        audio: false,
      });
    } finally {
      createElementSpy.mockRestore();
    }
  });
});

describe('useBarcodeScanner WASM hard-decode fallthrough (G4 / G5)', () => {
  beforeEach(() => {
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    prepareZXingModule.mockReset();
    prepareZXingModule.mockImplementation(() => Promise.resolve(undefined));
    readBarcodes.mockReset();
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    installMediaDevices();
    setZXingWasmUrl('/zxing_reader.wasm');
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    // Force @zxing fallthrough path (no BarcodeDetector in this suite).
    Reflect.deleteProperty(window, 'BarcodeDetector');
  });

  it('after ≥8 consecutive hard readBarcodes rejects → falls through to @zxing', async () => {
    readBarcodes.mockRejectedValue(new Error('wasm hard decode reject'));
    const createElementSpy = stubCanvas2d();
    const videoRef = createVideoRef();

    try {
      const { result } = renderHook(() =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
          formatProfile: 'retail',
        }),
      );

      await waitFor(() => {
        expect(result.current.status).toBe('running');
        expect(result.current.engine).toBe('zxing-wasm');
      });

      await waitFor(
        () => {
          expect(result.current.engine).toBe('zxing');
        },
        { timeout: 5000 },
      );

      expect(decodeFromStream).toHaveBeenCalled();
      expect(result.current.status).toBe('running');
      expect(result.current.errorMessage).toBeNull();
      expect(readBarcodes.mock.calls.length).toBeGreaterThanOrEqual(8);
    } finally {
      createElementSpy.mockRestore();
    }
  });

  /**
   * G5 — null/empty decode resets consecutiveWasmHardFails (WASM_HARD_FAIL_BOUND = 8).
   * Multi-pass: one hard-fail frame = first readBarcodes throw. Soft frame = enough [] for all passes.
   */
  it(
    'null/empty decode between rejects resets hard-fail counter (stays on zxing-wasm)',
    async () => {
      let hardFailFrames = 0;
      let softReadsRemaining = 0;
      let completedSoftInjection = false;

      readBarcodes.mockImplementation(async () => {
        if (softReadsRemaining > 0) {
          softReadsRemaining -= 1;
          return [];
        }
        hardFailFrames += 1;
        if (hardFailFrames >= 7 && !completedSoftInjection) {
          completedSoftInjection = true;
          hardFailFrames = 0;
          softReadsRemaining = 24;
          throw new Error('wasm hard decode reject (pre-soft)');
        }
        throw new Error(`wasm hard decode reject #${hardFailFrames}`);
      });
      const createElementSpy = stubCanvas2d();
      const videoRef = createVideoRef();

      try {
        const { result } = renderHook(() =>
          useBarcodeScanner({
            enabled: true,
            videoRef,
            onDecode: jest.fn(),
            messages,
            formatProfile: 'retail',
          }),
        );

        await waitFor(() => {
          expect(result.current.status).toBe('running');
          expect(result.current.engine).toBe('zxing-wasm');
        });

        await waitFor(
          () => {
            expect(completedSoftInjection).toBe(true);
            expect(hardFailFrames).toBeGreaterThanOrEqual(7);
          },
          { timeout: 12000 },
        );

        expect(result.current.engine).toBe('zxing-wasm');
        expect(decodeFromStream).not.toHaveBeenCalled();
        expect(result.current.status).toBe('running');
        expect(result.current.errorMessage).toBeNull();
      } finally {
        createElementSpy.mockRestore();
      }
    },
    15000,
  );
});
