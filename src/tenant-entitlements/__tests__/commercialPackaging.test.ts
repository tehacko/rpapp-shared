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
  it('maps every current entitlement block key exactly once (A-AC-01 / SoT v14/60)', () => {
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(60);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(60);
    expect(Object.keys(COMMERCIAL_PACKAGING)).toHaveLength(60);
    for (const key of ENTITLEMENT_BLOCK_KEYS) {
      expect(COMMERCIAL_PACKAGING[key]).toBeDefined();
      expect(COMMERCIAL_PACKAGING[key].commercialPlacements.length).toBeGreaterThan(0);
      expect(COMMERCIAL_ALIGNMENT_STATUSES).toContain(COMMERCIAL_PACKAGING[key].alignmentStatus);
      expect(SELLABILITY_STATUSES).toContain(COMMERCIAL_PACKAGING[key].sellabilityStatus);
    }
  });

  it('keeps catalog version 14 (SoT packaging alignment)', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(14);
  });

  it('has zero REFACTOR_REQUIRED keys (SoT v14)', () => {
    const refactorRequired = ENTITLEMENT_BLOCK_KEYS.filter(
      (key) => COMMERCIAL_PACKAGING[key].alignmentStatus === 'REFACTOR_REQUIRED',
    );
    expect(refactorRequired).toEqual([]);
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

  it('Package E: donation_recurring PRO+VALIDATE DEFER; automation/restock PRO OPEN', () => {
    expect(COMMERCIAL_PACKAGING.donation_recurring).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'VALIDATE',
    });
    expect(COMMERCIAL_PACKAGING.tenant_ops_automation).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(COMMERCIAL_PACKAGING.restock_alerts).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.donation_recurring)).toBe(
        'DEFER',
      );
    }
    expect(evaluateCommercialPackageDecision('PRO', COMMERCIAL_PACKAGING.tenant_ops_automation)).toBe(
      'ALLOW',
    );
  });

  it('SoT v14: donation + tenant_ops_settings are FREE ALIGNED ALLOW', () => {
    expect(COMMERCIAL_PACKAGING.donation).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(COMMERCIAL_PACKAGING.tenant_ops_settings).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.donation)).toBe('ALLOW');
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.tenant_ops_settings)).toBe(
        'ALLOW',
      );
    }
  });

  /** D-AC-07 — integrity/matching stays FREE; Hub is PRO (workers must not inherit Hub negate). */
  it('D-AC-07: payment_reconciliation FREE ALLOW; payments_hub_ui PRO DENY on FREE plan', () => {
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.payment_reconciliation)).toBe(
      'ALLOW',
    );
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.payments_hub_ui)).toBe('DENY');
  });

  it('keeps three axes separate; DO_NOT_SELL/VALIDATE are not placements (A-AC-03)', () => {
    expect(COMMERCIAL_PLACEMENT_IDS).not.toContain('DO_NOT_SELL');
    expect(COMMERCIAL_PLACEMENT_IDS).not.toContain('VALIDATE');
    expect(SELLABILITY_STATUSES).toContain('DO_NOT_SELL');
    expect(SELLABILITY_STATUSES).toContain('VALIDATE');
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

  it('DEFERS NON_COMMERCIAL, SEPARATE_PRODUCT, DO_NOT_SELL, VALIDATE (A-AC-05)', () => {
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.loyalty_program)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.platform_core)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.surface_kiosk)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.shipping_light)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.donation_recurring)).toBe(
        'DEFER',
      );
    }
  });

  it('SoT §20 / G-13: shipping_light is SEPARATE_PRODUCT + DO_NOT_SELL (future module, not GROWTH ladder)', () => {
    expect(COMMERCIAL_PACKAGING.shipping_light).toMatchObject({
      commercialPlacements: ['SEPARATE_PRODUCT'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'DO_NOT_SELL',
    });
    expect(COMMERCIAL_PACKAGING.shipping_light.commercialPlacements).not.toContain('GROWTH');
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.shipping_light)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.shipping_light)).not.toBe(
        'ALLOW',
      );
    }
  });

  it('SoT §25 SPLIT / G-14: staff_pickup_scan FREE handoff ALLOW all plans; not REFACTOR_REQUIRED', () => {
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan.alignmentStatus).not.toBe('REFACTOR_REQUIRED');
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan.rationale).toMatch(/§25 SPLIT closed/);
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan.rationale).toMatch(/scheduled_pickup PRO/);
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.staff_pickup_scan)).toBe(
        'ALLOW',
      );
    }
  });

  it('SoT §23/§24/§25: scheduled_pickup PRO DENY on FREE; paid schedule not staff_pickup_scan PRO', () => {
    expect(COMMERCIAL_PACKAGING.scheduled_pickup).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(COMMERCIAL_PACKAGING.scheduled_pickup.alignmentStatus).not.toBe('REFACTOR_REQUIRED');
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.scheduled_pickup)).toBe(
      'DENY',
    );
    expect(evaluateCommercialPackageDecision('PRO', COMMERCIAL_PACKAGING.scheduled_pickup)).toBe(
      'ALLOW',
    );
    expect(evaluateCommercialPackageDecision('GROWTH', COMMERCIAL_PACKAGING.scheduled_pickup)).toBe(
      'ALLOW',
    );
    // Paid scheduling/surface value is not commercially bundled into staff_pickup_scan.
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan.commercialPlacements).toEqual(['FREE']);
    expect(COMMERCIAL_PACKAGING.staff_pickup_scan.commercialPlacements).not.toContain('PRO');
    expect(evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.staff_pickup_scan)).toBe(
      'ALLOW',
    );
  });

  it('SoT v14: bank_account_administration FREE; bank_account_providers GROWTH', () => {
    expect(COMMERCIAL_PACKAGING.bank_account_administration).toMatchObject({
      commercialPlacements: ['FREE'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(COMMERCIAL_PACKAGING.bank_account_providers).toMatchObject({
      commercialPlacements: ['GROWTH'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'OPEN',
    });
    expect(
      evaluateCommercialPackageDecision('FREE', COMMERCIAL_PACKAGING.bank_account_providers),
    ).toBe('DENY');
    expect(
      evaluateCommercialPackageDecision('GROWTH', COMMERCIAL_PACKAGING.bank_account_providers),
    ).toBe('ALLOW');
  });

  it('SoT v14: receipt_delivery NON_COMMERCIAL only; overrides GROWTH DO_NOT_SELL', () => {
    expect(COMMERCIAL_PACKAGING.receipt_delivery.commercialPlacements).toEqual([
      'NON_COMMERCIAL',
    ] satisfies CommercialPlacementId[]);
    expect(COMMERCIAL_PACKAGING.receipt_delivery.alignmentStatus).toBe('ALIGNED');
    expect(COMMERCIAL_PACKAGING.receipt_delivery.sellabilityStatus).toBe('NOT_APPLICABLE');
    expect(COMMERCIAL_PACKAGING.receipt_provider_overrides).toMatchObject({
      commercialPlacements: ['GROWTH'],
      alignmentStatus: 'ALIGNED',
      sellabilityStatus: 'DO_NOT_SELL',
    });
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(
        evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.receipt_delivery),
      ).toBe('DEFER');
      expect(
        evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.receipt_provider_overrides),
      ).toBe('DEFER');
    }
  });

  it('encodes Spec placements without membership reinterpretation', () => {
    expect(COMMERCIAL_PACKAGING.analytics.commercialPlacements).toEqual([
      'NON_COMMERCIAL',
    ] satisfies CommercialPlacementId[]);
    expect(COMMERCIAL_PACKAGING.analytics_basic.commercialPlacements).toEqual(['FREE']);
    expect(COMMERCIAL_PACKAGING.analytics_overview.commercialPlacements).toEqual(['PRO']);
    expect(COMMERCIAL_PACKAGING.analytics_explore.commercialPlacements).toEqual(['GROWTH']);
    expect(COMMERCIAL_PACKAGING.analytics_explore.sellabilityStatus).toBe('DO_NOT_SELL');
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
