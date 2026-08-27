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
  openScannerMediaStream,
} from './scannerCameraConstraints.js';
import {
  createSensitiveZxingReader,
  decodeVideoFrameWithZxingJs,
} from './zxingJsSensitiveDecode.js';

export type ScannerStatus = 'idle' | 'starting' | 'running' | 'denied' | 'error';

export interface UseBarcodeScannerMessages {
  permissionDenied: string;
  noCamera: string;
  starting: string;
  runningNative: string;
  runningZxing: string;
  error: string;
  scannerOff: string;
  /**
   * Optional — shown when the page is not a secure context (HTTP over LAN IP).
   * Falls back to `noCamera` when omitted.
   */
  insecureContext?: string;
  /**
   * Optional — camera busy / hardware lock (NotReadableError / AbortError after
   * constraint ladder exhaustion). Falls back to `error` when omitted.
   */
  cameraInUse?: string;
  /**
   * Optional — secure-context / Permissions-Policy block (SecurityError).
   * Falls back to `error` when omitted. Not treated as user permission deny.
   */
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
  /**
   * Fired when the tab/page backgrounds and the hook releases the camera.
   * Parent should set `enabled` false so the CTA must be tapped again (no auto-restart).
   */
  onBackgroundStop?: () => void;
}

export interface UseBarcodeScannerReturn {
  status: ScannerStatus;
  engine: ScannerEngine | null;
  errorMessage: string | null;
}

/** Multi-pass @zxing decode budget (~20–25 attempts/s). */
const ZXING_MIN_FRAME_INTERVAL_MS = 40;

/**
 * Live camera barcode/QR decode.
 *
 * Primary: pure-JS @zxing/browser `decodeFromStream` (former working engine)
 * plus parallel multi-pass digital zoom + TRY_HARDER for distant / small codes.
 * If stream fails but a canvas exists, multi-pass alone is the sensitive path.
 * G5: never start native BarcodeDetector alone (no TRY_HARDER / distance assist) —
 * hard-fail with recovery copy when neither @zxing path can start.
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
    let zxingFrameHandle: number | null = null;
    const formatConfig = resolveScannerFormatConfig(formatProfile);
    // G5: multi-pass needs a canvas; if creation fails, hard-fail later (never native-only).
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

    const cleanup = (): void => {
      if (zxingControls !== null) {
        try {
          zxingControls.stop();
        } catch {
          // ignore teardown errors
        }
        zxingControls = null;
      }
      if (zxingFrameHandle !== null) {
        cancelAnimationFrame(zxingFrameHandle);
        zxingFrameHandle = null;
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

      if (isInsecureCameraContext()) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            messagesRef.current.insecureContext ?? messagesRef.current.noCamera,
          );
        }
        return;
      }

      // Missing MediaDevices (secure context prep for G3): prefer noCamera only.
      if (typeof navigator === 'undefined' || navigator.mediaDevices === undefined) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(messagesRef.current.noCamera);
        }
        return;
      }

      try {
        stream = await openScannerMediaStream(
          navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices),
        );
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (isPermissionDeniedError(err)) {
          // Android Chrome often throws NotAllowedError on plain HTTP LAN URLs;
          // prefer the HTTPS recovery copy when the context is still insecure.
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

      // G5: cancel/unmount after GUM — release before enhance/play.
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
        // G4: successful GUM but video element gone — surface error, release tracks.
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

      const startZxingStreamFallback = async (): Promise<boolean> => {
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

      const startZxingMultiPassLoop = (): boolean => {
        if (decodeCanvas === null) {
          return false;
        }
        let reader: ReturnType<typeof createSensitiveZxingReader>;
        try {
          reader = createSensitiveZxingReader(formatConfig.zxingFormats);
        } catch {
          // Reader/bootstrap failure — do not pretend multi-pass started.
          return false;
        }
        let lastAttemptMs = 0;
        let busy = false;

        const tick = (): void => {
          if (cancelled) {
            return;
          }
          const now = performance.now();
          if (
            !busy &&
            video.readyState >= 2 &&
            now - lastAttemptMs >= ZXING_MIN_FRAME_INTERVAL_MS
          ) {
            lastAttemptMs = now;
            busy = true;
            try {
              const text = decodeVideoFrameWithZxingJs(video, decodeCanvas, reader);
              if (!cancelled && text !== null) {
                onDecodeRef.current(text);
              }
            } catch {
              // keep scanning
            } finally {
              busy = false;
            }
          }
          if (!cancelled) {
            zxingFrameHandle = requestAnimationFrame(tick);
          }
        };

        zxingFrameHandle = requestAnimationFrame(tick);
        return true;
      };

      // G5 engine order (max sensitivity — never native-only):
      // 1) @zxing decodeFromStream (+ TRY_HARDER); if OK also start multi-pass
      // 2) Else multi-pass canvas alone (when canvas exists)
      // 3) Else hard-fail — do not start weak native BarcodeDetector alone
      const streamOk = await startZxingStreamFallback();
      // G5: if cancelled after controls assigned, stop them + release stream.
      if (cancelled) {
        cleanup();
        return;
      }
      if (streamOk) {
        startZxingMultiPassLoop();
        if (!cancelled) {
          setEngine('zxing');
          setStatus('running');
        }
        return;
      }

      if (startZxingMultiPassLoop()) {
        if (!cancelled) {
          setEngine('zxing');
          setStatus('running');
        }
        return;
      }

      if (!cancelled) {
        setStatus('error');
        setErrorMessage(messagesRef.current.error);
      }
      cleanup();
    })();

    return () => {
      cancelled = true;
      cleanup();
      stopRef.current = null;
    };
  }, [scanningEnabled, formatProfile, stop, videoRef]);

  return { status, engine, errorMessage };
}
