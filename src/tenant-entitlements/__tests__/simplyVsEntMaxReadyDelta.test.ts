import {
  COMMERCIAL_PLAN_IDS,
  computeSimplyVsEntMaxReadyDelta,
  ENTITLEMENT_BLOCK_KEYS,
  evaluateCommercialPackageDecision,
  getCommercialPackagingRule,
  isEntitlementBlockProductionEnableAllowed,
  type EntitlementBlockKey,
} from '../index.js';

function rebuildDelta(plan: 'FREE' | 'PRO' | 'GROWTH'): EntitlementBlockKey[] {
  const max = new Set(
    ENTITLEMENT_BLOCK_KEYS.filter((key) => isEntitlementBlockProductionEnableAllowed(key)),
  );
  const simply = new Set(
    ENTITLEMENT_BLOCK_KEYS.filter(
      (key) =>
        evaluateCommercialPackageDecision(plan, getCommercialPackagingRule(key)) === 'ALLOW',
    ),
  );
  return ENTITLEMENT_BLOCK_KEYS.filter((key) => max.has(key) && !simply.has(key));
}

describe('computeSimplyVsEntMaxReadyDelta (G8 SoT)', () => {
  it.each([...COMMERCIAL_PLAN_IDS])(
    'matches Max \\ Simply set-math for plan %s and stays unique + catalog-ordered',
    (plan) => {
      const delta = computeSimplyVsEntMaxReadyDelta(plan);
      expect(delta).toEqual(rebuildDelta(plan));
      expect(new Set(delta).size).toBe(delta.length);
      const catalogIndex = new Map(ENTITLEMENT_BLOCK_KEYS.map((k, i) => [k, i]));
      for (let i = 1; i < delta.length; i += 1) {
        expect(catalogIndex.get(delta[i]!)!).toBeGreaterThan(catalogIndex.get(delta[i - 1]!)!);
      }
    },
  );

  it('FREE illustrative deltas include PRO packaging blocks that are production-enable allowed', () => {
    const freeDelta = computeSimplyVsEntMaxReadyDelta('FREE');
    for (const key of ['payments_hub_ui', 'inventory_operations', 'analytics_overview'] as const) {
      expect(isEntitlementBlockProductionEnableAllowed(key)).toBe(true);
      expect(evaluateCommercialPackageDecision('FREE', getCommercialPackagingRule(key))).toBe(
        'DENY',
      );
      expect(freeDelta).toContain(key);
    }
  });

  it('never includes commercially ALLOW blocks for the same plan', () => {
    for (const plan of COMMERCIAL_PLAN_IDS) {
      const delta = new Set(computeSimplyVsEntMaxReadyDelta(plan));
      for (const key of ENTITLEMENT_BLOCK_KEYS) {
        if (evaluateCommercialPackageDecision(plan, getCommercialPackagingRule(key)) === 'ALLOW') {
          expect(delta.has(key)).toBe(false);
        }
      }
    }
  });

  it('never includes production-enable-denied blocks (e.g. CAP-10 tenant_brand_kit)', () => {
    expect(isEntitlementBlockProductionEnableAllowed('tenant_brand_kit')).toBe(false);
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(computeSimplyVsEntMaxReadyDelta(plan)).not.toContain('tenant_brand_kit');
    }
  });

  it('source module does not reference buildFullDemoSimpleStates', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.join(__dirname, '..', 'simplyVsEntMaxReadyDelta.ts');
    const source = fs.readFileSync(file, 'utf8');
    expect(source).not.toMatch(/buildFullDemoSimpleStates/);
  });
});
