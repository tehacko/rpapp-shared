import {
  ANALYTICS_PII_FIELD_TAGS,
  getAnalyticsPiiTagsForEvent,
} from '../analyticsPiiTags.js';
import { ANALYTICS_V2_EXTENSION_EVENT_NAMES } from '../analyticsCatalogV2.js';
import { ANALYTICS_UNIVERSAL_EVENTS } from '../analyticsEvents.js';

const P0_TAGGED_EVENTS = [
  ...ANALYTICS_V2_EXTENSION_EVENT_NAMES.filter((name) => name !== 'identity_matched'),
  ANALYTICS_UNIVERSAL_EVENTS.AUTH_FLOW_STARTED,
  ANALYTICS_UNIVERSAL_EVENTS.LOGIN_SUCCESS,
  ANALYTICS_UNIVERSAL_EVENTS.ACCOUNT_CREATED,
  ANALYTICS_UNIVERSAL_EVENTS.IDENTITY_COMPLETED,
  ANALYTICS_UNIVERSAL_EVENTS.RECEIPT_OPENED,
  ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_STARTED,
  ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_CONFIRMED,
] as const;

describe('analyticsPiiTags', () => {
  it('tags every active P0 event in the matrix', () => {
    for (const eventName of P0_TAGGED_EVENTS) {
      expect(getAnalyticsPiiTagsForEvent(eventName)).toBeDefined();
    }
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
