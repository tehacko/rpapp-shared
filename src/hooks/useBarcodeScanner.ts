import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { prepareScanPayloadForEmit } from '../barcode/normalizeScanPayload.js';
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
import { resolveScannerPlatformProfile } from './scannerPlatformProfile.js';
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

export const SCANNER_DISTANCE_ASSIST_DELAY_MS = 1500;

/** @deprecated Distance-zoom assist delay only — @zxing assist starts on frame 0 (v2.2). */
export const SCANNER_ZBAR_ZXING_ASSIST_DELAY_MS = SCANNER_DISTANCE_ASSIST_DELAY_MS;

export const SCANNER_DISTANCE_ZOOM_DELAY_MS = 1500;

const DECODE_MIN_FRAME_INTERVAL_MS = 40;
const EMIT_DEDUPE_MS = 800;
/** Minimum gap after a successful decode before another emit (G30 post-decode UX). */
export const SCANNER_POST_DECODE_COOLDOWN_MS = 600;
const MOBILE_BUDGET_P95_SLOW_MS = 25;
const MOBILE_BUDGET_P95_CRITICAL_MS = 40;

export interface UseBarcodeScannerMessages {
  permissionDenied: string;
  noCamera: string;
  starting: string;
  runningNative: string;
  runningZxing: string;
  error: string;
  scannerOff: string;
  zbarBootstrapFailed?: string;
  runningZbar?: string;
  /** Shown when `degradedMode === true` (ZBar unavailable, @zxing/native running). */
  runningDegraded?: string;
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

async function probeNativeBarcodeDetector(
  nativeFormats: readonly string[],
): Promise<boolean> {
  if (typeof window === 'undefined' || window.BarcodeDetector === undefined) {
    return false;
  }
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    return nativeFormats.every((f) => supported.includes(f));
  } catch {
    return false;
  }
}

type VideoFrameRequestCallback = (now: number, metadata: VideoFrameCallbackMetadata) => void;

type VideoWithRvfc = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: VideoFrameRequestCallback) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

function scheduleVideoTick(
  video: HTMLVideoElement,
  cb: () => void,
): { cancel: () => void } {
  const v = video as VideoWithRvfc;
  if (typeof v.requestVideoFrameCallback === 'function') {
    let handle: number | null = null;
    let cancelled = false;
    const onFrame: VideoFrameRequestCallback = () => {
      if (cancelled) {
        return;
      }
      cb();
      if (!cancelled) {
        handle = v.requestVideoFrameCallback!(onFrame);
      }
    };
    handle = v.requestVideoFrameCallback(onFrame);
    return {
      cancel: (): void => {
        cancelled = true;
        if (handle !== null && typeof v.cancelVideoFrameCallback === 'function') {
          v.cancelVideoFrameCallback(handle);
        }
      },
    };
  }
  let rafId: number | null = null;
  let cancelled = false;
  const loop = (): void => {
    if (cancelled) {
      return;
    }
    cb();
    if (!cancelled) {
      rafId = requestAnimationFrame(loop);
    }
  };
  rafId = requestAnimationFrame(loop);
  return {
    cancel: (): void => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    },
  };
}

function computeP95(samples: readonly number[]): number {
  if (samples.length === 0) {
    return 0;
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[idx] ?? 0;
}

export interface UseBarcodeScannerOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDecode: (rawValue: string) => void;
  messages: UseBarcodeScannerMessages;
  formatProfile?: BarcodeScannerFormatProfile;
  onBackgroundStop?: () => void;
  sessionKey?: number;
  preAcquiredStreamRef?: React.MutableRefObject<MediaStream | null>;
}

export interface UseBarcodeScannerReturn {
  status: ScannerStatus;
  engine: ScannerEngine | null;
  zxingAssistActive: boolean;
  /** True when ZBar WASM failed to boot and @zxing/native degraded path is active. */
  degradedMode: boolean;
  errorMessage: string | null;
}

/**
 * Live camera barcode/QR decode — multi-engine parallel (ZBar + native + @zxing).
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
  const [degradedMode, setDegradedMode] = useState(false);
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
      setDegradedMode(false);
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
      setDegradedMode(false);
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
    let zbarFrameCancel: (() => void) | null = null;
    let zxingMultiPassCancel: (() => void) | null = null;
    let nativeFrameCancel: (() => void) | null = null;
    let distanceZoomTimer: ReturnType<typeof setTimeout> | null = null;
    let postDecodeRearmTimer: ReturnType<typeof setTimeout> | null = null;
    let gotDecode = false;
    let zxingAssistStarted = false;
    let lastEmittedPayload = '';
    let lastEmittedAt = 0;
    let zbarScanner: Awaited<ReturnType<typeof createConfiguredZbarScanner>> | null = null;
    const platform = resolveScannerPlatformProfile();
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

    const clearAssistTimers = (): void => {
      if (distanceZoomTimer !== null) {
        clearTimeout(distanceZoomTimer);
        distanceZoomTimer = null;
      }
      if (postDecodeRearmTimer !== null) {
        clearTimeout(postDecodeRearmTimer);
        postDecodeRearmTimer = null;
      }
    };

    const emitDecode = (text: string): void => {
      if (cancelled || gotDecode) {
        return;
      }
      gotDecode = true;
      const prepared = prepareScanPayloadForEmit(text, formatProfile);
      if (prepared === null || prepared.length === 0) {
        gotDecode = false;
        return;
      }
      const now = performance.now();
      if (
        prepared === lastEmittedPayload &&
        now - lastEmittedAt < Math.max(EMIT_DEDUPE_MS, SCANNER_POST_DECODE_COOLDOWN_MS)
      ) {
        gotDecode = false;
        return;
      }
      lastEmittedPayload = prepared;
      lastEmittedAt = now;
      clearAssistTimers();
      if (!cancelled) {
        setZxingAssistActive(false);
      }
      onDecodeRef.current(prepared);
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.vibrate === 'function'
      ) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore unsupported vibrate
        }
      }
      postDecodeRearmTimer = setTimeout(() => {
        postDecodeRearmTimer = null;
        if (!cancelled) {
          gotDecode = false;
        }
      }, SCANNER_POST_DECODE_COOLDOWN_MS);
    };

    const cleanup = (): void => {
      clearAssistTimers();
      setZxingAssistActive(false);
      if (zxingControls !== null) {
        try {
          zxingControls.stop();
        } catch {
          // ignore
        }
        zxingControls = null;
      }
      if (zbarFrameCancel !== null) {
        zbarFrameCancel();
        zbarFrameCancel = null;
      }
      if (zxingMultiPassCancel !== null) {
        zxingMultiPassCancel();
        zxingMultiPassCancel = null;
      }
      if (nativeFrameCancel !== null) {
        nativeFrameCancel();
        nativeFrameCancel = null;
      }
      if (zbarScanner !== null) {
        try {
          zbarScanner.destroy();
        } catch {
          // ignore
        }
        zbarScanner = null;
      }
      if (stream !== null) {
        for (const track of stream.getTracks()) {
          try {
            track.stop();
          } catch {
            // ignore
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
      setDegradedMode(false);

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

      const nativeProbeOk =
        platform.nativeEnabled &&
        (await probeNativeBarcodeDetector(formatConfig.nativeFormats));

      const startNativeParallelAssist = (): void => {
        if (!nativeProbeOk || typeof window === 'undefined' || window.BarcodeDetector === undefined) {
          return;
        }
        const detector = new window.BarcodeDetector({
          formats: [...formatConfig.nativeFormats],
        });
        let lastAttemptMs = 0;
        const tick = async (): Promise<void> => {
          if (cancelled || gotDecode) {
            return;
          }
          const now = performance.now();
          if (video.readyState >= 2 && now - lastAttemptMs >= DECODE_MIN_FRAME_INTERVAL_MS) {
            lastAttemptMs = now;
            try {
              const results = await detector.detect(video);
              const first = results[0];
              if (first !== undefined && first.rawValue.trim().length > 0) {
                emitDecode(first.rawValue);
                if (!cancelled && !gotDecode) {
                  setEngine('native-detector');
                }
                return;
              }
            } catch {
              // keep scanning
            }
          }
        };
        const sched = scheduleVideoTick(video, () => {
          void tick();
        });
        nativeFrameCancel = sched.cancel;
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
        const decodeDurations: number[] = [];

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
            const p95 = computeP95(decodeDurations);
            let quickOnly = false;
            if (platform.zbarFullPassEveryFrame) {
              quickOnly = false;
            } else if (p95 > MOBILE_BUDGET_P95_CRITICAL_MS) {
              quickOnly = zbarTickCount % 3 !== 0;
            } else if (p95 > MOBILE_BUDGET_P95_SLOW_MS) {
              quickOnly = zbarTickCount % 2 !== 0;
            } else {
              quickOnly = false;
            }
            const started = performance.now();
            void decodeVideoFrameWithZbar(video, decodeCanvas, scanner, { quickOnly })
              .then((text) => {
                if (!cancelled && text !== null) {
                  emitDecode(text);
                  if (!gotDecode) {
                    setEngine('zbar-wasm');
                  }
                }
              })
              .catch(() => {
                // keep scanning
              })
              .finally(() => {
                decodeDurations.push(performance.now() - started);
                if (decodeDurations.length > 10) {
                  decodeDurations.shift();
                }
                busy = false;
              });
          }
        };
        const sched = scheduleVideoTick(video, tick);
        zbarFrameCancel = sched.cancel;
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
                if (!cancelled && !gotDecode) {
                  setEngine('zxing');
                }
              }
            },
          );
          if (cancelled) {
            try {
              zxingControls.stop();
            } catch {
              // ignore
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
                if (!gotDecode) {
                  setEngine('zxing');
                }
              }
            } catch {
              // keep scanning
            } finally {
              busy = false;
            }
          }
        };
        const sched = scheduleVideoTick(video, tick);
        zxingMultiPassCancel = sched.cancel;
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

      const bootDegraded = (): void => {
        if (!cancelled) {
          setDegradedMode(true);
          setEngine('zxing');
          setStatus('running');
        }
        startNativeParallelAssist();
        startZxingParallelAssist();
        scheduleZbarDistanceZoom();
      };

      const zbarConfigured = isZbarWasmUrlConfigured();
      let zbarOk = false;
      if (zbarConfigured) {
        zbarOk = await startZbarLoop();
      }

      if (cancelled) {
        cleanup();
        return;
      }

      if (!zbarConfigured || !zbarOk) {
        bootDegraded();
        return;
      }

      if (!cancelled) {
        setDegradedMode(false);
        setEngine('zbar-wasm');
        setStatus('running');
      }

      startNativeParallelAssist();
      startZxingParallelAssist();
      scheduleZbarDistanceZoom();
    })();

    return () => {
      cancelled = true;
      cleanup();
      stopRef.current = null;
    };
  }, [scanningEnabled, formatProfile, sessionKey, stop, videoRef]);

  return { status, engine, zxingAssistActive, degradedMode, errorMessage };
}
