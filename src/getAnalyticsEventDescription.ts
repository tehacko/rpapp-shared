import { isAnalyticsEventName, type AnalyticsEventName } from './analyticsEvents.js';
import { ANALYTICS_EVENT_DESCRIPTIONS } from './analyticsEventDescriptions.js';
import type { LabelAudience, LabelLocale } from './labels/localizedLabel.js';

export function getAnalyticsEventDescription(
  name: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAnalyticsEventName(name)) {
    return '';
  }
  return ANALYTICS_EVENT_DESCRIPTIONS[name as AnalyticsEventName][locale];
}
