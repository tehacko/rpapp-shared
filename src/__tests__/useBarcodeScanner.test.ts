/**
 * @jest-environment jsdom
 *
 * Primary engine: ZBar WASM multi-pass (+ native BarcodeDetector + frame-0 @zxing assist).
 * G3: ZBar URL missing or boot fail → degradedMode, status running, @zxing/native (not error).
 * G4: frame-0 @zxing assist (immediate); distance zoom still after SCANNER_DISTANCE_ZOOM_DELAY_MS.
 * G7 / G21 — track.stop on disable/unmount; visibility-hidden camera release.
 * G8 — BrowserMultiFormatReader constructor must receive TRY_HARDER (distinct describe).
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { resolveScannerFormatConfig } from '../hooks/scannerFormats.js';
import {
  openScannerMediaStream,
  SCANNER_VIDEO_CONSTRAINTS,
  SCANNER_VIDEO_CONSTRAINT_FALLBACKS,
} from '../hooks/scannerCameraConstraints.js';
import {
  SCANNER_DISTANCE_ASSIST_DELAY_MS,
  SCANNER_DISTANCE_ZOOM_DELAY_MS,
  SCANNER_POST_DECODE_COOLDOWN_MS,
  useBarcodeScanner,
  type UseBarcodeScannerMessages,
} from '../hooks/useBarcodeScanner.js';
import {
  createConfiguredZbarScanner,
  decodeVideoFrameWithZbar,
  isZbarWasmUrlConfigured,
} from '../hooks/zbarWasmEngine.js';
import type { ScannerPlatformProfile } from '../hooks/scannerPlatformProfile.js';

const platformProfileState: {
  id: ScannerPlatformProfile['id'];
  preferPreviewSnap: boolean;
  nativeEnabled: boolean;
  zbarFullPassEveryFrame: boolean;
  zxingFrameZero: boolean;
} = {
  id: 'generic',
  preferPreviewSnap: false,
  nativeEnabled: false,
  zbarFullPassEveryFrame: false,
  zxingFrameZero: true,
};

jest.mock('../hooks/scannerPlatformProfile.js', () => ({
  resolveScannerPlatformProfile: (): ScannerPlatformProfile => ({ ...platformProfileState }),
  getScannerPlatformProfile: (): ScannerPlatformProfile => ({ ...platformProfileState }),
}));

const trackStop = jest.fn();
const zxingControlsStop = jest.fn();
const getUserMedia = jest.fn();
const decodeFromCanvas = jest.fn();

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

/** Records constructor `hints` Map args for G8 TRY_HARDER assertions. */
jest.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: jest.fn().mockImplementation((_hints?: Map<unknown, unknown>) => ({
    decodeFromStream: (
      stream: MediaStream,
      video: HTMLVideoElement,
      callback: ZxingDecodeCallback,
    ) => decodeFromStream(stream, video, callback),
    decodeFromCanvas: (canvas: HTMLCanvasElement) => decodeFromCanvas(canvas),
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

/** Default: ZBar boots; decode returns null until tests override. */
jest.mock('../hooks/zbarWasmEngine.js', () => ({
  createConfiguredZbarScanner: jest.fn(async () => ({ destroy: jest.fn() })),
  decodeVideoFrameWithZbar: jest.fn(async () => null),
  setZbarWasmUrl: jest.fn(),
  isZbarWasmUrlConfigured: jest.fn(() => true),
  resetZbarWasmUrlForTests: jest.fn(),
}));

const createConfiguredZbarScannerMock = createConfiguredZbarScanner as jest.MockedFunction<
  typeof createConfiguredZbarScanner
>;
const decodeVideoFrameWithZbarMock = decodeVideoFrameWithZbar as jest.MockedFunction<
  typeof decodeVideoFrameWithZbar
>;
const isZbarWasmUrlConfiguredMock = isZbarWasmUrlConfigured as jest.MockedFunction<
  typeof isZbarWasmUrlConfigured
>;

const BrowserMultiFormatReaderMock = BrowserMultiFormatReader as unknown as jest.Mock;

function readerConstructorHintMaps(): Map<unknown, unknown>[] {
  return BrowserMultiFormatReaderMock.mock.calls.map(
    (call) => call[0] as Map<unknown, unknown>,
  );
}

const messages: UseBarcodeScannerMessages = {
  permissionDenied: 'permission denied',
  noCamera: 'no camera',
  starting: 'starting',
  runningNative: 'native',
  runningZxing: 'zxing',
  error: 'error',
  scannerOff: 'off',
  insecureContext: 'insecure context',
  zbarBootstrapFailed: 'zbar bootstrap failed',
  runningZbar: 'running zbar',
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

describe('SCANNER_VIDEO_CONSTRAINTS', () => {
  it('requests environment camera with soft ideal resolution (no hard mins)', () => {
    expect(SCANNER_VIDEO_CONSTRAINTS).toEqual({
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    });
    expect(SCANNER_VIDEO_CONSTRAINT_FALLBACKS).toHaveLength(4);
    expect(SCANNER_VIDEO_CONSTRAINT_FALLBACKS[3]).toBe(true);
  });
});

describe('openScannerMediaStream', () => {
  it('falls back when the preferred constraints are overconstrained', async () => {
    const stream = { getTracks: () => [], getVideoTracks: () => [] } as unknown as MediaStream;
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('overconstrained', 'OverconstrainedError'))
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(2);
  });

  it('G2: NotAllowedError on preferred continues to later rungs', async () => {
    const stream = { getTracks: () => [], getVideoTracks: () => [] } as unknown as MediaStream;
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'))
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(2);
  });

  it('G2: NotAllowedError on final video:true rung throws without a fifth attempt', async () => {
    const denied = new DOMException('denied-final', 'NotAllowedError');
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('denied-1', 'NotAllowedError'))
      .mockRejectedValueOnce(new DOMException('denied-2', 'NotAllowedError'))
      .mockRejectedValueOnce(new DOMException('denied-3', 'NotAllowedError'))
      .mockRejectedValueOnce(denied);

    await expect(openScannerMediaStream(gum)).rejects.toBe(denied);
    expect(gum).toHaveBeenCalledTimes(4);
    expect(gum.mock.calls[3]?.[0]).toEqual({ video: true, audio: false });
  });
});

describe('useBarcodeScanner messages contract', () => {
  it('requires core injected message keys', () => {
    expect(messages.permissionDenied).toBe('permission denied');
    expect(messages.noCamera).toBe('no camera');
  });
});

describe('useBarcodeScanner lifecycle (G7 / G21)', () => {
  let canvasSpy: jest.SpyInstance;

  beforeEach(() => {
    platformProfileState.id = 'generic';
    platformProfileState.preferPreviewSnap = false;
    platformProfileState.nativeEnabled = false;
    platformProfileState.zbarFullPassEveryFrame = false;
    platformProfileState.zxingFrameZero = true;
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    decodeFromCanvas.mockClear();
    BrowserMultiFormatReaderMock.mockClear();
    createConfiguredZbarScannerMock.mockReset();
    decodeVideoFrameWithZbarMock.mockReset();
    isZbarWasmUrlConfiguredMock.mockReset();
    createConfiguredZbarScannerMock.mockResolvedValue({ destroy: jest.fn() } as never);
    decodeVideoFrameWithZbarMock.mockResolvedValue(null);
    isZbarWasmUrlConfiguredMock.mockReturnValue(true);
    decodeFromCanvas.mockImplementation(() => {
      throw new Error('NotFoundException');
    });
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    installMediaDevices();
    canvasSpy = stubCanvas2d();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    canvasSpy.mockRestore();
    Reflect.deleteProperty(window, 'BarcodeDetector');
    jest.useRealTimers();
  });

  it('surfaces insecure-context recovery copy without calling getUserMedia', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef: createVideoRef(),
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.errorMessage).toBe('insecure context');
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('G9: four-rung Overconstrained exhaustion yields status error not denied', async () => {
    // Always-reject (not Once) so remounts cannot fall through to a success.
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() =>
      Promise.reject(new DOMException('overconstrained-last', 'OverconstrainedError')),
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    // Stable ref — creating inside the render callback retriggers the GUM effect forever.
    const videoRefG9 = createVideoRef();
    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef: videoRefG9,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.status).not.toBe('denied');
    expect(result.current.errorMessage).toBe('error');
    expect(getUserMedia.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(getUserMedia.mock.calls.some((call) => call[0]?.video === true)).toBe(true);
  });

  it('G2: NotAllowedError only on final rung yields status denied', async () => {
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() =>
      Promise.reject(new DOMException('hard-deny', 'NotAllowedError')),
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const videoRefG2 = createVideoRef();
    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef: videoRefG2,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
    expect(result.current.errorMessage).toBe('permission denied');
    expect(getUserMedia.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('G10: secure context + NotAllowedError on every constraint ladder rung → denied + permissionDenied', async () => {
    // G2 final: NotAllowed is retried on early rungs — reject every ladder step so
    // the outcome is deny (never fall through to installMediaDevices success).
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });

    // Stable ref — creating inside the render callback retriggers the GUM effect forever.
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
      expect(result.current.status).toBe('denied');
      expect(result.current.errorMessage).toBe(messages.permissionDenied);
    });
    expect(result.current.errorMessage).not.toBe(messages.insecureContext);
    // G2 ladder exhausts all rungs (StrictMode remount may double the attempt count).
    expect(getUserMedia.mock.calls.length).toBeGreaterThanOrEqual(
      SCANNER_VIDEO_CONSTRAINT_FALLBACKS.length,
    );
    expect(getUserMedia.mock.calls.some((call) => call[0]?.video === true)).toBe(true);
  });

  it('sessionKey bump restarts getUserMedia while enabled stays true', async () => {
    const videoRef = createVideoRef();
    const { result, rerender } = renderHook(
      (props: { sessionKey: number }) =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
          sessionKey: props.sessionKey,
        }),
      { initialProps: { sessionKey: 0 } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    const callsAfterStart = getUserMedia.mock.calls.length;
    trackStop.mockClear();

    rerender({ sessionKey: 1 });

    await waitFor(() => {
      expect(getUserMedia.mock.calls.length).toBeGreaterThan(callsAfterStart);
      expect(result.current.status).toBe('running');
    });
    expect(trackStop).toHaveBeenCalled();
  });

  it('sessionKey retry after deny invokes getUserMedia only via effect restart (G8)', async () => {
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const videoRef = createVideoRef();
    const { result, rerender } = renderHook(
      (props: { sessionKey: number }) =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
          sessionKey: props.sessionKey,
        }),
      { initialProps: { sessionKey: 0 } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
    const callsAfterDeny = getUserMedia.mock.calls.length;
    expect(callsAfterDeny).toBeGreaterThanOrEqual(SCANNER_VIDEO_CONSTRAINT_FALLBACKS.length);

    rerender({ sessionKey: 1 });

    await waitFor(() => {
      expect(getUserMedia.mock.calls.length).toBeGreaterThan(callsAfterDeny);
    });
    const callsFromRetry = getUserMedia.mock.calls.length - callsAfterDeny;
    expect(callsFromRetry).toBeLessThanOrEqual(SCANNER_VIDEO_CONSTRAINT_FALLBACKS.length);
    expect(callsFromRetry).toBeGreaterThanOrEqual(1);
  });

  it('preAcquiredStreamRef skips getUserMedia when session restarts (pattern A)', async () => {
    const preAcquiredStreamRef = { current: null as MediaStream | null };
    const handedOffStream = {
      getTracks: () => [{ stop: trackStop }],
      getVideoTracks: () => [{ stop: trackStop }],
    } as unknown as MediaStream;
    preAcquiredStreamRef.current = handedOffStream;

    const videoRef = createVideoRef();
    const { result, rerender } = renderHook(
      (props: { sessionKey: number }) =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
          sessionKey: props.sessionKey,
          preAcquiredStreamRef,
        }),
      { initialProps: { sessionKey: 0 } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    const callsAfterStart = getUserMedia.mock.calls.length;
    trackStop.mockClear();
    preAcquiredStreamRef.current = handedOffStream;

    rerender({ sessionKey: 1 });

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(getUserMedia.mock.calls.length).toBe(callsAfterStart);
    expect(trackStop).toHaveBeenCalled();
  });

  it('Allow getUserMedia → running → onDecode via ZBar WASM', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'RPAPP:{"v":1,"type":"salesPoint","sig":"allow-proof"}';

    decodeVideoFrameWithZbarMock.mockResolvedValue(decodedText);

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
    expect(result.current.engine).toBe('zbar-wasm');
    expect(result.current.errorMessage).toBeNull();
    expect(createConfiguredZbarScannerMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
  });

  function zoomCapableStream(applyConstraints: jest.Mock, getCapabilities: jest.Mock): MediaStream {
    return {
      getTracks: () => [
        {
          stop: trackStop,
          getCapabilities,
          applyConstraints,
        },
      ],
      getVideoTracks: () => [
        {
          stop: trackStop,
          getCapabilities,
          applyConstraints,
        },
      ],
    } as unknown as MediaStream;
  }

  function zoomCalls(applyConstraints: jest.Mock): unknown[][] {
    return applyConstraints.mock.calls.filter((call) => {
      const advanced = (call[0] as { advanced?: Array<Record<string, unknown>> })?.advanced;
      return advanced?.some((c) => 'zoom' in c) === true;
    });
  }

  it('G4: no optical zoom on open (focus/torch only; zoom constrained out of enhancements)', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
      zoom: { min: 1, max: 4, step: 1 },
    });
    getUserMedia.mockResolvedValue(zoomCapableStream(applyConstraints, getCapabilities));

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode,
          messages,
          formatProfile: 'retail',
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    expect(applyConstraints).toHaveBeenCalled();
    expect(zoomCalls(applyConstraints)).toHaveLength(0);
    expect(decodeFromCanvas).not.toHaveBeenCalled();
  });

  it('G4: @zxing assist starts on frame 0 — zoom not yet applied', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      zoom: { min: 1, max: 4, step: 1 },
    });
    getUserMedia.mockResolvedValue(zoomCapableStream(applyConstraints, getCapabilities));

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode,
          messages,
          formatProfile: 'retail',
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    await waitFor(() => {
      expect(decodeFromStream).toHaveBeenCalled();
    });
    expect(result.current.zxingAssistActive).toBe(true);
    expect(applyConstraints).not.toHaveBeenCalled();
    expect(zoomCalls(applyConstraints)).toHaveLength(0);
    expect(decodeFromCanvas).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('G4: after distance assist delay, optical zoom ladder may run on ZBar path', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      zoom: { min: 1, max: 4, step: 1 },
    });
    getUserMedia.mockResolvedValue(zoomCapableStream(applyConstraints, getCapabilities));

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode,
          messages,
          formatProfile: 'retail',
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    await act(async () => {
      jest.advanceTimersByTime(SCANNER_DISTANCE_ASSIST_DELAY_MS);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(zoomCalls(applyConstraints).length).toBeGreaterThan(0);
    });

    jest.useRealTimers();
  });

  it('G4: decode before zoom delay cancels zoom — zoom never applied', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'CLOSE-CODE-BEFORE-ZOOM';
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      zoom: { min: 1, max: 4, step: 1 },
    });
    getUserMedia.mockResolvedValue(zoomCapableStream(applyConstraints, getCapabilities));

    decodeVideoFrameWithZbarMock.mockResolvedValue(decodedText);

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode,
          messages,
          formatProfile: 'retail',
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
    expect(decodeVideoFrameWithZbarMock).toHaveBeenCalled();
    expect(zoomCalls(applyConstraints)).toHaveLength(0);

    await act(async () => {
      jest.advanceTimersByTime(SCANNER_DISTANCE_ASSIST_DELAY_MS);
      await Promise.resolve();
    });

    expect(zoomCalls(applyConstraints)).toHaveLength(0);

    jest.useRealTimers();
  });

  it('Chrome BarcodeDetector parallel assist fills onDecode while stream alone never fires', async () => {
    platformProfileState.nativeEnabled = true;
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = '8593807360153';
    const detect = jest.fn(async () => [{ rawValue: decodedText }]);
    Object.defineProperty(window, 'BarcodeDetector', {
      configurable: true,
      writable: true,
      value: Object.assign(
        jest.fn().mockImplementation(() => ({ detect })),
        {
          getSupportedFormats: jest.fn(async () => [
            'code_128',
            'ean_13',
            'ean_8',
            'upc_a',
            'qr_code',
          ]),
        },
      ),
    });

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.engine).toBe('zbar-wasm');
    expect(window.BarcodeDetector).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
    expect(detect).toHaveBeenCalled();
  });

  it('ZBar WASM primary boots → engine zbar-wasm; frame-0 @zxing assist also starts', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = '5901234123457';
    const destroy = jest.fn();
    createConfiguredZbarScannerMock.mockResolvedValue({
      destroy,
    } as never);
    decodeVideoFrameWithZbarMock.mockResolvedValue(decodedText);

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.engine).toBe('zbar-wasm');
    expect(result.current.degradedMode).toBe(false);
    expect(decodeFromStream).toHaveBeenCalled();
    expect(createConfiguredZbarScannerMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
  });

  it('G3: ZBar URL not configured → degradedMode true, running, decodeFromStream called', async () => {
    isZbarWasmUrlConfiguredMock.mockReturnValue(false);
    const videoRef = createVideoRef();

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.degradedMode).toBe(true);
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();
    expect(decodeFromStream).toHaveBeenCalled();
    expect(createConfiguredZbarScannerMock).not.toHaveBeenCalled();
  });

  it('G3: ZBar boot failure → degradedMode true, running, zxing decode works', async () => {
    createConfiguredZbarScannerMock.mockRejectedValue(new Error('wasm load failed'));
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const zxingText = '8593807360153';

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => {
        const controls = { stop: zxingControlsStop };
        queueMicrotask(() => {
          callback({ getText: () => zxingText }, undefined, controls);
        });
        return controls;
      },
    );

    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode,
          messages,
          formatProfile: 'retail',
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.degradedMode).toBe(true);
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();
    expect(decodeFromStream).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(zxingText);
    });
  });

  it('G4: ZBar running but no decode → frame-0 @zxing assist decodes; early ZBar decode wins', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const zxingText = '8593807360153';

    decodeVideoFrameWithZbarMock.mockResolvedValue(null);
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => {
        const controls = { stop: zxingControlsStop };
        queueMicrotask(() => {
          callback({ getText: () => zxingText }, undefined, controls);
        });
        return controls;
      },
    );

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.engine).toBe('zbar-wasm');
    expect(result.current.degradedMode).toBe(false);

    await waitFor(() => {
      expect(decodeFromStream).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(zxingText);
    });

    jest.useRealTimers();
  });

  it('G4 parallel: ZBar decode wins over frame-0 @zxing when ZBar finds code first', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const zbarText = '5901234123457';

    decodeVideoFrameWithZbarMock.mockImplementation(async () => {
      await Promise.resolve();
      return zbarText;
    });

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
      }),
    );

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(zbarText);
    });
    expect(result.current.engine).toBe('zbar-wasm');
    expect(decodeFromStream).toHaveBeenCalled();
    expect(onDecode).toHaveBeenCalledTimes(1);
  });

  it('G5: ZBar boot fail + canvas unavailable → degraded running, native assist when probe ok', async () => {
    const originalImpl = canvasSpy.getMockImplementation();
    expect(originalImpl).toBeDefined();
    canvasSpy.mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        throw new Error('canvas unavailable');
      }
      return (originalImpl as (tag: string) => HTMLElement)(tagName);
    }) as typeof document.createElement);

    createConfiguredZbarScannerMock.mockRejectedValue(new Error('boot failed'));

    const detect = jest.fn(async () => []);
    Object.defineProperty(window, 'BarcodeDetector', {
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation(() => ({ detect })),
    });

    decodeFromStream.mockRejectedValue(new Error('decodeFromStream unavailable'));

    const videoRef = createVideoRef();
    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.degradedMode).toBe(true);
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();
    expect(decodeFromStream).toHaveBeenCalled();
  });

  it('G5: canvas unavailable → ZBar cannot start → degraded @zxing boot', async () => {
    const originalImpl = canvasSpy.getMockImplementation();
    expect(originalImpl).toBeDefined();
    canvasSpy.mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        throw new Error('canvas unavailable');
      }
      return (originalImpl as (tag: string) => HTMLElement)(tagName);
    }) as typeof document.createElement);

    const videoRef = createVideoRef();
    const { result } = renderHook(
      () =>
        useBarcodeScanner({
          enabled: true,
          videoRef,
          onDecode: jest.fn(),
          messages,
        }),
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.degradedMode).toBe(true);
    expect(result.current.engine).toBe('zxing');
    expect(createConfiguredZbarScannerMock).not.toHaveBeenCalled();
    expect(decodeFromStream).toHaveBeenCalled();
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

  it('G4: null videoRef after GUM → status error, tracks stopped, errorMessage set', async () => {
    const videoRef = { current: null as HTMLVideoElement | null };

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
    expect(result.current.status).not.toBe('idle');
    expect(result.current.errorMessage).toBe(messages.error);
    expect(trackStop).toHaveBeenCalled();
    expect(createConfiguredZbarScannerMock).not.toHaveBeenCalled();
  });

  it('G4: cancel while @zxing assist active → zxingControlsStop + tracks stopped', async () => {
    let resolveDecode!: (controls: { stop: () => void }) => void;
    const pendingDecode = new Promise<{ stop: () => void }>((resolve) => {
      resolveDecode = resolve;
    });
    decodeFromStream.mockImplementation(
      (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => pendingDecode,
    );

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

    await waitFor(() => {
      expect(decodeFromStream).toHaveBeenCalled();
    });
    expect(zxingControlsStop).not.toHaveBeenCalled();

    unmount();

    await act(async () => {
      resolveDecode({ stop: zxingControlsStop });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(zxingControlsStop).toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
  });

  it('G5: unmount while GUM pending → tracks stopped after resolve (no orphan)', async () => {
    let resolveGum!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>((resolve) => {
      resolveGum = resolve;
    });
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() => pending);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    // Stable ref — creating inside the render callback retriggers the GUM effect forever.
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
      expect(getUserMedia).toHaveBeenCalled();
    });
    expect(result.current.status).toBe('starting');

    unmount();

    const stream = {
      getTracks: () => [{ stop: trackStop }],
      getVideoTracks: () => [{ stop: trackStop }],
    } as unknown as MediaStream;

    await act(async () => {
      resolveGum(stream);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(trackStop).toHaveBeenCalled();
    expect(decodeFromStream).not.toHaveBeenCalled();
  });

  it('G5: disable while GUM pending → tracks stopped after resolve', async () => {
    let resolveGum!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>((resolve) => {
      resolveGum = resolve;
    });
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(() => pending);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

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
      expect(getUserMedia).toHaveBeenCalled();
    });
    expect(result.current.status).toBe('starting');

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });

    const stream = {
      getTracks: () => [{ stop: trackStop }],
      getVideoTracks: () => [{ stop: trackStop }],
    } as unknown as MediaStream;

    await act(async () => {
      resolveGum(stream);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(trackStop).toHaveBeenCalled();
  });

  it('G5: cancel after GUM during video.play → tracks stopped', async () => {
    const videoRef = createVideoRef();
    let resolvePlay!: () => void;
    videoRef.current.play = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePlay = resolve;
        }),
    ) as unknown as HTMLVideoElement['play'];

    const { result, unmount } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
      }),
    );

    await waitFor(() => {
      expect(videoRef.current.play).toHaveBeenCalled();
    });
    expect(result.current.status).toBe('starting');
    expect(trackStop).not.toHaveBeenCalled();

    unmount();
    expect(trackStop).toHaveBeenCalled();

    await act(async () => {
      resolvePlay();
      await Promise.resolve();
    });

    expect(decodeFromStream).not.toHaveBeenCalled();
  });

  it('dedupe: same normalized payload within 800ms emits onDecode once', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    let perfNow = 1_000;
    const perfSpy = jest.spyOn(performance, 'now').mockImplementation(() => perfNow);
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const payload = '8593807360153';

    decodeVideoFrameWithZbarMock.mockResolvedValue(payload);

    renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledTimes(1);
    });

    decodeVideoFrameWithZbarMock.mockClear();
    onDecode.mockClear();

    perfNow = 1_300;
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onDecode).not.toHaveBeenCalled();

    perfSpy.mockRestore();
    jest.useRealTimers();
  });

  it('dedupe: after 800ms and post-decode re-arm, same payload may emit again', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    let perfNow = 1_000;
    const perfSpy = jest.spyOn(performance, 'now').mockImplementation(() => perfNow);
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const payload = '8593807360153';

    decodeVideoFrameWithZbarMock.mockResolvedValue(payload);

    renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledTimes(1);
    });

    decodeVideoFrameWithZbarMock.mockResolvedValue(payload);
    perfNow = 1_000 + SCANNER_POST_DECODE_COOLDOWN_MS + 250;

    await act(async () => {
      jest.advanceTimersByTime(SCANNER_POST_DECODE_COOLDOWN_MS + 50);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(onDecode.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    perfSpy.mockRestore();
    jest.useRealTimers();
  });

  it('same-tick parallel engines coalesce to one onDecode', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const payload = '8593807360153';

    decodeVideoFrameWithZbarMock.mockImplementation(async () => payload);
    platformProfileState.nativeEnabled = true;
    const detect = jest.fn(async () => [{ rawValue: payload }]);
    Object.defineProperty(window, 'BarcodeDetector', {
      configurable: true,
      writable: true,
      value: Object.assign(
        jest.fn().mockImplementation(() => ({ detect })),
        {
          getSupportedFormats: jest.fn(async () => [
            'code_128',
            'ean_13',
            'ean_8',
            'upc_a',
            'qr_code',
          ]),
        },
      ),
    });

    renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'all',
      }),
    );

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledTimes(1);
      expect(onDecode).toHaveBeenCalledWith(payload);
    });
  });

  it('invalid GTIN checksum is rejected and scanning continues', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const invalidPayload = '8593807360154';
    const validPayload = '8593807360153';
    let zbarCalls = 0;

    decodeVideoFrameWithZbarMock.mockImplementation(async () => {
      zbarCalls += 1;
      return zbarCalls === 1 ? invalidPayload : validPayload;
    });

    renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'retail',
      }),
    );

    await waitFor(
      () => {
        expect(onDecode).toHaveBeenCalledTimes(1);
        expect(onDecode).toHaveBeenCalledWith(validPayload);
      },
      { timeout: 5000 },
    );
    expect(onDecode).not.toHaveBeenCalledWith(invalidPayload);
  });

  it('degradedMode is false when ZBar boots successfully', async () => {
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
      expect(result.current.status).toBe('running');
    });
    expect(result.current.degradedMode).toBe(false);
    expect(result.current.engine).toBe('zbar-wasm');
  });

  it('G8: SecurityError → status error + policyBlocked (not denied)', async () => {
    getUserMedia.mockReset();
    getUserMedia.mockRejectedValue(
      new DOMException('Permissions policy', 'SecurityError'),
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const messagesWithPolicy: UseBarcodeScannerMessages = {
      ...messages,
      policyBlocked: 'policy blocked',
    };

    const videoRef = createVideoRef();
    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages: messagesWithPolicy,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.status).not.toBe('denied');
    expect(result.current.errorMessage).toBe('policy blocked');
  });
});

/**
 * G8 — stream + multi-pass readers must be constructed with TRY_HARDER.
 * Distinct describe so G5 edits elsewhere in this file do not collide.
 */
describe('useBarcodeScanner TRY_HARDER hints (G8)', () => {
  let canvasSpy: jest.SpyInstance;

  beforeEach(() => {
    platformProfileState.id = 'generic';
    platformProfileState.preferPreviewSnap = false;
    platformProfileState.nativeEnabled = false;
    platformProfileState.zbarFullPassEveryFrame = false;
    platformProfileState.zxingFrameZero = true;
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    decodeFromCanvas.mockClear();
    BrowserMultiFormatReaderMock.mockClear();
    createConfiguredZbarScannerMock.mockReset();
    decodeVideoFrameWithZbarMock.mockReset();
    isZbarWasmUrlConfiguredMock.mockReset();
    createConfiguredZbarScannerMock.mockResolvedValue({ destroy: jest.fn() } as never);
    decodeVideoFrameWithZbarMock.mockResolvedValue(null);
    isZbarWasmUrlConfiguredMock.mockReturnValue(true);
    decodeFromCanvas.mockImplementation(() => {
      throw new Error('NotFoundException');
    });
    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    installMediaDevices();
    canvasSpy = stubCanvas2d();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    canvasSpy.mockRestore();
  });

  it('passes TRY_HARDER=true to @zxing assist readers on frame 0', async () => {
    const videoRef = createVideoRef();

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
    });

    await waitFor(() => {
      expect(BrowserMultiFormatReaderMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const hintMaps = readerConstructorHintMaps();
    for (const hints of hintMaps) {
      expect(hints).toBeInstanceOf(Map);
      expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
    }
  });

  it('stream-path @zxing assist receives TRY_HARDER on frame 0', async () => {
    const videoRef = createVideoRef();

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode: jest.fn(),
        messages,
        formatProfile: 'qr-only',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });

    await waitFor(() => {
      expect(decodeFromStream).toHaveBeenCalled();
    });

    const streamHints = BrowserMultiFormatReaderMock.mock.calls[0]?.[0] as Map<
      unknown,
      unknown
    >;
    expect(streamHints).toBeInstanceOf(Map);
    expect(streamHints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });

  it('G4: zxingAssistActive becomes true when parallel @zxing assist starts on frame 0', async () => {
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
      expect(result.current.status).toBe('running');
    });

    await waitFor(() => {
      expect(result.current.zxingAssistActive).toBe(true);
    });
  });

  it('G3: zxingAssistActive clears after successful ZBar decode', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    decodeVideoFrameWithZbarMock.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
      expect(result.current.zxingAssistActive).toBe(true);
    });

    decodeVideoFrameWithZbarMock.mockResolvedValueOnce('8593807360153');
    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith('8593807360153');
      expect(result.current.zxingAssistActive).toBe(false);
    });

    jest.useRealTimers();
  });

  it('G3: zxingAssistActive clears on disable and restart without stale assist UI', async () => {
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
      expect(result.current.zxingAssistActive).toBe(true);
    });

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.zxingAssistActive).toBe(false);
    });

    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    expect(result.current.zxingAssistActive).toBe(true);

    jest.useRealTimers();
  });

  it('G8: chrome-android profile uses full ZBar pass every tick (quickOnly false)', async () => {
    jest.useFakeTimers();
    platformProfileState.id = 'chrome-android';
    platformProfileState.zbarFullPassEveryFrame = true;
    platformProfileState.nativeEnabled = true;

    decodeVideoFrameWithZbarMock.mockResolvedValue(null);
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
      expect(result.current.status).toBe('running');
    });

    decodeVideoFrameWithZbarMock.mockClear();

    for (let i = 0; i < 3; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(decodeVideoFrameWithZbarMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    for (const call of decodeVideoFrameWithZbarMock.mock.calls.slice(0, 3)) {
      expect((call[3] as { quickOnly?: boolean })?.quickOnly).toBe(false);
    }

    jest.useRealTimers();
  });

  it('G8: desktop zbarFullPassEveryFrame — quickOnly always false', async () => {
    jest.useFakeTimers();
    platformProfileState.id = 'chrome-desktop';
    platformProfileState.zbarFullPassEveryFrame = true;
    platformProfileState.nativeEnabled = true;

    decodeVideoFrameWithZbarMock.mockResolvedValue(null);
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
      expect(result.current.status).toBe('running');
    });

    decodeVideoFrameWithZbarMock.mockClear();

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(decodeVideoFrameWithZbarMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    for (const call of decodeVideoFrameWithZbarMock.mock.calls.slice(0, 3)) {
      expect((call[3] as { quickOnly?: boolean })?.quickOnly).toBe(false);
    }

    jest.useRealTimers();
  });

  it('G8: mobile uses full pass until p95 budget exceeded, then throttles', async () => {
    jest.useFakeTimers();
    platformProfileState.id = 'generic';
    platformProfileState.zbarFullPassEveryFrame = false;
    platformProfileState.nativeEnabled = false;
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });

    decodeVideoFrameWithZbarMock.mockImplementation(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 30);
      });
      return null;
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
      expect(result.current.status).toBe('running');
    });

    decodeVideoFrameWithZbarMock.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      await Promise.resolve();
    });

    const firstCalls = decodeVideoFrameWithZbarMock.mock.calls.slice(0, 2);
    expect(firstCalls.length).toBeGreaterThanOrEqual(1);
    expect((firstCalls[0][3] as { quickOnly?: boolean })?.quickOnly).toBe(false);

    for (let i = 0; i < 12; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    const throttled = decodeVideoFrameWithZbarMock.mock.calls.some(
      (call) => (call[3] as { quickOnly?: boolean })?.quickOnly === true,
    );
    expect(throttled).toBe(true);

    jest.useRealTimers();
  });

  it('G8: ZBar throttles every 2nd tick when p95 exceeds 25ms (low cores)', async () => {
    jest.useFakeTimers();
    platformProfileState.zbarFullPassEveryFrame = false;
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 2,
    });
    decodeVideoFrameWithZbarMock.mockImplementation(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 30);
      });
      return null;
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
      expect(result.current.status).toBe('running');
    });

    decodeVideoFrameWithZbarMock.mockClear();

    for (let i = 0; i < 12; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(decodeVideoFrameWithZbarMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    const throttled = decodeVideoFrameWithZbarMock.mock.calls.some(
      (call) => (call[3] as { quickOnly?: boolean })?.quickOnly === true,
    );
    const fullPass = decodeVideoFrameWithZbarMock.mock.calls.some(
      (call) => (call[3] as { quickOnly?: boolean })?.quickOnly === false,
    );
    expect(throttled).toBe(true);
    expect(fullPass).toBe(true);

    jest.useRealTimers();
  });

  it('G10: @zxing stream assist failure starts multi-pass loop on frame 0', async () => {
    jest.useFakeTimers();
    decodeFromStream.mockRejectedValue(new Error('decodeFromStream unavailable'));
    decodeFromCanvas.mockImplementation(() => {
      throw new Error('NotFoundException');
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
      expect(result.current.status).toBe('running');
    });

    decodeFromCanvas.mockClear();

    await waitFor(() => {
      expect(decodeFromStream).toHaveBeenCalled();
    });

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    expect(decodeFromCanvas).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
