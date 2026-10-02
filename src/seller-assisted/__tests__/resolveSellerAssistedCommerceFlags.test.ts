import { describe, expect, it } from '@jest/globals';
import {
  resolveCustomerFacingCashAttestationEnabled,
  resolveCustomerFacingCashAttestationEnabledFromCommerceConfig,
  resolveKioskSellerAssistedEnabled,
  resolveKioskSellerAssistedEnabledFromCommerceConfig,
} from '../resolveSellerAssistedCommerceFlags.js';

describe('resolveSellerAssistedCommerceFlags', () => {
  it('fail-closed defaults for commerceConfigJson', () => {
    expect(resolveKioskSellerAssistedEnabledFromCommerceConfig(null)).toBe(false);
    expect(resolveKioskSellerAssistedEnabledFromCommerceConfig({})).toBe(false);
    expect(resolveCustomerFacingCashAttestationEnabledFromCommerceConfig(undefined)).toBe(false);
    expect(
      resolveKioskSellerAssistedEnabledFromCommerceConfig({ staffSellingEnabled: true }),
    ).toBe(false);
  });

  it('reads dedicated SA / CF cash flags only when true', () => {
    expect(
      resolveKioskSellerAssistedEnabledFromCommerceConfig({ kioskSellerAssistedEnabled: true }),
    ).toBe(true);
    expect(
      resolveKioskSellerAssistedEnabledFromCommerceConfig({ kioskSellerAssistedEnabled: false }),
    ).toBe(false);
    expect(
      resolveCustomerFacingCashAttestationEnabledFromCommerceConfig({
        customerFacingCashAttestationEnabled: true,
      }),
    ).toBe(true);
  });

  it('prefers explicit public-config flag over commerceConfigJson', () => {
    expect(
      resolveKioskSellerAssistedEnabled({
        kioskSellerAssistedEnabled: false,
        commerceConfigJson: { kioskSellerAssistedEnabled: true },
      }),
    ).toBe(false);
    expect(
      resolveCustomerFacingCashAttestationEnabled({
        customerFacingCashAttestationEnabled: true,
        commerceConfigJson: { customerFacingCashAttestationEnabled: false },
      }),
    ).toBe(true);
  });
});
