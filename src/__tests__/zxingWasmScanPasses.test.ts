/**
 * @jest-environment node
 *
 * Max-sensitivity digital-zoom scan passes for distant / small barcodes.
 */
import { buildMaxSensitivityScanPasses } from '../hooks/zxingWasmEngine.js';

describe('buildMaxSensitivityScanPasses', () => {
  it('includes full frame plus center zooms and a 1D mid-band', () => {
    const passes = buildMaxSensitivityScanPasses(1920, 1080);
    expect(passes.length).toBeGreaterThanOrEqual(5);
    expect(passes[0]).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080, scale: 1 });
    expect(passes.some((p) => p.scale >= 3)).toBe(true);
    expect(passes.some((p) => p.sx === 0 && p.sw === 1920 && p.sh < 1080)).toBe(true);
  });

  it('returns empty for degenerate video size', () => {
    expect(buildMaxSensitivityScanPasses(0, 0)).toEqual([]);
  });
});
