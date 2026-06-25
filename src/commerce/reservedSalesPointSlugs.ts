/**
 * Customer PWA first-path segments under `/:tenantCode/...` that must not be used as sales point codes.
 */
export const RESERVED_SALES_POINT_SLUGS = [
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

const RESERVED_SET = new Set<string>(RESERVED_SALES_POINT_SLUGS);

export function isReservedSalesPointSlug(slug: string): boolean {
  return RESERVED_SET.has(slug.trim().toLowerCase());
}
