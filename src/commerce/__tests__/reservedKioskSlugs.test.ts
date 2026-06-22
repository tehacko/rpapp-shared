import { describe, expect, it } from '@jest/globals';
import { isReservedKioskSlug, RESERVED_KIOSK_SLUGS } from '../reservedKioskSlugs.js';

/**
 * First path segments under `/:tenantCode/...` in rpapp-customer `App.tsx` (TenantScopedShell).
 * Update this list when customer PWA adds a new top-level tenant route that is not `:kioskSlug`.
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

describe('reservedKioskSlugs', () => {
  it('flags every customer PWA first-segment route as reserved', () => {
    for (const segment of CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS) {
      expect(isReservedKioskSlug(segment)).toBe(true);
      expect(RESERVED_KIOSK_SLUGS).toContain(segment);
    }
  });

  it('does not flag ordinary kiosk slug examples', () => {
    expect(isReservedKioskSlug('my-cafe')).toBe(false);
    expect(isReservedKioskSlug('kiosk-1')).toBe(false);
  });

  it('RESERVED_KIOSK_SLUGS stays aligned with CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS', () => {
    expect([...RESERVED_KIOSK_SLUGS].sort()).toEqual([...CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS].sort());
  });
});
