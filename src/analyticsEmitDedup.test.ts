import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ANALYTICS_EMIT_DEDUP_COOLDOWN_MS,
  recordAnalyticsEmitDedup,
  resetAnalyticsEmitDedupForTests,
  shouldDedupAnalyticsEmit,
} from './analyticsEmitDedup.js';

describe('analyticsEmitDedup', () => {
  beforeEach(() => {
    resetAnalyticsEmitDedupForTests();
  });

  it('dedups screen_viewed within 500ms for the same screen', () => {
    const input = { eventName: 'screen_viewed', screenName: 'shop', nowMs: 1_000 };
    expect(shouldDedupAnalyticsEmit(input)).toBe(false);
    recordAnalyticsEmitDedup(input);
    expect(
      shouldDedupAnalyticsEmit({
        ...input,
        nowMs: 1_000 + ANALYTICS_EMIT_DEDUP_COOLDOWN_MS - 1,
      }),
    ).toBe(true);
    expect(
      shouldDedupAnalyticsEmit({
        ...input,
        nowMs: 1_000 + ANALYTICS_EMIT_DEDUP_COOLDOWN_MS,
      }),
    ).toBe(false);
  });

  it('does not dedup different screens', () => {
    recordAnalyticsEmitDedup({ eventName: 'screen_viewed', screenName: 'shop', nowMs: 1_000 });
    expect(
      shouldDedupAnalyticsEmit({
        eventName: 'screen_viewed',
        screenName: 'cart',
        nowMs: 1_100,
      }),
    ).toBe(false);
  });
});
