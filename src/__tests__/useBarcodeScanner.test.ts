/**
 * @jest-environment jsdom
 *
 * Primary engine: pure-JS @zxing with multi-pass digital zoom + TRY_HARDER.
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
  useBarcodeScanner,
  type UseBarcodeScannerMessages,
} from '../hooks/useBarcodeScanner.js';

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
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    decodeFromCanvas.mockClear();
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

  it('Allow getUserMedia → running → onDecode via @zxing decodeFromStream', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'RPAPP:{"v":1,"type":"salesPoint","sig":"allow-proof"}';

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => {
        const controls = { stop: zxingControlsStop };
        queueMicrotask(() => {
          callback({ getText: () => decodedText }, undefined, controls);
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
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();
    expect(decodeFromStream).toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
  });

  it('also runs multi-pass canvas decode alongside stream for distance sensitivity', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'DISTANT-CODE-128';

    decodeFromStream.mockImplementation(
      async (
        _stream: MediaStream,
        _video: HTMLVideoElement,
        _callback: ZxingDecodeCallback,
      ): Promise<{ stop: () => void }> => ({ stop: zxingControlsStop }),
    );
    decodeFromCanvas.mockImplementation(() => ({
      getText: () => decodedText,
    }));

    const { result } = renderHook(() =>
      useBarcodeScanner({
        enabled: true,
        videoRef,
        onDecode,
        messages,
        formatProfile: 'retail',
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('running');
    });
    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
    expect(decodeFromCanvas).toHaveBeenCalled();
  });

  it('G5: stream fail + canvas multi-pass can start → engine zxing, not native-detector', async () => {
    const onDecode = jest.fn();
    const videoRef = createVideoRef();
    const decodedText = 'MULTI-PASS-ONLY';
    const detect = jest.fn(async () => []);
    Object.defineProperty(window, 'BarcodeDetector', {
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation(() => ({ detect })),
    });

    decodeFromStream.mockRejectedValue(new Error('decodeFromStream unavailable'));
    decodeFromCanvas.mockImplementation(() => ({
      getText: () => decodedText,
    }));

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
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();
    expect(decodeFromStream).toHaveBeenCalled();
    expect(window.BarcodeDetector).not.toHaveBeenCalled();
    expect(detect).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onDecode).toHaveBeenCalledWith(decodedText);
    });
  });

  it('G5: stream and multi-pass both fail to start → error, never native-only', async () => {
    const originalImpl = canvasSpy.getMockImplementation();
    expect(originalImpl).toBeDefined();
    canvasSpy.mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        throw new Error('canvas unavailable');
      }
      return (originalImpl as (tag: string) => HTMLElement)(tagName);
    }) as typeof document.createElement);

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
      // Avoid Strict Mode cancel racing the hard-fail path (status stuck at starting).
      { reactStrictMode: false },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.engine).toBeNull();
    expect(result.current.errorMessage).toBe(messages.error);
    expect(window.BarcodeDetector).not.toHaveBeenCalled();
    expect(detect).not.toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
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
    expect(decodeFromStream).not.toHaveBeenCalled();
  });

  it('G4: cancel while decodeFromStream pending → zxingControlsStop + tracks stopped', async () => {
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
      expect(getUserMedia).toHaveBeenCalled();
      expect(decodeFromStream).toHaveBeenCalled();
    });
    expect(result.current.status).toBe('starting');
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
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
    decodeFromCanvas.mockClear();
    BrowserMultiFormatReaderMock.mockClear();
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

  it('passes TRY_HARDER=true to every BrowserMultiFormatReader (stream + sensitive multi-pass)', async () => {
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

    // Production constructs: (1) stream fallback reader (2) createSensitiveZxingReader
    expect(BrowserMultiFormatReaderMock.mock.calls.length).toBeGreaterThanOrEqual(2);

    const hintMaps = readerConstructorHintMaps();
    expect(hintMaps.length).toBeGreaterThanOrEqual(2);
    for (const hints of hintMaps) {
      expect(hints).toBeInstanceOf(Map);
      expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
    }
  });

  it('stream-path reader receives TRY_HARDER on first BrowserMultiFormatReader construction', async () => {
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
    expect(decodeFromStream).toHaveBeenCalled();

    const streamHints = BrowserMultiFormatReaderMock.mock.calls[0]?.[0] as Map<
      unknown,
      unknown
    >;
    expect(streamHints).toBeInstanceOf(Map);
    expect(streamHints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });
});
