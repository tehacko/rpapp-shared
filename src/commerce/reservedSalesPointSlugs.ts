/**
 * Customer PWA first-path segments under `/:tenantCode/...` that must not be used as sales point codes.
 * Must stay aligned with shell non-SP hubs (`TENANT_NON_SLUG_SEGMENTS` / browseVisitStack) so
 * `/{tenant}/{hub}/…` never binds as `:kioskSlug/:productSlug`.
 */
export const RESERVED_SALES_POINT_SLUGS = [
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

const RESERVED_SET = new Set<string>(RESERVED_SALES_POINT_SLUGS);

/** Platform chrome hubs that are not tenant-scoped retail routes. */
const PLATFORM_ONLY_HUBS = new Set([
  'browse',
  'favorites',
  'receipt-recovery',
  'scan',
]);

export function isReservedSalesPointSlug(slug: string): boolean {
  return RESERVED_SET.has(slug.trim().toLowerCase());
}

/**
 * Canonical path when a reserved hub was matched as `:kioskSlug` (optionally with `:productSlug`).
 * Drops the fake product segment and restores the hub root (or platform path).
 */
export function resolveReservedSalesPointCollisionPath(
  tenantCode: string,
  reservedSlug: string,
): string {
  const slug = reservedSlug.trim().toLowerCase();
  const tenant = tenantCode.trim();
  if (slug.length === 0 || slug === 'home') {
    return tenant.length > 0 ? `/${encodeURIComponent(tenant)}/shops` : '/shops';
  }
  if (PLATFORM_ONLY_HUBS.has(slug)) {
    return `/${encodeURIComponent(slug)}`;
  }
  if (tenant.length === 0) {
    return `/${encodeURIComponent(slug)}`;
  }
  return `/${encodeURIComponent(tenant)}/${encodeURIComponent(slug)}`;
}
