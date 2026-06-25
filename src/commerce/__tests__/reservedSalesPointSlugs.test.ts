import { describe, expect, it } from '@jest/globals';
import {
  isReservedSalesPointSlug,
  RESERVED_SALES_POINT_SLUGS,
} from '../reservedSalesPointSlugs.js';

/**
 * First path segments under `/:tenantCode/...` in rpapp-customer `App.tsx` (TenantScopedShell).
 * Update this list when customer PWA adds a new top-level tenant route that is not `:salesPointSlug`.
 */
const CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS = [
  'account',
  'card',
  'checkout',
  'confirm-email',
  'donate',
  'forgot-password',
  'onboarding',
  'pickup',
  'post-kiosk',
  'post-kiosk-failure',
  'reset-password',
  'shop',
  'sign-in',
  'sign-up',
] as const;

describe('reservedSalesPointSlugs', () => {
  it('flags every customer PWA first-segment route as reserved', () => {
    for (const segment of CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS) {
      expect(isReservedSalesPointSlug(segment)).toBe(true);
      expect(RESERVED_SALES_POINT_SLUGS).toContain(segment);
    }
  });

  it('does not flag ordinary sales-point slug examples', () => {
    expect(isReservedSalesPointSlug('my-cafe')).toBe(false);
    expect(isReservedSalesPointSlug('cafe-main')).toBe(false);
  });

  it('RESERVED_SALES_POINT_SLUGS stays aligned with CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS', () => {
    expect([...RESERVED_SALES_POINT_SLUGS].sort()).toEqual(
      [...CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS].sort(),
    );
  });
});
