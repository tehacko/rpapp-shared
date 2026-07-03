import { isAnalyticsEventName, type AnalyticsEventName } from './analyticsEvents.js';
import { ANALYTICS_EVENT_LABELS } from './analyticsEventLabels.js';
import { snakeCaseToLabel, type LabelAudience, type LabelLocale } from './labels/localizedLabel.js';

export function getAnalyticsEventLabel(
  name: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAnalyticsEventName(name)) {
    return snakeCaseToLabel(name)[locale];
  }
  return ANALYTICS_EVENT_LABELS[name as AnalyticsEventName][locale];
}
