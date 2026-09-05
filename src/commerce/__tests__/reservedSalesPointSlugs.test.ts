import { describe, expect, it } from '@jest/globals';
import {
  isReservedSalesPointSlug,
  RESERVED_SALES_POINT_SLUGS,
  resolveReservedSalesPointCollisionPath,
} from '../reservedSalesPointSlugs.js';

/**
 * First path segments under `/:tenantCode/...` that shell / browseVisitStack treat as non-SP hubs.
 * Update when customer PWA adds a new top-level tenant (or platform-under-tenant) route that is not `:salesPointSlug`.
 */
const CUSTOMER_PWA_RESERVED_FIRST_SEGMENTS = [
  'account',
  'browse',
  'card',
  'checkout',
  'confirm-email',
  'donate',
  'favorites',
  'forgot-password',
  'help',
  'home',
  'more',
  'onboarding',
  'orders',
  'pickup',
  'post-kiosk',
  'post-kiosk-failure',
  'receipt-recovery',
  'recovery',
  'reset-password',
  'scan',
  'shop',
  'shops',
  'sign-in',
  'sign-up',
  'unavailable',
] as const;

/** Hub segments that historically collided with `:kioskSlug/:productSlug` when nested. */
const HUB_COLLISION_SEGMENTS = [
  'shops',
  'more',
  'browse',
  'orders',
  'scan',
  'favorites',
  'help',
  'shop',
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

  it('flags hub collision segments that must never bind as kioskSlug', () => {
    for (const segment of HUB_COLLISION_SEGMENTS) {
      expect(isReservedSalesPointSlug(segment)).toBe(true);
    }
  });

  it('resolveReservedSalesPointCollisionPath drops fake product under tenant hubs', () => {
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'shops')).toBe(
      '/railway-cafe/shops',
    );
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'more')).toBe(
      '/railway-cafe/more',
    );
    expect(resolveReservedSalesPointCollisionPath('Acme', 'SHOPS')).toBe('/Acme/shops');
  });

  it('resolveReservedSalesPointCollisionPath sends platform-only hubs off tenant scope', () => {
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'browse')).toBe('/browse');
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'favorites')).toBe(
      '/favorites',
    );
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'scan')).toBe('/scan');
    expect(resolveReservedSalesPointCollisionPath('railway-cafe', 'receipt-recovery')).toBe(
      '/receipt-recovery',
    );
  });
});
