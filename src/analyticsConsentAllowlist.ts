/**
 * Events ingestible on MOBILE without active ANALYTICS `CustomerTenantConsent`
 * when `consentIngestGateEnabled` is true (tier-2 gate — draft for legal review).
 *
 * Must stay byte-identical to the mirror in
 * `up-backend/src/domain/analytics/analyticsEventCatalog.ts`.
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
  'donation_completed',
] as const satisfies readonly AnalyticsEventName[];

export type AnalyticsEventAllowedWithoutConsent =
  (typeof ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT)[number];

const ALLOWED_SET = new Set<string>(ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT);

export function isAnalyticsEventAllowedWithoutConsent(eventName: string): boolean {
  return ALLOWED_SET.has(eventName);
}
