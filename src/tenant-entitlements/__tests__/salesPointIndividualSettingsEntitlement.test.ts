import {
  PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS,
  isPlatformDefaultAllowDenyBlockKey,
} from '../platformDefaultAllowDeny.js';
import { SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY } from '../salesPointIndividualSettingsEntitlement.js';
import { isDefaultOffRolloutBlockKey } from '../adminMfaEntitlement.js';
import { getEntitlementBlockCatalogEntry, isEntitlementBlockKey } from '../catalog.js';

describe('sales_point_individual_settings entitlement', () => {
  it('exports a live catalog key', () => {
    expect(SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY).toBe('sales_point_individual_settings');
    expect(isEntitlementBlockKey(SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY)).toBe(true);
    expect(getEntitlementBlockCatalogEntry(SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY).blockClass).toBe(
      'CONDITIONAL',
    );
  });
});

describe('PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS', () => {
  it('G1 — denies sales_point_individual_settings on platform map without DEFAULT_OFF membership', () => {
    expect(PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS).toContain(SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY);
    expect(PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS).not.toContain('product_barcode_administration');
    expect(isPlatformDefaultAllowDenyBlockKey('sales_point_individual_settings')).toBe(true);
    expect(isPlatformDefaultAllowDenyBlockKey('product_barcode_administration')).toBe(false);
    expect(isPlatformDefaultAllowDenyBlockKey('admin_mfa')).toBe(false);
    expect(isDefaultOffRolloutBlockKey('sales_point_individual_settings')).toBe(false);
  });
});
