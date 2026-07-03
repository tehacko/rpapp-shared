import * as Sentry from '@sentry/react';

import type { SentryAppName } from './initSentry.js';

export interface RateLimitBreadcrumbContext {
  readonly app: SentryAppName;
  readonly path?: string;
  readonly method?: string;
  readonly retryAfterMs?: number;
}

/**
 * Records a Sentry breadcrumb when a client observes HTTP 429 / rate limiting.
 */
export function captureRateLimitBreadcrumb(context: RateLimitBreadcrumbContext): void {
  try {
    Sentry.addBreadcrumb({
      category: 'rate_limit',
      message: context.path !== undefined ? `HTTP 429 ${context.method ?? 'GET'} ${context.path}` : 'HTTP 429',
      level: 'warning',
      data: {
        app: context.app,
        path: context.path,
        method: context.method,
        retryAfterMs: context.retryAfterMs,
      },
    });
  } catch {
    // Sentry optional in dev / when DSN unset
  }
}
