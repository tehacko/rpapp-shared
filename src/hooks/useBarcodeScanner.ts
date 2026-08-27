import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import './scannerNativeTypes.js';
import type { ScannerEngine } from './selectEngine.js';
import {
  resolveScannerFormatConfig,
  type BarcodeScannerFormatProfile,
} from './scannerFormats.js';
import {
  applyScannerTrackEnhancements,
  SCANNER_VIDEO_CONSTRAINTS,
} from './scannerCameraConstraints.js';
import {
  buildSensitiveReaderOptions,
  decodeVideoFrameWithZxingWasm,
  ensureZXingWasmPrepared,
  isZXingWasmConfigured,
} from './zxingWasmEngine.js';

export type ScannerStatus = 'idle' | 'starting' | 'running' | 'denied' | 'error';

export interface UseBarcodeScannerMessages {
  permissionDenied: string;
  noCamera: string;
  starting: string;
  runningNative: string;
  runningZxing: string;
  error: string;
  scannerOff: string;
  /** G3 — high-sensitivity WASM missing / prepare failed (no silent weaker-engine fallthrough). */
  wasmBootstrapFailed: string;
}

export interface UseBarcodeScannerOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDecode: (rawValue: string) => void;
  messages: UseBarcodeScannerMessages;
  formatProfile?: BarcodeScannerFormatProfile;
  /**
   * G7 — fired when the tab/page backgrounds and the hook releases the camera.
   * Parent should set `enabled` false so the CTA must be tapped again (no auto-restart).
   */
  onBackgroundStop?: () => void;
}

export interface UseBarcodeScannerReturn {
  status: ScannerStatus;
  engine: ScannerEngine | null;
  errorMessage: string | null;
}

/** ~30 fps decode budget — multi-pass zoom is heavier; still prefer hit rate. */
const WASM_MIN_FRAME_INTERVAL_MS = 32;

/** G4 — consecutive hard decode rejects before abandoning zxing-wasm for native/@zxing.
 * Only after successful WASM instantiate; unloadable WASM is G3 bootstrap error. */
const WASM_HARD_FAIL_BOUND = 8;

/**
 * Live camera barcode/QR decode.
 *
 * Runtime cascade (single SoT — no selectBarcodeScannerEngine helper):
 * 1. Configured ZXing-C++ WASM (required for sensitivity upgrade; missing URL /
 *    unloadable asset / instantiate fail → G3 `wasmBootstrapFailed`, no weaker-engine fallthrough)
 * 2. After WASM is successfully instantiated and running: ≥{@link WASM_HARD_FAIL_BOUND}
 *    consecutive hard decode rejects → native BarcodeDetector (G4 only — not bootstrap)
 * 3. then pure-JS @zxing/browser
 */
export function useBarcodeScanner(options: UseBarcodeScannerOptions): UseBarcodeScannerReturn {
  const {
    enabled,
    videoRef,
    onDecode,
    messages,
    formatProfile = 'retail',
    onBackgroundStop,
  } = options;

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [engine, setEngine] = useState<ScannerEngine | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Latches after background release until parent sets `enabled` false (G7 / G10). */
  const [heldOffByBackground, setHeldOffByBackground] = useState(false);

  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const onBackgroundStopRef = useRef(onBackgroundStop);
  useEffect(() => {
    onBackgroundStopRef.current = onBackgroundStop;
  }, [onBackgroundStop]);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const stopRef = useRef<(() => void) | null>(null);

  if (!enabled && heldOffByBackground) {
    setHeldOffByBackground(false);
  }

  const scanningEnabled = enabled && !heldOffByBackground;

  const [trackedEnabled, setTrackedEnabled] = useState(scanningEnabled);
  if (trackedEnabled !== scanningEnabled) {
    setTrackedEnabled(scanningEnabled);
    if (!scanningEnabled) {
      setStatus('idle');
      setEngine(null);
      setErrorMessage(null);
    }
  }

  const stop = useCallback((): void => {
    if (stopRef.current !== null) {
      stopRef.current();
      stopRef.current = null;
    }
  }, []);

  // G7 — release camera on background; do not auto-restart on visible.
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const releaseForBackground = (): void => {
      stop();
      if (!enabledRef.current) {
        return;
      }
      setHeldOffByBackground(true);
      setStatus('idle');
      setEngine(null);
      setErrorMessage(null);
      onBackgroundStopRef.current?.();
    };

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        releaseForBackground();
      }
    };

    const onPageHide = (): void => {
      releaseForBackground();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [stop]);

  useEffect(() => {
    if (!scanningEnabled) {
      stop();
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let zxingControls: { stop: () => void } | null = null;
    let nativeFrameHandle: number | null = null;
    let wasmFrameHandle: number | null = null;
    let wasmBusy = false;
    let wasmAbandoned = false;
    let consecutiveWasmHardFails = 0;
    const formatConfig = resolveScannerFormatConfig(formatProfile);
    const wasmCanvas =
      typeof document !== 'undefined' ? document.createElement('canvas') : null;

    const cleanup = (): void => {
      if (zxingControls !== null) {
        try {
          zxingControls.stop();
        } catch {
          // ignore teardown errors
        }
        zxingControls = null;
      }
      if (nativeFrameHandle !== null) {
        cancelAnimationFrame(nativeFrameHandle);
        nativeFrameHandle = null;
      }
      if (wasmFrameHandle !== null) {
        cancelAnimationFrame(wasmFrameHandle);
        wasmFrameHandle = null;
      }
      if (stream !== null) {
        for (const track of stream.getTracks()) {
          try {
            track.stop();
          } catch {
            // ignore teardown errors
          }
        }
        stream = null;
      }
      const video = videoRef.current;
      if (video !== null) {
        video.srcObject = null;
      }
    };
    stopRef.current = cleanup;

    void (async (): Promise<void> => {
      setStatus('starting');
      setErrorMessage(null);

      if (typeof navigator === 'undefined' || navigator.mediaDevices === undefined) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.noCamera);
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: SCANNER_VIDEO_CONSTRAINTS,
          audio: false,
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        const isPermissionDenied =
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
        if (isPermissionDenied) {
          setStatus('denied');
          setErrorMessage(messagesRef.current.permissionDenied);
        } else {
          setStatus('error');
          setErrorMessage(messagesRef.current.error);
        }
        cleanup();
        return;
      }

      const activeStream = stream;
      const [primaryTrack] = activeStream.getVideoTracks();
      if (primaryTrack !== undefined) {
        await applyScannerTrackEnhancements(primaryTrack);
      }

      const video = videoRef.current;
      if (video === null) {
        cleanup();
        return;
      }
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.srcObject = activeStream;
      try {
        await video.play();
      } catch {
        // autoplay may fail; frames remain readable
      }

      if (cancelled) {
        cleanup();
        return;
      }

      const startNativeLoop = (): boolean => {
        if (window.BarcodeDetector === undefined) {
          return false;
        }
        const detector = new window.BarcodeDetector({
          formats: [...formatConfig.nativeFormats],
        });
        const tick = async (): Promise<void> => {
          if (cancelled || video.readyState < 2) {
            nativeFrameHandle = requestAnimationFrame(() => {
              void tick();
            });
            return;
          }
          try {
            const results = await detector.detect(video);
            if (results.length > 0) {
              const first = results[0];
              if (first !== undefined) {
                onDecodeRef.current(first.rawValue);
              }
            }
          } catch {
            // unstable frames may throw; keep scanning
          }
          if (!cancelled) {
            nativeFrameHandle = requestAnimationFrame(() => {
              void tick();
            });
          }
        };
        nativeFrameHandle = requestAnimationFrame(() => {
          void tick();
        });
        return true;
      };

      const startZxingJsFallback = async (): Promise<boolean> => {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [...formatConfig.zxingFormats]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints);
        try {
          zxingControls = await reader.decodeFromStream(
            activeStream,
            video,
            (result, _err, controls: { stop: () => void }) => {
              if (cancelled) {
                controls.stop();
                return;
              }
              if (result !== undefined && result !== null) {
                onDecodeRef.current(result.getText());
              }
            },
          );
          return true;
        } catch {
          return false;
        }
      };

      const failAllEngines = (): void => {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.error);
        }
        cleanup();
      };

      const fallThroughFromWasm = async (): Promise<void> => {
        if (cancelled) {
          return;
        }
        if (startNativeLoop()) {
          if (!cancelled) {
            setEngine('native-detector');
            setStatus('running');
          }
          return;
        }
        const jsOk = await startZxingJsFallback();
        if (cancelled) {
          return;
        }
        if (jsOk) {
          setEngine('zxing');
          setStatus('running');
          return;
        }
        failAllEngines();
      };

      const failWasmBootstrap = (): void => {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.wasmBootstrapFailed);
        }
        cleanup();
      };

      // G3 — WASM is required for the sensitivity upgrade; never silently start a weaker engine.
      // Unloadable / instantiate failure → wasmBootstrapFailed (not G4 fallthrough).
      // G4 ≥8 fallthrough is ONLY for post-start decode rejects after successful instantiate.
      if (!isZXingWasmConfigured() || wasmCanvas === null) {
        failWasmBootstrap();
        return;
      }
      try {
        await ensureZXingWasmPrepared();
      } catch {
        failWasmBootstrap();
        return;
      }

      const readerOptions = buildSensitiveReaderOptions(formatProfile);
      let lastAttemptMs = 0;

      const abandonWasmAndFallThrough = (): void => {
        if (wasmAbandoned || cancelled) {
          return;
        }
        wasmAbandoned = true;
        if (wasmFrameHandle !== null) {
          cancelAnimationFrame(wasmFrameHandle);
          wasmFrameHandle = null;
        }
        void fallThroughFromWasm();
      };

      const tick = (): void => {
        if (cancelled || wasmAbandoned) {
          return;
        }
        const now = performance.now();
        if (
          !wasmBusy &&
          video.readyState >= 2 &&
          now - lastAttemptMs >= WASM_MIN_FRAME_INTERVAL_MS
        ) {
          lastAttemptMs = now;
          wasmBusy = true;
          void decodeVideoFrameWithZxingWasm(video, wasmCanvas, readerOptions)
            .then((text) => {
              if (cancelled || wasmAbandoned) {
                return;
              }
              // G4 — null/empty = non-fatal; reset consecutive hard-fail counter.
              consecutiveWasmHardFails = 0;
              if (text !== null) {
                onDecodeRef.current(text);
              }
            })
            .catch(() => {
              if (cancelled || wasmAbandoned) {
                return;
              }
              consecutiveWasmHardFails += 1;
              if (consecutiveWasmHardFails >= WASM_HARD_FAIL_BOUND) {
                abandonWasmAndFallThrough();
              }
            })
            .finally(() => {
              wasmBusy = false;
            });
        }
        if (!cancelled && !wasmAbandoned) {
          wasmFrameHandle = requestAnimationFrame(tick);
        }
      };

      wasmFrameHandle = requestAnimationFrame(tick);
      if (!cancelled) {
        setEngine('zxing-wasm');
        setStatus('running');
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
      stopRef.current = null;
    };
  }, [scanningEnabled, formatProfile, stop, videoRef]);

  return { status, engine, errorMessage };
}

