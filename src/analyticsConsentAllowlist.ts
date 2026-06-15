/**
 * MOBILE tier-2 consent allowlist — mirror of
 * `up-backend/src/domain/analytics/analyticsEventCatalog.ts`
 * (`ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT`).
 */
import type { AnalyticsEventName } from './analyticsEvents.js';

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
  'retail_order_paid',
  'retail_order_prepared',
  'retail_order_ready',
  'retail_order_collected',
  'retail_ticket_created',
  'retail_pickup_scheduled',
  'retail_pickup_slot_missed',
  'donation_completed',
] as const satisfies readonly AnalyticsEventName[];
