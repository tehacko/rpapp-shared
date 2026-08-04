import * as Sentry from '@sentry/react';
import { captureConflictBreadcrumb } from '../captureConflictBreadcrumb.js';
import { captureRateLimitBreadcrumb } from '../captureRateLimitBreadcrumb.js';

jest.mock('@sentry/react', () => ({
  addBreadcrumb: jest.fn(),
}));

describe('sentry breadcrumb helpers', () => {
  it('captures conflict and rate-limit breadcrumbs without throwing', () => {
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
