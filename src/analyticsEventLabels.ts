import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';
import { snakeCaseToLabel, type LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing analytics event labels (cs + en). */
const ANALYTICS_LABEL_OVERRIDES: Partial<Record<AnalyticsEventName, LocalizedLabel>> = {
  session_started: { en: 'Session started', cs: 'Relace zahájena' },
  session_completed: { en: 'Session completed', cs: 'Relace dokončena' },
  session_abandoned: { en: 'Session abandoned', cs: 'Relace opuštěna' },
  screen_viewed: { en: 'Screen viewed', cs: 'Obrazovka zobrazena' },
  payment_confirmed: { en: 'Payment confirmed', cs: 'Platba potvrzena' },
  payment_failed: { en: 'Payment failed', cs: 'Platba selhala' },
  kiosk_wakeup: { en: 'Kiosk wakeup', cs: 'Kiosk probuzen' },
  kiosk_timeout: { en: 'Kiosk timeout', cs: 'Kiosk timeout' },
};

function buildAnalyticsLabels(): Record<AnalyticsEventName, LocalizedLabel> {
  const labels = {} as Record<AnalyticsEventName, LocalizedLabel>;
  for (const name of ANALYTICS_EVENT_NAMES) {
    labels[name] = ANALYTICS_LABEL_OVERRIDES[name] ?? snakeCaseToLabel(name);
  }
  return labels;
}

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventName, LocalizedLabel> =
  buildAnalyticsLabels();
