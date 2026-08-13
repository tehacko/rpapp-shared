import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from '../catalog.js';

describe('tenant entitlement catalog', () => {
  it('contains exactly 49 blocks', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(49);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(49);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(49);
  });

  it('uses catalog version 3 after admin_mfa', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(3);
  });

  it('has unique blockKeys matching ENTITLEMENT_BLOCK_KEYS order', () => {
    const keysFromCatalog = TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => entry.blockKey);
    expect(keysFromCatalog).toEqual([...ENTITLEMENT_BLOCK_KEYS]);
    expect(new Set(keysFromCatalog).size).toBe(49);
  });

  it('includes payment_cash as CONDITIONAL under payment_rails_strategy', () => {
    const paymentCash = getEntitlementBlockCatalogEntry('payment_cash');
    expect(paymentCash.blockClass).toBe('CONDITIONAL');
    expect(paymentCash.parentKeys).toEqual(['payment_rails_strategy']);
  });

  it('includes admin_notifications as CONDITIONAL default-off inbox block', () => {
    const notifications = getEntitlementBlockCatalogEntry('admin_notifications');
    expect(notifications.blockClass).toBe('CONDITIONAL');
    expect(notifications.parentKeys).toEqual([]);
    expect(notifications.routeSuffix).toBe('inbox');
  });

  it('includes admin_mfa as CONDITIONAL default-off TOTP block under tenant_ops_settings', () => {
    const adminMfa = getEntitlementBlockCatalogEntry('admin_mfa');
    expect(adminMfa.blockClass).toBe('CONDITIONAL');
    expect(adminMfa.parentKeys).toEqual(['tenant_ops_settings']);
    expect(adminMfa.capabilityHint).toBe('account.self.manage');
  });

  it('includes mission_control under analytics_detailed with MC capability hint', () => {
    const missionControl = getEntitlementBlockCatalogEntry('mission_control');
    expect(missionControl.parentKeys).toEqual(['analytics_detailed']);
    expect(missionControl.adminNavSectionId).toBe('mission-control');
    expect(missionControl.capabilityHint).toBe('analytics:mission-control:read');
  });

  it('includes normative loyalty, promotions, and reconciliation blocks', () => {
    const loyalty = getEntitlementBlockCatalogEntry('loyalty_program');
    expect(loyalty.parentKeys).toEqual(['product_vending']);

    const promotions = getEntitlementBlockCatalogEntry('promotions_program');
    expect(promotions.parentKeys).toEqual(['product_vending']);
    expect(promotions.capabilityHint).toBe('promo:rewards:read');

    const tenantOps = getEntitlementBlockCatalogEntry('tenant_ops_settings');
    expect(tenantOps.blockClass).toBe('CORE_REQUIRED');

    const reconciliation = getEntitlementBlockCatalogEntry('payment_reconciliation');
    expect(reconciliation.blockClass).toBe('STRATEGY');
    expect(reconciliation.defaultStrategy).toEqual({
      allowedModes: ['MODE_1', 'MODE_2'],
    });
  });

  it('lists staff_pickup_scan OR parents + required infra in catalog as SSOT (ENT-PR-03)', () => {
    const staffPickupScan = getEntitlementBlockCatalogEntry('staff_pickup_scan');
    expect(staffPickupScan.parentKeys).toEqual(['pickup_points', 'immediate_self_pickup']);
    expect(staffPickupScan.parentOperator).toBe('OR');
    expect(staffPickupScan.requiredParentKeys).toEqual(['order_pickup_infrastructure']);
  });

  it('keeps immediate_self_pickup independent of order_pickup_infrastructure', () => {
    const immediate = getEntitlementBlockCatalogEntry('immediate_self_pickup');
    expect(immediate.parentKeys).toEqual([]);
  });

  it('gates customer_self_collect on immediate_self_pickup AND order_pickup_infrastructure', () => {
    const selfCollect = getEntitlementBlockCatalogEntry('customer_self_collect');
    expect(selfCollect.parentKeys).toEqual(['immediate_self_pickup', 'order_pickup_infrastructure']);
  });

  it('guards isEntitlementBlockKey for known and unknown keys', () => {
    expect(isEntitlementBlockKey('product_vending')).toBe(true);
    expect(isEntitlementBlockKey('platform_dev')).toBe(false);
    expect(isEntitlementBlockKey('surface_admin_tenant_ops')).toBe(false);
  });
});
