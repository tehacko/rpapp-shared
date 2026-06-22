/**
 * Customer PWA first-path segments under `/:tenantCode/...` that must not be used as kiosk codes.
 */
export const RESERVED_KIOSK_SLUGS = [
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

const RESERVED_SET = new Set<string>(RESERVED_KIOSK_SLUGS);

export function isReservedKioskSlug(slug: string): boolean {
  return RESERVED_SET.has(slug.trim().toLowerCase());
}
