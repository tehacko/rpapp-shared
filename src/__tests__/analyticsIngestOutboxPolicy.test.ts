import { describe, expect, it } from '@jest/globals';
import {
  isAnalyticsSessionAuthError,
  isAnalyticsSessionClosedError,
  shouldDiscardAnalyticsOutboxError,
  shouldEnqueueAnalyticsOutboxError,
} from '../analyticsIngestOutboxPolicy.js';

describe('analyticsIngestOutboxPolicy', () => {
  it('detects closed session from ApiError-shaped and kiosk HTTP errors', () => {
    expect(
      isAnalyticsSessionClosedError(
        Object.assign(new Error('Session abc is closed'), { status: 422 }),
      ),
    ).toBe(true);
    expect(
      isAnalyticsSessionClosedError(new Error('HTTP 422: Session abc is closed')),
    ).toBe(true);
  });

  it('detects invalid analytics session auth', () => {
    expect(
      isAnalyticsSessionAuthError(
        Object.assign(new Error('Invalid analytics session auth token'), { status: 401 }),
      ),
    ).toBe(true);
  });

  it('discards validation/auth errors and allows network/5xx enqueue', () => {
    expect(shouldDiscardAnalyticsOutboxError(new Error('HTTP 422: Session x is closed'))).toBe(
      true,
    );
    expect(
      shouldDiscardAnalyticsOutboxError(
        Object.assign(new Error('Invalid analytics session auth token'), { status: 401 }),
      ),
    ).toBe(true);
    expect(shouldDiscardAnalyticsOutboxError(new Error('fetch failed'))).toBe(false);
    expect(shouldEnqueueAnalyticsOutboxError(new Error('fetch failed'))).toBe(true);
    expect(
      shouldEnqueueAnalyticsOutboxError(new Error('HTTP 422: Session x is closed')),
    ).toBe(false);
    expect(shouldEnqueueAnalyticsOutboxError(new Error('HTTP 503: unavailable'))).toBe(true);
  });
});
