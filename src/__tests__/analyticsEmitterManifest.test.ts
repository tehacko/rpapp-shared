import {
  ANALYTICS_EMITTER_BE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  validateAnalyticsEmitterManifest,
} from '../analyticsEmitterManifest.js';

describe('analyticsEmitterManifest', () => {
  it('is non-empty and passes validation', () => {
    expect(ANALYTICS_EMITTER_MANIFEST.length).toBeGreaterThan(0);
    expect(validateAnalyticsEmitterManifest()).toEqual([]);
  });

  it('maps every FE manifest reference to a repo path', () => {
    const feRefs = new Set(
      ANALYTICS_EMITTER_MANIFEST.filter((cell) => cell.layer === 'FE').map(
        (cell) => cell.reference
      )
    );

    for (const reference of feRefs) {
      expect(ANALYTICS_EMITTER_FE_REFERENCE_PATHS[reference]).toBeDefined();
    }
  });

  it('maps every BE manifest reference to a repo path', () => {
    const beRefs = new Set(
      ANALYTICS_EMITTER_MANIFEST.filter((cell) => cell.layer === 'BE').map(
        (cell) => cell.reference
      )
    );

    for (const reference of beRefs) {
      expect(ANALYTICS_EMITTER_BE_REFERENCE_PATHS[reference]).toBeDefined();
    }
  });
});
