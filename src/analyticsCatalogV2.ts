/**
 * Catalog v2 extension events (Retail V1 Analytics plan Part 4–5).
 * v1 event names remain valid at catalogVersion 1; v2 adds funnel + identity P0 names.
 */
export const ANALYTICS_CATALOG_V2_VERSION = 2 as const;

export const ANALYTICS_V2_EXTENSION_EVENTS = {
  QR_DISPLAYED: 'qr_displayed',
  MENU_OPENED: 'menu_opened',
  PRODUCT_SELECTED: 'product_selected',
  IDENTITY_RECOGNIZED: 'identity_recognized',
  IDENTITY_LINKED: 'identity_linked',
  /** C-01 / PO-01 — catalog stub only; no production emit until PO approves. */
  IDENTITY_MATCHED: 'identity_matched',
  IDENTITY_DELETED: 'identity_deleted',
  CUSTOMER_DELETED: 'customer_deleted',
  ACCOUNT_LOGGED_OUT: 'account_logged_out',
  PROFILE_UPDATED: 'profile_updated',
  RECEIPT_DOWNLOADED: 'receipt_downloaded',
} as const;

export type AnalyticsV2ExtensionEventName =
  (typeof ANALYTICS_V2_EXTENSION_EVENTS)[keyof typeof ANALYTICS_V2_EXTENSION_EVENTS];

export const ANALYTICS_V2_EXTENSION_EVENT_NAMES = Object.values(
  ANALYTICS_V2_EXTENSION_EVENTS,
) as AnalyticsV2ExtensionEventName[];

const V2_EXTENSION_SET = new Set<string>(ANALYTICS_V2_EXTENSION_EVENT_NAMES);

export function isAnalyticsV2ExtensionEventName(name: string): name is AnalyticsV2ExtensionEventName {
  return V2_EXTENSION_SET.has(name);
}
