/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useSubmitCooldown } from '../hooks/useSubmitCooldown.js';
import { computeUtcDateSpanDaysInclusive } from '../analyticsExploreCaps.js';
import { getAuditMetadataDisplayFields } from '../auditMetadataDisplayFields.js';

jest.mock('@sentry/react', () => ({
  addBreadcrumb: jest.fn(),
}));

import { captureConflictBreadcrumb } from '../sentry/captureConflictBreadcrumb.js';
import { captureRateLimitBreadcrumb } from '../sentry/captureRateLimitBreadcrumb.js';
import * as Sentry from '@sentry/react';

describe('useSubmitCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts, ticks, and clears cooldown', () => {
    const { result } = renderHook(() => useSubmitCooldown());
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(0);
    });
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(2000);
    });
    expect(result.current.isCoolingDown).toBe(true);

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current.remainingSeconds).toBeGreaterThan(0);

    act(() => {
      result.current.clearCooldown();
    });
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(500);
      jest.advanceTimersByTime(600);
    });
    expect(result.current.isCoolingDown).toBe(false);
  });
});

describe('explore caps + audit metadata + sentry breadcrumbs', () => {
  it('computes inclusive UTC date spans', () => {
    expect(computeUtcDateSpanDaysInclusive('2026-01-01', '2026-01-01')).toBe(1);
    expect(computeUtcDateSpanDaysInclusive('2026-01-01', '2026-01-03')).toBe(3);
    expect(computeUtcDateSpanDaysInclusive('bad', '2026-01-01')).toBe(Number.POSITIVE_INFINITY);
    expect(computeUtcDateSpanDaysInclusive('2026-01-03', '2026-01-01')).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it('returns audit metadata fields with empty fallback', () => {
    expect(getAuditMetadataDisplayFields('auth.admin.login.success').length).toBeGreaterThan(0);
    expect(getAuditMetadataDisplayFields('unknown.code')).toEqual([]);
  });

  it('captures sentry breadcrumbs without throwing', () => {
    captureConflictBreadcrumb({
      app: 'pickup',
      code: 'HTTP_409',
      operation: 'claim',
      fulfillmentId: 1,
      status: 409,
    });
    captureConflictBreadcrumb({ app: 'pickup', code: 'FULFILLMENT_VERSION_CONFLICT' });
    captureRateLimitBreadcrumb({ app: 'customer', path: '/x', method: 'POST', retryAfterMs: 1000 });
    captureRateLimitBreadcrumb({ app: 'kiosk' });
    expect(Sentry.addBreadcrumb).toHaveBeenCalled();
  });
});
