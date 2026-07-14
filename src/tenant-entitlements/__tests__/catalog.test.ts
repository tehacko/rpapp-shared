import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from '../catalog.js';

describe('tenant entitlement catalog', () => {
  it('contains exactly 46 blocks', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(46);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(46);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(46);
  });

  it('uses catalog version 1 for initial seed', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(1);
  });

  it('has unique blockKeys matching ENTITLEMENT_BLOCK_KEYS order', () => {
    const keysFromCatalog = TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => entry.blockKey);
    expect(keysFromCatalog).toEqual([...ENTITLEMENT_BLOCK_KEYS]);
    expect(new Set(keysFromCatalog).size).toBe(46);
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

  it('guards isEntitlementBlockKey for known and unknown keys', () => {
    expect(isEntitlementBlockKey('product_vending')).toBe(true);
    expect(isEntitlementBlockKey('platform_dev')).toBe(false);
    expect(isEntitlementBlockKey('surface_admin_tenant_ops')).toBe(false);
  });
});
