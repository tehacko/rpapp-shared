/**
 * MOBILE tier-2 consent allowlist — mirror of
 * `up-backend/src/domain/analytics/analyticsEventCatalog.ts`
 * (`ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT`).
 */
export const ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT = [
  'session_started',
  'session_completed',
  'session_abandoned',
  'error_shown',
  'auth_flow_started',
  'identity_completed',
  'login_success',
  'account_created',
  'payment_started',
  'payment_qr_generated',
  'payment_submitted',
  'payment_confirmed',
  'payment_failed',
  'receipt_opened',
  'recurring_payment_received',
  'retail_order_paid',
  'retail_order_prepared',
  'retail_order_ready',
  'retail_order_collected',
  'retail_ticket_created',
  'retail_pickup_scheduled',
  'retail_pickup_slot_missed',
  'pickup_qr_issued',
  'pickup_qr_scanned',
  'pickup_staff_mark_paid',
  'checkout_mode_selected',
  'self_service_sla_notice_shown',
  'customer_pickup_ack_informational',
  'slug_legacy_redirect',
  'donation_completed',
  'catalog_image_load_failed',
  'qr_displayed',
  'menu_opened',
  'product_selected',
] as const satisfies readonly string[];

const ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT_SET: ReadonlySet<string> = new Set(
  ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT,
);

export function isAnalyticsEventAllowedWithoutConsent(eventName: string): boolean {
  return ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT_SET.has(eventName);
}
