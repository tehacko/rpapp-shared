/**
 * @jest-environment jsdom
 *
 * G7 / G21 — track.stop on disable/unmount; visibility-hidden camera release.
 * G4 / §13 Allow — getUserMedia allow → status running → onDecode (hook integration, not page E2E).
 * Format profile contract preserved (shared default remains retail).
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { resolveScannerFormatConfig } from '../hooks/scannerFormats.js';
import {
  useBarcodeScanner,
  type UseBarcodeScannerMessages,
} from '../hooks/useBarcodeScanner.js';

const trackStop = jest.fn();
const zxingControlsStop = jest.fn();
const getUserMedia = jest.fn();

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

jest.mock('../hooks/selectEngine.js', () => ({
  selectBarcodeScannerEngine: jest.fn(async () => 'zxing' as const),
}));

const messages: UseBarcodeScannerMessages = {
  permissionDenied: 'permission denied',
  noCamera: 'no camera',
  starting: 'starting',
  runningNative: 'native',
  runningZxing: 'zxing',
  error: 'error',
  scannerOff: 'off',
};

function createVideoRef(): { current: HTMLVideoElement } {
  const video = document.createElement('video');
  video.play = jest.fn(async () => undefined) as unknown as HTMLVideoElement['play'];
  return { current: video };
}

function installMediaDevices(): void {
  const stream = {
    getTracks: () => [{ stop: trackStop }],
  } as unknown as MediaStream;
  getUserMedia.mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
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

describe('useBarcodeScanner messages contract', () => {
  it('requires injected message keys for consumer wrappers', () => {
    expect(messages.permissionDenied).toBe('permission denied');
    expect(messages.noCamera).toBe('no camera');
    expect(Object.keys(messages)).toHaveLength(7);
  });
});

describe('useBarcodeScanner lifecycle (G7 / G21)', () => {
  beforeEach(() => {
    trackStop.mockClear();
    zxingControlsStop.mockClear();
    getUserMedia.mockClear();
    decodeFromStream.mockClear();
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
  });

  /**
   * §13 Allow permission → scanner works (honest bar):
   * mediaDevices.getUserMedia resolves → status `running` → zxing decode callback → onDecode.
   * Hook integration only — not PlatformScanPage / browser permission UI E2E.
   */
  it('Allow getUserMedia → running → onDecode (G4 / §13)', async () => {
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
        callback({ getText: () => decodedText }, undefined, controls);
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
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.anything(),
        audio: false,
      }),
    );
    expect(result.current.engine).toBe('zxing');
    expect(result.current.errorMessage).toBeNull();

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
