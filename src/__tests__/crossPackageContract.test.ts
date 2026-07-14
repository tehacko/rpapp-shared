import {
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  buildPaymentSurfaceReadiness,
  validateAnalyticsEmitterManifest,
  type AnalyticsEmitterManifestCell,
  type PaymentSurfaceReadiness,
} from '../index.js';

describe('crossPackageContract', () => {
  it('exports analyticsEmitterManifest from package entry', () => {
    expect(ANALYTICS_EMITTER_MANIFEST).toBeDefined();
    expect(Array.isArray(ANALYTICS_EMITTER_MANIFEST)).toBe(true);
    expect(ANALYTICS_EMITTER_MANIFEST.length).toBeGreaterThan(0);
    expect(validateAnalyticsEmitterManifest()).toEqual([]);
  });

  it('exports FE reference path map for grep wiring', () => {
    expect(ANALYTICS_EMITTER_FE_REFERENCE_PATHS).toBeDefined();
    expect(Object.keys(ANALYTICS_EMITTER_FE_REFERENCE_PATHS).length).toBeGreaterThan(0);
  });

  it('manifest cells satisfy exported type contract', () => {
    const cell: AnalyticsEmitterManifestCell = ANALYTICS_EMITTER_MANIFEST[0];
    expect(cell).toMatchObject({
      eventName: expect.any(String),
      surface: expect.stringMatching(/^(kiosk|customer|server)$/),
      layer: expect.stringMatching(/^(FE|BE)$/),
      required: expect.any(Boolean),
      reference: expect.any(String),
    });
  });

  it('E-AC-7/H10: exports PaymentSurfaceReadiness from package entry', () => {
    const readiness: PaymentSurfaceReadiness = buildPaymentSurfaceReadiness({
      payableVerifiedMethodCount: 1,
      methods: {
        bankTransfer: { enabled: true, ready: true, verified: true },
        gateway: { enabled: false, ready: false, verified: false },
      },
    });
    expect(readiness.payableVerifiedMethodCount).toBe(1);
  });
});
