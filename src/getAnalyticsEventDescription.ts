import { isAnalyticsEventName, type AnalyticsEventName } from './analyticsEvents.js';
import { ANALYTICS_EVENT_DESCRIPTIONS } from './analyticsEventDescriptions.js';
import {
  resolveLocalizedLabel,
  type LabelAudience,
  type LabelLocale,
} from './labels/localizedLabel.js';

export function getAnalyticsEventDescription(
  name: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAnalyticsEventName(name)) {
    return '';
  }
  return resolveLocalizedLabel(ANALYTICS_EVENT_DESCRIPTIONS[name as AnalyticsEventName], locale);
}
