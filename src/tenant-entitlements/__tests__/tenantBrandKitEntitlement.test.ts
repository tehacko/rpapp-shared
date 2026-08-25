import { TENANT_BRAND_KIT_BLOCK_KEY } from '../tenantBrandKitEntitlement.js';
import { isDefaultOffRolloutBlockKey } from '../adminMfaEntitlement.js';
import { getEntitlementBlockCatalogEntry, isEntitlementBlockKey } from '../catalog.js';

describe('tenantBrandKitEntitlement', () => {
  it('is a catalog CONDITIONAL default-off child of tenant_ops_settings', () => {
    expect(TENANT_BRAND_KIT_BLOCK_KEY).toBe('tenant_brand_kit');
    expect(isEntitlementBlockKey(TENANT_BRAND_KIT_BLOCK_KEY)).toBe(true);
    expect(isDefaultOffRolloutBlockKey(TENANT_BRAND_KIT_BLOCK_KEY)).toBe(true);
    const entry = getEntitlementBlockCatalogEntry(TENANT_BRAND_KIT_BLOCK_KEY);
    expect(entry.blockClass).toBe('CONDITIONAL');
    expect(entry.parentKeys).toEqual(['tenant_ops_settings']);
  });
});
