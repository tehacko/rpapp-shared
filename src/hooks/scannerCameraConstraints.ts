/**
 * High-sensitivity camera constraints for live barcode / QR decode.
 * Prefer rear camera + high ideal resolution so small symbols fill pixels.
 *
 * Do not set hard `min` width/height - Android Chrome often rejects those with
 * OverconstrainedError. Some Android builds also surface soft-constraint failure
 * as NotAllowedError; the ladder retries NotAllowed only until the final
 * `video: true` rung (a true user deny there is not retried).
 */
export const SCANNER_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 },
};

/**
 * Progressive getUserMedia ladder for mobile browsers.
 * Soften resolution first, then facingMode-only, then any camera.
 */
export const SCANNER_VIDEO_CONSTRAINT_FALLBACKS: ReadonlyArray<MediaTrackConstraints | true> = [
  SCANNER_VIDEO_CONSTRAINTS,
  {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  { facingMode: { ideal: 'environment' } },
  true,
];

type FocusZoomCapableTrack = MediaStreamTrack & {
  getCapabilities?: () => {
    focusMode?: string[];
    zoom?: { min?: number; max?: number; step?: number };
    /** When true, torch / flash may be enabled via advanced constraints. */
    torch?: boolean;
  };
};

type AdvancedTrackConstraint = {
  focusMode?: string;
  zoom?: number;
  torch?: boolean;
};

type FocusZoomCapableConstraints = MediaTrackConstraints & {
  advanced?: AdvancedTrackConstraint[];
};

/**
 * Optical zoom policy for scanner tracks: use the device's capability max
 * (not a hard 2x ceiling). Documented for callers; resolution is via
 * resolvePreferredOpticalZoom.
 */
export const SCANNER_OPTICAL_ZOOM_POLICY = 'max' as const;

/**
 * Resolve preferred optical zoom from MediaTrackCapabilities.zoom bounds.
 * Targets device max (G2) - no fixed 2x ceiling. Snaps down to a valid step
 * when `step` is provided.
 */
export function resolvePreferredOpticalZoom(
  min: number,
  max: number,
  step?: number,
): number {
  if (!(max > min)) {
    return min;
  }
  if (step !== undefined && step > 0) {
    const stepsFromMin = Math.floor((max - min) / step + Number.EPSILON);
    return min + stepsFromMin * step;
  }
  return max;
}

/**
 * Midpoint zoom for a stepped ladder toward max (G4 distance lever).
 * Snaps to step when provided.
 */
export function resolveMidOpticalZoom(
  min: number,
  maxTarget: number,
  step?: number,
): number {
  if (!(maxTarget > min)) {
    return min;
  }
  const mid = (min + maxTarget) / 2;
  if (step !== undefined && step > 0) {
    const stepsFromMin = Math.round((mid - min) / step);
    const snapped = min + stepsFromMin * step;
    return Math.min(maxTarget, Math.max(min, snapped));
  }
  return mid;
}

function isConstraintRetryableError(err: unknown): boolean {
  if (!(err instanceof DOMException)) {
    return false;
  }
  return (
    err.name === 'OverconstrainedError' ||
    err.name === 'ConstraintNotSatisfiedError' ||
    err.name === 'NotFoundError' ||
    err.name === 'NotReadableError' ||
    err.name === 'AbortError'
  );
}

function isNotAllowedError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'NotAllowedError';
}

/**
 * Open a camera stream with progressive constraint fallbacks.
 *
 * Overconstrained / NotFound / NotReadable / Abort -> next rung.
 * NotAllowedError -> next rung only while `video` is not yet the final `true`
 * (any-camera) rung; on that last rung NotAllowed is a real deny and is rethrown.
 * Other failures (SecurityError, etc.) are rethrown immediately.
 */
export async function openScannerMediaStream(
  getUserMedia: MediaDevices['getUserMedia'],
): Promise<MediaStream> {
  let lastError: unknown;
  for (let i = 0; i < SCANNER_VIDEO_CONSTRAINT_FALLBACKS.length; i++) {
    const video = SCANNER_VIDEO_CONSTRAINT_FALLBACKS[i]!;
    try {
      return await getUserMedia({ video, audio: false });
    } catch (err) {
      lastError = err;
      if (isConstraintRetryableError(err)) {
        continue;
      }
      // Soft-constraint NotAllowed: retry until final any-camera rung only.
      if (isNotAllowedError(err) && video !== true) {
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Could not open scanner camera', { cause: lastError });
}

/**
 * Best-effort continuous autofocus + torch after getUserMedia.
 * Optical zoom is NOT applied here — max zoom on open blurs/crops close barcodes
 * (camera shows a sharp code but @zxing never locks). The hook applies
 * {@link applyScannerDistanceZoom} only after multi-pass has already started
 * (second assist window), never at open and never at the first assist tick.
 */
export async function applyScannerTrackEnhancements(track: MediaStreamTrack): Promise<void> {
  const getCapabilities = (track as FocusZoomCapableTrack).getCapabilities;
  if (getCapabilities === undefined) {
    return;
  }

  const capabilities = getCapabilities.call(track);
  const hasContinuousFocus = capabilities.focusMode?.includes('continuous') === true;
  const hasTorch = capabilities.torch === true;

  if (!hasContinuousFocus && !hasTorch) {
    return;
  }

  const advanced: AdvancedTrackConstraint[] = [];
  if (hasContinuousFocus) {
    advanced.push({ focusMode: 'continuous' });
  }
  if (hasTorch) {
    advanced.push({ torch: true });
  }

  try {
    const next: FocusZoomCapableConstraints = { advanced };
    await track.applyConstraints(next);
  } catch {
    // Device rejected advanced focus/torch — keep the stream as opened.
  }
}

/**
 * Delayed distance lever (G2/G4): mid → max optical zoom from capabilities.
 * Hook policy: call only after SCANNER_DISTANCE_ASSIST_DELAY_MS (multi-pass first)
 * plus SCANNER_DISTANCE_ZOOM_DELAY_MS — never on open and never at the first
 * assist tick, so close codes with slow AF are not forced into max zoom.
 */
export async function applyScannerDistanceZoom(track: MediaStreamTrack): Promise<void> {
  const getCapabilities = (track as FocusZoomCapableTrack).getCapabilities;
  if (getCapabilities === undefined) {
    return;
  }

  const capabilities = getCapabilities.call(track);
  const zoomCap = capabilities.zoom;
  if (zoomCap === undefined) {
    return;
  }

  const zoomMin = zoomCap.min ?? 1;
  const zoomMax = zoomCap.max ?? 1;
  const zoomStep = zoomCap.step;
  if (!(zoomMax > zoomMin)) {
    return;
  }

  const preferredZoom = resolvePreferredOpticalZoom(zoomMin, zoomMax, zoomStep);
  if (!(preferredZoom > zoomMin)) {
    return;
  }

  const midZoom = resolveMidOpticalZoom(zoomMin, preferredZoom, zoomStep);
  const useZoomLadder = midZoom > zoomMin && midZoom < preferredZoom;

  try {
    if (useZoomLadder) {
      await track.applyConstraints({
        advanced: [{ zoom: midZoom }],
      } as FocusZoomCapableConstraints);
      try {
        await track.applyConstraints({
          advanced: [{ zoom: preferredZoom }],
        } as FocusZoomCapableConstraints);
      } catch {
        // Max rejected after mid — keep mid.
      }
      return;
    }

    await track.applyConstraints({
      advanced: [{ zoom: preferredZoom }],
    } as FocusZoomCapableConstraints);
  } catch {
    // Zoom unsupported after open — keep current stream.
  }
}