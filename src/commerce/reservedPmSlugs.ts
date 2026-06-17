/** First URL segment denylist for prodejni misto slugs (customer PWA routes). */
export const RESERVED_PM_SLUGS = [
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

export type ReservedPmSlug = (typeof RESERVED_PM_SLUGS)[number];

const RESERVED_PM_SLUG_SET = new Set<string>(RESERVED_PM_SLUGS);

export function isReservedPmSlug(slug: string): boolean {
  return RESERVED_PM_SLUG_SET.has(slug.trim().toLowerCase());
}
