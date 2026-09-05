import { isDefaultOffRolloutBlockKey } from '../adminMfaEntitlement.js';
import { isPlatformDefaultAllowDenyBlockKey } from '../platformDefaultAllowDeny.js';
import { PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY } from '../productBarcodeAdministrationEntitlement.js';
import { getEntitlementBlockCatalogEntry } from '../catalog.js';

describe('product_barcode_administration entitlement', () => {
  it('exports stable block key constant', () => {
    expect(PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY).toBe('product_barcode_administration');
  });

  it('is CONDITIONAL purpose-locked under product_vending', () => {
    const entry = getEntitlementBlockCatalogEntry(PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY);
    expect(entry.blockClass).toBe('CONDITIONAL');
    expect(entry.parentKeys).toEqual(['product_vending']);
    expect(entry.notes).toMatch(/purpose-locked ON/i);
  });

  it('is absent from platform default-allow DENY and DEFAULT_OFF rollout', () => {
    expect(isPlatformDefaultAllowDenyBlockKey(PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY)).toBe(false);
    expect(isDefaultOffRolloutBlockKey(PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY)).toBe(false);
  });
});
