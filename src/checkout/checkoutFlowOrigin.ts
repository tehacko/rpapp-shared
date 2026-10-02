/**
 * Checkout flow origin + API entry channel (Seller-Assisted Retail V1A).
 *
 * Additive contract for kiosk / customer / backend consumers via `pi-kiosk-shared`.
 * `SELLER_ASSISTED_KIOSK` marks STAFF_OPERATED seller-assisted sessions — not a nested
 * product mode and not pickup `staffSellingEnabled`.
 */

/** Discriminator stored on session metadata for seller-assisted mint paths. */
export const CHECKOUT_FLOW_ORIGIN_SELLER_ASSISTED_KIOSK = 'SELLER_ASSISTED_KIOSK' as const;

export const CHECKOUT_FLOW_ORIGINS = [CHECKOUT_FLOW_ORIGIN_SELLER_ASSISTED_KIOSK] as const;

export type CheckoutFlowOrigin = (typeof CHECKOUT_FLOW_ORIGINS)[number];

/**
 * Checkout session / payment-create entry channel.
 * Mirrors customer `EntryChannel` + backend `ApiEntryChannel`, plus SA additive value.
 */
export const API_ENTRY_CHANNELS = [
  'KIOSK_QR',
  'PHONE_FIRST_PWA',
  'POST_KIOSK_PWA',
  'SELLER_ASSISTED_KIOSK',
] as const;

export type ApiEntryChannel = (typeof API_ENTRY_CHANNELS)[number];

export function isCheckoutFlowOrigin(value: unknown): value is CheckoutFlowOrigin {
  return (
    typeof value === 'string' &&
    (CHECKOUT_FLOW_ORIGINS as readonly string[]).includes(value)
  );
}

export function isApiEntryChannel(value: unknown): value is ApiEntryChannel {
  return typeof value === 'string' && (API_ENTRY_CHANNELS as readonly string[]).includes(value);
}

export function isSellerAssistedKioskOrigin(value: unknown): boolean {
  return value === CHECKOUT_FLOW_ORIGIN_SELLER_ASSISTED_KIOSK;
}
