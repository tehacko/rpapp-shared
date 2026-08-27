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
 * Best-effort continuous autofocus, max optical zoom, and torch after getUserMedia.
 * Unsupported constraints are ignored so older devices still scan.
 *
 * Distance levers (G2/G4):
 * - Optical zoom targets capability max (policy SCANNER_OPTICAL_ZOOM_POLICY).
 * - When the zoom range is wide, applies a mid -> max stepped ladder.
 * - Enables torch when getCapabilities().torch is true.
 */
export async function applyScannerTrackEnhancements(track: MediaStreamTrack): Promise<void> {
  const getCapabilities = (track as FocusZoomCapableTrack).getCapabilities;
  if (getCapabilities === undefined) {
    return;
  }

  const capabilities = getCapabilities.call(track);
  const hasContinuousFocus = capabilities.focusMode?.includes('continuous') === true;
  const hasTorch = capabilities.torch === true;

  const zoomCap = capabilities.zoom;
  let zoomMin = 1;
  let zoomMax = 1;
  let zoomStep: number | undefined;
  let hasZoomRange = false;
  if (zoomCap !== undefined) {
    zoomMin = zoomCap.min ?? 1;
    zoomMax = zoomCap.max ?? 1;
    zoomStep = zoomCap.step;
    hasZoomRange = zoomMax > zoomMin;
  }

  if (!hasContinuousFocus && !hasTorch && !hasZoomRange) {
    return;
  }

  const preferredZoom = hasZoomRange
    ? resolvePreferredOpticalZoom(zoomMin, zoomMax, zoomStep)
    : undefined;

  const midZoom =
    preferredZoom !== undefined && preferredZoom > zoomMin
      ? resolveMidOpticalZoom(zoomMin, preferredZoom, zoomStep)
      : undefined;

  const useZoomLadder =
    midZoom !== undefined &&
    preferredZoom !== undefined &&
    midZoom > zoomMin &&
    midZoom < preferredZoom;

  const firstAdvanced: AdvancedTrackConstraint[] = [];
  if (hasContinuousFocus) {
    firstAdvanced.push({ focusMode: 'continuous' });
  }
  if (hasTorch) {
    firstAdvanced.push({ torch: true });
  }
  if (useZoomLadder) {
    firstAdvanced.push({ zoom: midZoom });
  } else if (preferredZoom !== undefined && preferredZoom > zoomMin) {
    firstAdvanced.push({ zoom: preferredZoom });
  }

  if (firstAdvanced.length === 0) {
    return;
  }

  try {
    const first: FocusZoomCapableConstraints = { advanced: firstAdvanced };
    await track.applyConstraints(first);

    // Second lever: step optical zoom to max after focus/torch/mid settled.
    if (useZoomLadder && preferredZoom !== undefined) {
      try {
        const second: FocusZoomCapableConstraints = {
          advanced: [{ zoom: preferredZoom }],
        };
        await track.applyConstraints(second);
      } catch {
        // Max zoom rejected after mid - keep mid + prior enhancements.
      }
    }
  } catch {
    // Device rejected advanced focus/zoom/torch - keep the stream as opened.
  }
}