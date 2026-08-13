import { execFileSync } from 'node:child_process';
import path from 'node:path';
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

  it('main barrel does not export React UI (Node/backend-safe)', async () => {
    const mod = await import('../index.js');
    expect('DatabaseUnavailable' in mod).toBe(false);
    expect('useDatabaseHealth' in mod).toBe(false);
    expect('useSubmitCooldown' in mod).toBe(false);
    expect('CatalogImagePlaceholder' in mod).toBe(false);
    expect('ProviderIcon' in mod).toBe(false);
  });

  it('main barrel compiled graph is Node-without-React (static gate)', () => {
    const sharedRoot = path.join(__dirname, '..', '..');
    const scriptPath = path.join(
      sharedRoot,
      'scripts',
      'assert-main-barrel-node-safe.mjs',
    );
    // Gate asserts shared/dist AND each existing consumer install copy of
    // pi-kiosk-shared. Missing install under an existing consumer package dir
    // fails unless GATE_ALLOW_MISSING_CONSUMERS / ENSURE_DIST_* skip is set.
    const output = execFileSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      cwd: sharedRoot,
    });
    expect(output).toMatch(/\[shared\/dist\] visited \d+ files/);
    expect(output).toMatch(/assert-main-barrel-node-safe: PASS/);
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

  it('exports order fulfillment list contracts (collectTiming / productCollectionMode)', async () => {
    const mod = await import('../index.js');
    expect(mod.PRODUCT_COLLECTION_MODES).toEqual(['PAY_AT_KIOSK', 'PREPAY_COLLECT_LATER']);
    expect(mod.COLLECT_TIMINGS).toEqual(['NOW', 'LATER']);
    expect(typeof mod.isProductCollectionMode).toBe('function');
    expect(typeof mod.isCollectTiming).toBe('function');
    expect(mod.isProductCollectionMode('PAY_AT_KIOSK')).toBe(true);
    expect(mod.isCollectTiming('LATER')).toBe(true);
  });
});
