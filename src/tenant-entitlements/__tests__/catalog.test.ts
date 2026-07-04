import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from '../catalog.js';

describe('tenant entitlement catalog', () => {
  it('contains exactly 44 blocks', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(44);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(44);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(44);
  });

  it('uses catalog version 1 for initial seed', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(1);
  });

  it('has unique blockKeys matching ENTITLEMENT_BLOCK_KEYS order', () => {
    const keysFromCatalog = TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => entry.blockKey);
    expect(keysFromCatalog).toEqual([...ENTITLEMENT_BLOCK_KEYS]);
    expect(new Set(keysFromCatalog).size).toBe(44);
  });

  it('includes normative loyalty and reconciliation blocks', () => {
    const loyalty = getEntitlementBlockCatalogEntry('loyalty_program');
    expect(loyalty.parentKeys).toEqual(['product_vending']);

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
