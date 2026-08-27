/**
 * @jest-environment node
 */
import { buildMaxSensitivityScanPasses } from '../hooks/scannerScanPasses.js';

describe('buildMaxSensitivityScanPasses', () => {
  it('includes full frame plus center zooms and a 1D mid-band', () => {
    const passes = buildMaxSensitivityScanPasses(1920, 1080);
    expect(passes.length).toBeGreaterThanOrEqual(5);
    expect(passes.length).toBeLessThanOrEqual(12);
    expect(passes[0]).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080, scale: 1 });
    expect(passes.some((p) => p.scale >= 3)).toBe(true);
    expect(passes.some((p) => p.sx === 0 && p.sw === 1920 && p.sh < 1080)).toBe(true);

    const centerX = Math.floor(1920 / 2);
    const centerY = Math.floor(1080 / 2);
    expect(
      passes.some((p) => {
        const midX = p.sx + Math.floor(p.sw / 2);
        const midY = p.sy + Math.floor(p.sh / 2);
        return Math.abs(midX - centerX) <= 1 && Math.abs(midY - centerY) <= 1 && p.sw < 1920;
      }),
    ).toBe(true);
  });

  it('includes off-center corner crops (sx/sy not only center)', () => {
    const vw = 1920;
    const vh = 1080;
    const passes = buildMaxSensitivityScanPasses(vw, vh);

    const centerOnly = passes.every((p) => {
      const expectedSx = Math.floor((vw - p.sw) / 2);
      const expectedSy = Math.floor((vh - p.sh) / 2);
      return p.sx === expectedSx && p.sy === expectedSy;
    });
    expect(centerOnly).toBe(false);

    const corners = passes.filter((p) => {
      const isTopLeft = p.sx === 0 && p.sy === 0 && p.sw < vw && p.sh < vh;
      const isTopRight = p.sx > 0 && p.sy === 0 && p.sx + p.sw === vw;
      const isBottomLeft = p.sx === 0 && p.sy > 0 && p.sy + p.sh === vh;
      const isBottomRight = p.sx > 0 && p.sy > 0 && p.sx + p.sw === vw && p.sy + p.sh === vh;
      return isTopLeft || isTopRight || isBottomLeft || isBottomRight;
    });
    // four corners (exclude full-frame which is also tl-anchored but sw===vw)
    const cornerCrops = corners.filter((p) => p.sw < vw && p.sh < vh);
    expect(cornerCrops.length).toBeGreaterThanOrEqual(4);
    expect(cornerCrops.every((p) => p.scale >= 2.5)).toBe(true);
  });

  it('returns empty for degenerate video size', () => {
    expect(buildMaxSensitivityScanPasses(0, 0)).toEqual([]);
  });
});
