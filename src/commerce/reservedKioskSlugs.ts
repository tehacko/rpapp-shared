/** First URL segment denylist for kiosk customer-shop slugs (customer PWA routes). */
export const RESERVED_KIOSK_SLUGS = [
  'shop',
  'donate',
  'account',
  'checkout',
  'sign-in',
  'post-kiosk',
  'post-kiosk-failure',
  'orders',
  'order',
  'card',
  'pickup',
  'confirm-email',
] as const;

export type ReservedKioskSlug = (typeof RESERVED_KIOSK_SLUGS)[number];

const RESERVED_KIOSK_SLUG_SET = new Set<string>(RESERVED_KIOSK_SLUGS);

export function isReservedKioskSlug(slug: string): boolean {
  return RESERVED_KIOSK_SLUG_SET.has(slug.trim().toLowerCase());
}
