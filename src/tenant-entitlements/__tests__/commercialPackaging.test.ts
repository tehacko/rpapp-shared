import {
  COMMERCIAL_ALIGNMENT_STATUSES,
  COMMERCIAL_PACKAGING,
  COMMERCIAL_PLAN_IDS,
  COMMERCIAL_PLACEMENT_IDS,
  ENTITLEMENT_BLOCK_KEYS,
  evaluateCommercialPackageDecision,
  SELLABILITY_STATUSES,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  type CommercialPlacementId,
} from '../index.js';

describe('commercialPackaging (Package A)', () => {
  it('maps every current entitlement block key exactly once (A-AC-01)', () => {
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(50);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(50);
    expect(Object.keys(COMMERCIAL_PACKAGING)).toHaveLength(50);
    for (const key of ENTITLEMENT_BLOCK_KEYS) {
      expect(COMMERCIAL_PACKAGING[key]).toBeDefined();
      expect(COMMERCIAL_PACKAGING[key].commercialPlacements.length).toBeGreaterThan(0);
      expect(COMMERCIAL_ALIGNMENT_STATUSES).toContain(COMMERCIAL_PACKAGING[key].alignmentStatus);
      expect(SELLABILITY_STATUSES).toContain(COMMERCIAL_PACKAGING[key].sellabilityStatus);
    }
  });

  it('keeps catalog version 10 unchanged (A-AC-02 / A-AC-13)', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(10);
  });

  it('keeps three axes separate; DO_NOT_SELL is not a placement (A-AC-03)', () => {
    expect(COMMERCIAL_PLACEMENT_IDS).not.toContain('DO_NOT_SELL');
    expect(SELLABILITY_STATUSES).toContain('DO_NOT_SELL');
    for (const key of ENTITLEMENT_BLOCK_KEYS) {
      const rule = COMMERCIAL_PACKAGING[key];
      expect(rule).toHaveProperty('commercialPlacements');
      expect(rule).toHaveProperty('alignmentStatus');
      expect(rule).toHaveProperty('sellabilityStatus');
      expect(rule).not.toHaveProperty('placements');
      for (const p of rule.commercialPlacements) {
        expect(COMMERCIAL_PLACEMENT_IDS).toContain(p);
      }
    }
  });

  it('returns ALLOW/DENY for ALIGNED single FREE/PRO/GROWTH by ladder (A-AC-04)', () => {
    const transactions = COMMERCIAL_PACKAGING.transactions;
    expect(transactions.alignmentStatus).toBe('ALIGNED');
    expect(transactions.commercialPlacements).toEqual(['FREE']);
    expect(evaluateCommercialPackageDecision('FREE', transactions)).toBe('ALLOW');
    expect(evaluateCommercialPackageDecision('PRO', transactions)).toBe('ALLOW');
    expect(evaluateCommercialPackageDecision('GROWTH', transactions)).toBe('ALLOW');

    const incident = COMMERCIAL_PACKAGING.incident_centre_ui;
    expect(incident.commercialPlacements).toEqual(['PRO']);
    expect(evaluateCommercialPackageDecision('FREE', incident)).toBe('DENY');
    expect(evaluateCommercialPackageDecision('PRO', incident)).toBe('ALLOW');
    expect(evaluateCommercialPackageDecision('GROWTH', incident)).toBe('ALLOW');

    const multiCurrency = COMMERCIAL_PACKAGING.payment_multi_currency;
    expect(multiCurrency.commercialPlacements).toEqual(['GROWTH']);
    expect(evaluateCommercialPackageDecision('FREE', multiCurrency)).toBe('DENY');
    expect(evaluateCommercialPackageDecision('PRO', multiCurrency)).toBe('DENY');
    expect(evaluateCommercialPackageDecision('GROWTH', multiCurrency)).toBe('ALLOW');
  });

  it('DEFERS REFACTOR_REQUIRED, NON_COMMERCIAL, SEPARATE_PRODUCT, DO_NOT_SELL (A-AC-05)', () => {
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.donation)).toBe('DEFER');
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.platform_core)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.surface_kiosk)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.loyalty_program)).toBe(
        'DEFER',
      );
      expect(
        evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.staff_pickup_scan),
      ).toBe('DEFER');
    }
  });

  it('encodes Spec + multi-placements without membership reinterpretation', () => {
    expect(COMMERCIAL_PACKAGING.analytics.commercialPlacements).toEqual([
      'FREE',
      'PRO',
      'GROWTH',
    ] satisfies CommercialPlacementId[]);
    expect(COMMERCIAL_PACKAGING.receipt_delivery.commercialPlacements).toEqual([
      'NON_COMMERCIAL',
      'GROWTH',
    ]);
  });
});
