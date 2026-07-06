import * as Sentry from '@sentry/react';

import type { SentryAppName } from './initSentry.js';

export type PickupConflictBreadcrumbCode =
  | 'FULFILLMENT_VERSION_CONFLICT'
  | 'FULFILLMENT_CLAIMED_BY_OTHER_DEVICE'
  | 'HTTP_409';

export interface ConflictBreadcrumbContext {
  readonly app: SentryAppName;
  readonly code: PickupConflictBreadcrumbCode;
  readonly operation?: string;
  readonly fulfillmentId?: number;
  readonly status?: number;
}

/**
 * Records a Sentry breadcrumb when pickup fulfillment mutations hit version/claim conflicts.
 * GAP-X-01 — aids ops triage without logging secrets or PII.
 */
export function captureConflictBreadcrumb(context: ConflictBreadcrumbContext): void {
  try {
    Sentry.addBreadcrumb({
      category: 'pickup.conflict',
      message: context.operation
        ? `${context.code} during ${context.operation}`
        : context.code,
      level: 'warning',
      data: {
        app: context.app,
        code: context.code,
        operation: context.operation,
        fulfillmentId: context.fulfillmentId,
        status: context.status,
      },
    });
  } catch {
    // Sentry optional in dev / when DSN unset
  }
}
