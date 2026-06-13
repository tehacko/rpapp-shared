/**
 * Analytics event catalog v1 — single source of truth shared across
 * backend, kiosk, customer PWA, and admin (where applicable).
 *
 * Plan §2.1 — core client events (17 universal + 7 retail + 9 donation + 2 kiosk)
 * plus server-side operational extensions (reconciliation, workers).
 * - All names are snake_case.
 * - Catalog version is `1` — `analytics_events.catalogVersion` must equal this.
 * - Unknown event names → HTTP 400 on ingest.
 * - No `KIOSK_*` legacy uppercase names — those constants are removed from
 *   `rpapp-kiosk/.../kioskAnalyticsEvents.ts` per plan §2.1 / §10.2.3.
 */

export const ANALYTICS_EVENT_CATALOG_VERSION = 1 as const;

/**
 * Universal events (17).
 */
export const ANALYTICS_UNIVERSAL_EVENTS = {
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  SESSION_ABANDONED: 'session_abandoned',
  SCREEN_VIEWED: 'screen_viewed',
  CTA_CLICKED: 'cta_clicked',
  BACK_CLICKED: 'back_clicked',
  ERROR_SHOWN: 'error_shown',
  AUTH_FLOW_STARTED: 'auth_flow_started',
  IDENTITY_COMPLETED: 'identity_completed',
  LOGIN_SUCCESS: 'login_success',
  ACCOUNT_CREATED: 'account_created',
  PAYMENT_STARTED: 'payment_started',
  PAYMENT_QR_GENERATED: 'payment_qr_generated',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PAYMENT_FAILED: 'payment_failed',
  RECEIPT_OPENED: 'receipt_opened',
} as const;

/**
 * Retail events (7).
 */
export const ANALYTICS_RETAIL_EVENTS = {
  CATALOG_INTERACTION: 'catalog_interaction',
  PRODUCT_ADDED: 'product_added',
  PRODUCT_REMOVED: 'product_removed',
  CART_VIEWED: 'cart_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  RETAIL_ORDER_PAID: 'retail_order_paid',
  RETAIL_ORDER_ABANDONED: 'retail_order_abandoned',
} as const;

/**
 * Donation events (9).
 */
export const ANALYTICS_DONATION_EVENTS = {
  DONATION_STARTED: 'donation_started',
  DONATION_AMOUNT_SELECTED: 'donation_amount_selected',
  DONATION_CUSTOM_AMOUNT_ENTERED: 'donation_custom_amount_entered',
  DONATION_PROJECT_SELECTED: 'donation_project_selected',
  DONATION_IMPACT_OPENED: 'donation_impact_opened',
  DONATION_TAX_RECEIPT_SELECTED: 'donation_tax_receipt_selected',
  RECURRING_DONATION_SELECTED: 'recurring_donation_selected',
  DONATION_COMPLETED: 'donation_completed',
  DONATION_ABANDONED: 'donation_abandoned',
} as const;

/**
 * Kiosk events (2).
 */
export const ANALYTICS_KIOSK_EVENTS = {
  KIOSK_WAKEUP: 'kiosk_wakeup',
  KIOSK_TIMEOUT: 'kiosk_timeout',
} as const;

/**
 * Server-side operational events (workers, reconciliation) — no client emitter.
 */
export const ANALYTICS_SERVER_OPS_EVENTS = {
  RECURRING_PAYMENT_MISSED: 'recurring_payment_missed',
} as const;

export const ANALYTICS_EVENT_NAMES = [
  ...Object.values(ANALYTICS_UNIVERSAL_EVENTS),
  ...Object.values(ANALYTICS_RETAIL_EVENTS),
  ...Object.values(ANALYTICS_DONATION_EVENTS),
  ...Object.values(ANALYTICS_KIOSK_EVENTS),
  ...Object.values(ANALYTICS_SERVER_OPS_EVENTS),
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

/**
 * Type-safe membership check.
 */
export function isAnalyticsEventName(name: string): name is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(name);
}

/**
 * Telemetry classes — all v1 events default to OPERATIONAL (§1.9).
 * MARKETING is rejected on ingest for v1.
 */
export const ANALYTICS_TELEMETRY_CLASSES = {
  OPERATIONAL: 'OPERATIONAL',
  MARKETING: 'MARKETING',
} as const;

export type AnalyticsTelemetryClass =
  (typeof ANALYTICS_TELEMETRY_CLASSES)[keyof typeof ANALYTICS_TELEMETRY_CLASSES];

/**
 * Platform enum mirror (matches backend Prisma `AnalyticsPlatform`).
 */
export const ANALYTICS_PLATFORMS = {
  KIOSK: 'KIOSK',
  MOBILE: 'MOBILE',
} as const;

export type AnalyticsPlatform =
  (typeof ANALYTICS_PLATFORMS)[keyof typeof ANALYTICS_PLATFORMS];

/**
 * Flow enum mirror (matches backend Prisma `AnalyticsFlow`).
 */
export const ANALYTICS_FLOWS = {
  RETAIL: 'RETAIL',
  DONATION: 'DONATION',
} as const;

export type AnalyticsFlow =
  (typeof ANALYTICS_FLOWS)[keyof typeof ANALYTICS_FLOWS];

/**
 * Device type enum mirror (matches backend Prisma `AnalyticsDeviceType`).
 * MOBILE_WEB rows always have label `'default'` (§3.1).
 */
export const ANALYTICS_DEVICE_TYPES = {
  KIOSK: 'KIOSK',
  MOBILE_WEB: 'MOBILE_WEB',
  STATIC_QR: 'STATIC_QR',
} as const;

export type AnalyticsDeviceType =
  (typeof ANALYTICS_DEVICE_TYPES)[keyof typeof ANALYTICS_DEVICE_TYPES];

export const ANALYTICS_MOBILE_WEB_DEFAULT_LABEL = 'default' as const;

/**
 * Snapshot kind for rollups (`analytics_daily_snapshots`).
 */
export const ANALYTICS_SNAPSHOT_KINDS = {
  TENANT: 'tenant',
  PLATFORM: 'platform',
} as const;

export type AnalyticsSnapshotKind =
  (typeof ANALYTICS_SNAPSHOT_KINDS)[keyof typeof ANALYTICS_SNAPSHOT_KINDS];

/**
 * System flag keys (Prisma `system_flags`). `analytics_rollup_initialized`
 * gates retention deletes until first nightly rollup succeeds (§3.4, §6.7).
 */
export const ANALYTICS_SYSTEM_FLAGS = {
  ROLLUP_INITIALIZED: 'analytics_rollup_initialized',
} as const;
