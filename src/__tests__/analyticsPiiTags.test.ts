import {
  ANALYTICS_PII_FIELD_TAGS,
  getAnalyticsPiiTagsForEvent,
} from '../analyticsPiiTags.js';
import { ANALYTICS_EVENT_NAMES } from '../analyticsEvents.js';

describe('analyticsPiiTags', () => {
  it('covers every catalog event name', () => {
    for (const eventName of ANALYTICS_EVENT_NAMES) {
      expect(getAnalyticsPiiTagsForEvent(eventName)).toBeDefined();
    }
    expect(Object.keys(ANALYTICS_PII_FIELD_TAGS).length).toBe(ANALYTICS_EVENT_NAMES.length);
  });

  it('uses only supported PII classes', () => {
    const allowed = new Set(['none', 'pseudonymous', 'direct', 'financial']);
    for (const fields of Object.values(ANALYTICS_PII_FIELD_TAGS)) {
      for (const tag of Object.values(fields)) {
        expect(allowed.has(tag)).toBe(true);
      }
    }
  });
});
