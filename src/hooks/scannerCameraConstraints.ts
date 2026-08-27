/**
 * High-sensitivity camera constraints for live barcode / QR decode.
 * Prefer rear camera + max practical resolution so small symbols fill pixels.
 */
export const SCANNER_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 3840, min: 1280 },
  height: { ideal: 2160, min: 720 },
  frameRate: { ideal: 30 },
};

type FocusZoomCapableTrack = MediaStreamTrack & {
  getCapabilities?: () => {
    focusMode?: string[];
    zoom?: { min?: number; max?: number; step?: number };
  };
};

type AdvancedTrackConstraint = {
  focusMode?: string;
  zoom?: number;
};

type FocusZoomCapableConstraints = MediaTrackConstraints & {
  advanced?: AdvancedTrackConstraint[];
};

/** Mild optical zoom when supported — enlarges distant/small codes without user effort. */
export const SCANNER_PREFERRED_ZOOM = 1.75;

/**
 * Best-effort continuous autofocus + mild zoom after getUserMedia.
 * Unsupported constraints are ignored so older devices still scan.
 */
export async function applyScannerTrackEnhancements(track: MediaStreamTrack): Promise<void> {
  const getCapabilities = (track as FocusZoomCapableTrack).getCapabilities;
  if (getCapabilities === undefined) {
    return;
  }

  const capabilities = getCapabilities.call(track);
  const advanced: AdvancedTrackConstraint[] = [];

  if (capabilities.focusMode?.includes('continuous') === true) {
    advanced.push({ focusMode: 'continuous' });
  }

  const zoomCap = capabilities.zoom;
  if (zoomCap !== undefined) {
    const min = zoomCap.min ?? 1;
    const max = zoomCap.max ?? 1;
    if (max > min) {
      const target = Math.min(max, Math.max(min, SCANNER_PREFERRED_ZOOM));
      if (target > min) {
        advanced.push({ zoom: target });
      }
    }
  }

  if (advanced.length === 0) {
    return;
  }

  try {
    const next: FocusZoomCapableConstraints = { advanced };
    await track.applyConstraints(next);
  } catch {
    // Device rejected advanced focus/zoom — keep the stream as opened.
  }
}
