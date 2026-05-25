import {
  ANALYTICS_EMITTER_MANIFEST,
  validateAnalyticsEmitterManifest,
} from '../analyticsEmitterManifest.js';

describe('analyticsEmitterManifest', () => {
  it('is non-empty and passes validation', () => {
    expect(ANALYTICS_EMITTER_MANIFEST.length).toBeGreaterThan(0);
    expect(validateAnalyticsEmitterManifest()).toEqual([]);
  });
});
