/**
 * Backward-compatible re-exports. Canonical Tier-2 SSOT lives in
 * `analyticsConsentTier2.ts`.
 */
export {
  ANALYTICS_TIER2_NO_CONSENT_EVENTS as ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT,
  ANALYTICS_TIER2_NO_CONSENT_EVENTS as ANALYTICS_EVENTS_ALLOWED_WITHOUT_CONSENT_CLIENT_COPY,
  isAnalyticsEventAllowedWithoutConsent,
} from './analyticsConsentTier2.js';
