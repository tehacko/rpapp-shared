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
  it('maps every current entitlement block key exactly once (A-AC-01 / Package E 57)', () => {
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(57);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(57);
    expect(Object.keys(COMMERCIAL_PACKAGING)).toHaveLength(57);
    for (const key of ENTITLEMENT_BLOCK_KEYS) {
      expect(COMMERCIAL_PACKAGING[key]).toBeDefined();
      expect(COMMERCIAL_PACKAGING[key].commercialPlacements.length).toBeGreaterThan(0);
      expect(COMMERCIAL_ALIGNMENT_STATUSES).toContain(COMMERCIAL_PACKAGING[key].alignmentStatus);
      expect(SELLABILITY_STATUSES).toContain(COMMERCIAL_PACKAGING[key].sellabilityStatus);
    }
  });

  it('keeps catalog version 13 (Package E automation boundaries)', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(13);
  });

  it('D-AC-21: Package D split parents are ALIGNED (not REFACTOR_REQUIRED)', () => {
    expect(COMMERCIAL_PACKAGING.inventory_management).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.inventory_operations).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.inventory_incidents).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.payment_reconciliation).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.audit_logs_admin_ui).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.audit_intelligence).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.team_management_core).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.permission_management_rbac).toMatchObject({
      commercialPlacements: ['GROWTH'],
      alignmentStatus: 'ALIGNED',
    });
  });

  it('Package E: donation_recurring / tenant_ops_automation / restock_alerts are PRO ALIGNED', () => {
    expect(COMMERCIAL_PACKAGING.donation_recurring).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.tenant_ops_automation).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.restock_alerts).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.donation_recurring)).toBe(
      'DENY',
    );
    expect(evaluateCommercialPackageDecision('PRO', COMMERCIAL_PACKAGING.tenant_ops_automation)).toBe(
      'ALLOW',
    );
  });

  /** D-AC-07 — integrity/matching stays FREE; Hub is PRO (workers must not inherit Hub negate). */
  it('D-AC-07: payment_reconciliation FREE ALLOW; payments_hub_ui PRO DENY on FREE plan', () => {
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.payment_reconciliation)).toBe(
      'ALLOW',
    );
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.payments_hub_ui)).toBe('DENY');
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
      'NON_COMMERCIAL',
    ] satisfies CommercialPlacementId[]);
    expect(COMMERCIAL_PACKAGING.analytics_basic.commercialPlacements).toEqual(['FREE']);
    expect(COMMERCIAL_PACKAGING.analytics_overview.commercialPlacements).toEqual(['PRO']);
    expect(COMMERCIAL_PACKAGING.analytics_explore.commercialPlacements).toEqual(['GROWTH']);
    expect(COMMERCIAL_PACKAGING.analytics_explore.sellabilityStatus).toBe('DO_NOT_SELL');
    expect(COMMERCIAL_PACKAGING.receipt_delivery.commercialPlacements).toEqual([
      'NON_COMMERCIAL',
      'GROWTH',
    ]);
  });

  it('B4: admin_mfa is NON_COMMERCIAL; FREE/PRO/GROWTH never tariff-DENY', () => {
    const adminMfa = COMMERCIAL_PACKAGING.admin_mfa;
    expect(adminMfa.commercialPlacements).toEqual(['NON_COMMERCIAL']);
    expect(adminMfa.sellabilityStatus).toBe('NOT_APPLICABLE');
    for (const plan of COMMERCIAL_PLAN_IDS) {
      const decision = evaluateCommercialPackageDecision(plan, adminMfa);
      expect(decision).not.toBe('DENY');
      expect(decision).toBe('DEFER');
    }
  });
});
