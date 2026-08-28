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
  applyScannerDistanceZoom,
  applyScannerTrackEnhancements,
  openScannerMediaStream,
} from './scannerCameraConstraints.js';
import {
  createSensitiveZxingReader,
  decodeVideoFrameWithZxingJs,
} from './zxingJsSensitiveDecode.js';
import {
  createConfiguredZbarScanner,
  decodeVideoFrameWithZbar,
  isZbarWasmUrlConfigured,
} from './zbarWasmEngine.js';

export type ScannerStatus = 'idle' | 'starting' | 'running' | 'denied' | 'error';

/**
 * Optical zoom on ZBar primary path (focus/torch only on open).
 */
export const SCANNER_DISTANCE_ASSIST_DELAY_MS = 1500;

/**
 * After ZBar is running with no decode, start @zxing stream + multi-pass in
 * parallel (does not stop ZBar — G4 safety net for close EANs ZBar misses).
 */
export const SCANNER_ZBAR_ZXING_ASSIST_DELAY_MS = SCANNER_DISTANCE_ASSIST_DELAY_MS;

/**
 * Extra wait after @zxing multi-pass starts before optical zoom on the rare
 * legacy @zxing-only path (unused when G3 hard-fail is active).
 */
export const SCANNER_DISTANCE_ZOOM_DELAY_MS = 1500;

export interface UseBarcodeScannerMessages {
  permissionDenied: string;
  noCamera: string;
  starting: string;
  runningNative: string;
  runningZxing: string;
  error: string;
  scannerOff: string;
  /**
   * ZBar WASM URL missing or scanner boot failed — hard error (G3).
   * Falls back to `error` when omitted.
   */
  zbarBootstrapFailed?: string;
  /**
   * Shown while `engine === 'zbar-wasm'` (G10). Falls back to `runningZxing`.
   */
  runningZbar?: string;
  insecureContext?: string;
  cameraInUse?: string;
  policyBlocked?: string;
}

function isInsecureCameraContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext === false;
}

function isPermissionDeniedError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
  );
}

function isSecurityPolicyError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'SecurityError';
}

function isCameraInUseError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'NotReadableError' || err.name === 'AbortError')
  );
}

export interface UseBarcodeScannerOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDecode: (rawValue: string) => void;
  messages: UseBarcodeScannerMessages;
  formatProfile?: BarcodeScannerFormatProfile;
  onBackgroundStop?: () => void;
  /**
   * Bump to restart the scanner session without toggling `enabled`.
   * For mobile retry, pair with {@link preAcquiredStreamRef}: the tap handler
   * must call `getUserMedia` in-gesture and store the stream in that ref before
   * bumping — the effect consumes the ref and skips a second GUM call.
   */
  sessionKey?: number;
  /**
   * Optional one-shot stream acquired in a user-gesture handler (e.g. Allow
   * camera retry). When set before `sessionKey` bumps, the effect uses this
   * stream instead of calling `getUserMedia` again.
   */
  preAcquiredStreamRef?: React.MutableRefObject<MediaStream | null>;
}

export interface UseBarcodeScannerReturn {
  status: ScannerStatus;
  engine: ScannerEngine | null;
  /** True while G4 parallel @zxing stream or multi-pass assist is active (ZBar may still run). */
  zxingAssistActive: boolean;
  errorMessage: string | null;
}

/** ZBar + @zxing assist decode budget (~20–25 attempts/s). */
const DECODE_MIN_FRAME_INTERVAL_MS = 40;

/**
 * Live camera barcode/QR decode.
 *
 * Primary: ZBar WASM multi-pass (immediate) + Chromium BarcodeDetector in parallel.
 * G3: hard-fail when WASM URL unset or ZBar boot fails — no silent @zxing fallback.
 * G4: after {@link SCANNER_ZBAR_ZXING_ASSIST_DELAY_MS} with no lock, @zxing assist
 * runs in parallel without stopping ZBar.
 */
export function useBarcodeScanner(options: UseBarcodeScannerOptions): UseBarcodeScannerReturn {
  const {
    enabled,
    videoRef,
    onDecode,
    messages,
    formatProfile = 'retail',
    onBackgroundStop,
    sessionKey = 0,
    preAcquiredStreamRef,
  } = options;

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [engine, setEngine] = useState<ScannerEngine | null>(null);
  const [zxingAssistActive, setZxingAssistActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const preAcquiredStreamRefRef = useRef(preAcquiredStreamRef);
  preAcquiredStreamRefRef.current = preAcquiredStreamRef;

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
      setZxingAssistActive(false);
      setErrorMessage(null);
    }
  }

  const stop = useCallback((): void => {
    if (stopRef.current !== null) {
      stopRef.current();
      stopRef.current = null;
    }
  }, []);

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
      setZxingAssistActive(false);
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
    let zbarFrameHandle: number | null = null;
    let zxingMultiPassFrameHandle: number | null = null;
    let nativeFrameHandle: number | null = null;
    let distanceZoomTimer: ReturnType<typeof setTimeout> | null = null;
    let zxingAssistTimer: ReturnType<typeof setTimeout> | null = null;
    let gotDecode = false;
    let zxingAssistStarted = false;
    let zbarScanner: Awaited<ReturnType<typeof createConfiguredZbarScanner>> | null =
      null;
    const formatConfig = resolveScannerFormatConfig(formatProfile);
    const decodeCanvas = ((): HTMLCanvasElement | null => {
      if (typeof document === 'undefined') {
        return null;
      }
      try {
        return document.createElement('canvas');
      } catch {
        return null;
      }
    })();

    const zbarBootstrapErrorMessage = (): string =>
      messagesRef.current.zbarBootstrapFailed ?? messagesRef.current.error;

    const clearAssistTimers = (): void => {
      if (zxingAssistTimer !== null) {
        clearTimeout(zxingAssistTimer);
        zxingAssistTimer = null;
      }
      if (distanceZoomTimer !== null) {
        clearTimeout(distanceZoomTimer);
        distanceZoomTimer = null;
      }
    };

    const emitDecode = (text: string): void => {
      if (cancelled || text.length === 0) {
        return;
      }
      gotDecode = true;
      clearAssistTimers();
      if (!cancelled) {
        setZxingAssistActive(false);
      }
      onDecodeRef.current(text);
    };

    const failZbarBootstrap = (): void => {
      if (!cancelled) {
        setStatus('error');
        setEngine(null);
        setZxingAssistActive(false);
        setErrorMessage(zbarBootstrapErrorMessage());
      }
      cleanup();
    };

    const cleanup = (): void => {
      clearAssistTimers();
      setZxingAssistActive(false);
      if (zxingControls !== null) {
        try {
          zxingControls.stop();
        } catch {
          // ignore teardown errors
        }
        zxingControls = null;
      }
      if (zbarFrameHandle !== null) {
        cancelAnimationFrame(zbarFrameHandle);
        zbarFrameHandle = null;
      }
      if (zxingMultiPassFrameHandle !== null) {
        cancelAnimationFrame(zxingMultiPassFrameHandle);
        zxingMultiPassFrameHandle = null;
      }
      if (nativeFrameHandle !== null) {
        cancelAnimationFrame(nativeFrameHandle);
        nativeFrameHandle = null;
      }
      if (zbarScanner !== null) {
        try {
          zbarScanner.destroy();
        } catch {
          // ignore teardown errors
        }
        zbarScanner = null;
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
      setZxingAssistActive(false);

      if (isInsecureCameraContext()) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            messagesRef.current.insecureContext ?? messagesRef.current.noCamera,
          );
        }
        return;
      }

      if (typeof navigator === 'undefined' || navigator.mediaDevices === undefined) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.noCamera);
        }
        return;
      }

      try {
        const handedOff = preAcquiredStreamRefRef.current?.current ?? null;
        if (handedOff !== null) {
          if (preAcquiredStreamRefRef.current !== undefined) {
            preAcquiredStreamRefRef.current.current = null;
          }
          stream = handedOff;
        } else {
          stream = await openScannerMediaStream(
            navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices),
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (isPermissionDeniedError(err)) {
          if (isInsecureCameraContext()) {
            setStatus('error');
            setErrorMessage(
              messagesRef.current.insecureContext ?? messagesRef.current.noCamera,
            );
          } else {
            setStatus('denied');
            setErrorMessage(messagesRef.current.permissionDenied);
          }
        } else if (isSecurityPolicyError(err)) {
          setStatus('error');
          setErrorMessage(
            messagesRef.current.policyBlocked ?? messagesRef.current.error,
          );
        } else if (isCameraInUseError(err)) {
          setStatus('error');
          setErrorMessage(
            messagesRef.current.cameraInUse ?? messagesRef.current.error,
          );
        } else {
          setStatus('error');
          setErrorMessage(messagesRef.current.error);
        }
        cleanup();
        return;
      }

      if (cancelled) {
        cleanup();
        return;
      }

      const activeStream = stream;
      const [primaryTrack] = activeStream.getVideoTracks();
      if (primaryTrack !== undefined) {
        await applyScannerTrackEnhancements(primaryTrack);
      }

      if (cancelled) {
        cleanup();
        return;
      }

      const video = videoRef.current;
      if (video === null) {
        cleanup();
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.error);
        }
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

      const startNativeParallelAssist = (): void => {
        if (typeof window === 'undefined' || window.BarcodeDetector === undefined) {
          return;
        }
        const detector = new window.BarcodeDetector({
          formats: [...formatConfig.nativeFormats],
        });
        const tick = async (): Promise<void> => {
          if (cancelled || gotDecode) {
            return;
          }
          if (video.readyState >= 2) {
            try {
              const results = await detector.detect(video);
              const first = results[0];
              if (first !== undefined && first.rawValue.trim().length > 0) {
                emitDecode(first.rawValue.trim());
                return;
              }
            } catch {
              // keep scanning
            }
          }
          if (!cancelled && !gotDecode) {
            nativeFrameHandle = requestAnimationFrame(() => {
              void tick();
            });
          }
        };
        nativeFrameHandle = requestAnimationFrame(() => {
          void tick();
        });
      };

      const startZbarLoop = async (): Promise<boolean> => {
        if (decodeCanvas === null) {
          return false;
        }
        let scanner: Awaited<ReturnType<typeof createConfiguredZbarScanner>>;
        try {
          scanner = await createConfiguredZbarScanner(formatProfile);
        } catch {
          return false;
        }
        if (cancelled) {
          try {
            scanner.destroy();
          } catch {
            // ignore
          }
          return false;
        }
        zbarScanner = scanner;
        let lastAttemptMs = 0;
        let busy = false;
        let zbarTickCount = 0;

        const tick = (): void => {
          if (cancelled || gotDecode) {
            return;
          }
          const now = performance.now();
          if (
            !busy &&
            video.readyState >= 2 &&
            now - lastAttemptMs >= DECODE_MIN_FRAME_INTERVAL_MS
          ) {
            lastAttemptMs = now;
            busy = true;
            zbarTickCount += 1;
            const quickOnly = zbarTickCount % 3 !== 0;
            void decodeVideoFrameWithZbar(video, decodeCanvas, scanner, { quickOnly })
              .then((text) => {
                if (!cancelled && text !== null) {
                  emitDecode(text);
                }
              })
              .catch(() => {
                // keep scanning
              })
              .finally(() => {
                busy = false;
              });
          }
          if (!cancelled && !gotDecode) {
            zbarFrameHandle = requestAnimationFrame(tick);
          }
        };

        zbarFrameHandle = requestAnimationFrame(tick);
        return true;
      };

      const startZxingStreamAssist = async (): Promise<boolean> => {
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
                emitDecode(result.getText());
              }
            },
          );
          if (cancelled) {
            try {
              zxingControls.stop();
            } catch {
              // ignore teardown errors
            }
            zxingControls = null;
          }
          return true;
        } catch {
          return false;
        }
      };

      const startZxingMultiPassLoop = (): boolean => {
        if (decodeCanvas === null) {
          return false;
        }
        let reader: ReturnType<typeof createSensitiveZxingReader>;
        try {
          reader = createSensitiveZxingReader(formatConfig.zxingFormats);
        } catch {
          return false;
        }
        let lastAttemptMs = 0;
        let busy = false;

        const tick = (): void => {
          if (cancelled || gotDecode) {
            return;
          }
          const now = performance.now();
          if (
            !busy &&
            video.readyState >= 2 &&
            now - lastAttemptMs >= DECODE_MIN_FRAME_INTERVAL_MS
          ) {
            lastAttemptMs = now;
            busy = true;
            try {
              const text = decodeVideoFrameWithZxingJs(video, decodeCanvas, reader);
              if (!cancelled && text !== null) {
                emitDecode(text);
              }
            } catch {
              // keep scanning
            } finally {
              busy = false;
            }
          }
          if (!cancelled && !gotDecode) {
            zxingMultiPassFrameHandle = requestAnimationFrame(tick);
          }
        };

        zxingMultiPassFrameHandle = requestAnimationFrame(tick);
        return true;
      };

      const startZxingParallelAssist = (): void => {
        if (zxingAssistStarted || cancelled || gotDecode) {
          return;
        }
        zxingAssistStarted = true;
        if (!cancelled) {
          setZxingAssistActive(true);
        }
        void (async (): Promise<void> => {
          const streamOk = await startZxingStreamAssist();
          if (cancelled || gotDecode) {
            return;
          }
          if (!streamOk) {
            startZxingMultiPassLoop();
          }
        })();
      };

      const scheduleZbarDistanceZoom = (): void => {
        const trackForAssist = primaryTrack;
        if (trackForAssist === undefined) {
          return;
        }
        distanceZoomTimer = setTimeout(() => {
          distanceZoomTimer = null;
          if (cancelled || gotDecode) {
            return;
          }
          void applyScannerDistanceZoom(trackForAssist);
        }, SCANNER_DISTANCE_ASSIST_DELAY_MS);
      };

      const scheduleZxingParallelAssist = (): void => {
        zxingAssistTimer = setTimeout(() => {
          zxingAssistTimer = null;
          if (cancelled || gotDecode) {
            return;
          }
          startZxingParallelAssist();
        }, SCANNER_ZBAR_ZXING_ASSIST_DELAY_MS);
      };

      // G3 — ZBar required; no silent @zxing boot fallback.
      if (!isZbarWasmUrlConfigured()) {
        failZbarBootstrap();
        return;
      }

      const zbarOk = await startZbarLoop();
      if (cancelled) {
        cleanup();
        return;
      }
      if (!zbarOk) {
        failZbarBootstrap();
        return;
      }

      startNativeParallelAssist();
      scheduleZbarDistanceZoom();
      scheduleZxingParallelAssist();
      if (!cancelled) {
        setEngine('zbar-wasm');
        setStatus('running');
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
      stopRef.current = null;
    };
  }, [scanningEnabled, formatProfile, sessionKey, stop, videoRef]);

  return { status, engine, zxingAssistActive, errorMessage };
}
