import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import './scannerNativeTypes.js';
import { selectBarcodeScannerEngine, type ScannerEngine } from './selectEngine.js';
import {
  resolveScannerFormatConfig,
  type BarcodeScannerFormatProfile,
} from './scannerFormats.js';

export type ScannerStatus = 'idle' | 'starting' | 'running' | 'denied' | 'error';

export interface UseBarcodeScannerMessages {
  permissionDenied: string;
  noCamera: string;
  starting: string;
  runningNative: string;
  runningZxing: string;
  error: string;
  scannerOff: string;
}

export interface UseBarcodeScannerOptions {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDecode: (rawValue: string) => void;
  messages: UseBarcodeScannerMessages;
  formatProfile?: BarcodeScannerFormatProfile;
}

export interface UseBarcodeScannerReturn {
  status: ScannerStatus;
  engine: ScannerEngine | null;
  errorMessage: string | null;
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions): UseBarcodeScannerReturn {
  const { enabled, videoRef, onDecode, messages, formatProfile = 'retail' } = options;

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [engine, setEngine] = useState<ScannerEngine | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const stopRef = useRef<(() => void) | null>(null);

  const [trackedEnabled, setTrackedEnabled] = useState(enabled);
  if (trackedEnabled !== enabled) {
    setTrackedEnabled(enabled);
    if (!enabled) {
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
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let zxingControls: { stop: () => void } | null = null;
    let nativeFrameHandle: number | null = null;
    const formatConfig = resolveScannerFormatConfig(formatProfile);

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

      const chosenEngine = await selectBarcodeScannerEngine(formatProfile);
      if (cancelled) {
        return;
      }
      setEngine(chosenEngine);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
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

      const video = videoRef.current;
      if (video === null) {
        cleanup();
        return;
      }
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // autoplay may fail; frames remain readable
      }

      if (cancelled) {
        cleanup();
        return;
      }
      setStatus('running');

      if (chosenEngine === 'native-detector' && window.BarcodeDetector !== undefined) {
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
        return;
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [...formatConfig.zxingFormats]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const reader = new BrowserMultiFormatReader(hints);
      try {
        zxingControls = await reader.decodeFromStream(
          stream,
          video,
          (result, _err, controls: { stop: () => void }) => {
          if (cancelled) {
            controls.stop();
            return;
          }
          if (result !== undefined && result !== null) {
            onDecodeRef.current(result.getText());
          }
        });
      } catch {
        if (cancelled) {
          return;
        }
        setStatus('error');
        setErrorMessage(messagesRef.current.error);
        cleanup();
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
      stopRef.current = null;
    };
  }, [enabled, formatProfile, stop, videoRef]);

  return { status, engine, errorMessage };
}
