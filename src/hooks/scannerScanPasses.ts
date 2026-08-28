/**
 * Digital-zoom scan regions for distant / small barcodes.
 * Used by the pure-JS @zxing multi-pass decoder.
 */
export interface ScanPass {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  /** Upscale factor when drawing the crop into the decode canvas. */
  readonly scale: number;
}

/**
 * Full frame + center zooms + mid-band (1D) + four corner crops + optional tight center.
 * Covers off-center / distant codes that are not in the viewfinder center.
 *
 * CPU bound: at most 10 passes (1 full + 3 center + 1 mid-band + 4 corners + 1 tight center).
 * Do not add more regions without raising this documented ceiling (~10–12 max).
 */
/** Full-frame only — cheap first pass (~1 crop per tick; G9 CPU bound). */
export function buildQuickScanPass(videoWidth: number, videoHeight: number): ScanPass[] {
  if (videoWidth < 2 || videoHeight < 2) {
    return [];
  }
  return [{ sx: 0, sy: 0, sw: videoWidth, sh: videoHeight, scale: 1 }];
}

export function buildMaxSensitivityScanPasses(videoWidth: number, videoHeight: number): ScanPass[] {
  const vw = videoWidth;
  const vh = videoHeight;
  if (vw < 2 || vh < 2) {
    return [];
  }

  const center = (frac: number, scale: number): ScanPass => {
    const sw = Math.max(2, Math.floor(vw * frac));
    const sh = Math.max(2, Math.floor(vh * frac));
    return {
      sx: Math.floor((vw - sw) / 2),
      sy: Math.floor((vh - sh) / 2),
      sw,
      sh,
      scale,
    };
  };

  /** Corner crop: `frac`×`frac` of the frame anchored at a corner (off-center). */
  const corner = (
    anchor: 'tl' | 'tr' | 'bl' | 'br',
    frac: number,
    scale: number,
  ): ScanPass => {
    const sw = Math.max(2, Math.floor(vw * frac));
    const sh = Math.max(2, Math.floor(vh * frac));
    const sx = anchor === 'tr' || anchor === 'br' ? vw - sw : 0;
    const sy = anchor === 'bl' || anchor === 'br' ? vh - sh : 0;
    return { sx, sy, sw, sh, scale };
  };

  const bandH = Math.max(2, Math.floor(vh * 0.28));
  const midBand: ScanPass = {
    sx: 0,
    sy: Math.floor((vh - bandH) / 2),
    sw: vw,
    sh: bandH,
    scale: 2,
  };

  return [
    // 1. full frame
    { sx: 0, sy: 0, sw: vw, sh: vh, scale: 1 },
    // 2–4. center zooms
    center(0.7, 1.75),
    center(0.5, 2.25),
    center(0.35, 3),
    // 5. mid-band 1D
    midBand,
    // 6–9. four corner crops (off-center distant codes)
    corner('tl', 0.4, 2.75),
    corner('tr', 0.4, 2.75),
    corner('bl', 0.4, 2.75),
    corner('br', 0.4, 2.75),
    // 10. stronger tight center
    center(0.25, 3.5),
  ];
}
