/**
 * Canonical Tier-2 consent allowlist shared across frontend and backend.
 */
export const ANALYTICS_TIER2_NO_CONSENT_EVENTS = [
  'session_started',
  'session_completed',
  'session_abandoned',
  'session_recovered',
  'error_shown',
  'consent_banner_dismissed',
  'auth_flow_started',
  'identity_created',
  'account_logged_in',
  'account_created',
  'payment_started',
  'payment_qr_generated',
  'qr_regenerated',
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
  // Admin/customer PWA lifecycle — operational, no guest consent latch
  'pwa_install_accepted',
  'pwa_install_dismissed',
  'pwa_update_shown',
  'pwa_update_deferred',
  'pwa_update_applied',
] as const satisfies readonly string[];

const ANALYTICS_TIER2_NO_CONSENT_EVENT_SET: ReadonlySet<string> = new Set(
  ANALYTICS_TIER2_NO_CONSENT_EVENTS,
);

export function isAnalyticsEventAllowedWithoutConsent(eventName: string): boolean {
  return ANALYTICS_TIER2_NO_CONSENT_EVENT_SET.has(eventName);
}
