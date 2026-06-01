/**
 * Shared Sentry browser init for admin, kiosk, and customer PWAs.
 */
import * as Sentry from '@sentry/react';
import type { ErrorInfo } from 'react';

import { redactClientLogMeta, redactStringSecrets } from '../clientLogRedaction.js';

export type SentryAppName = 'admin' | 'kiosk' | 'customer';

export interface InitSentryOptions {
  readonly dsn?: string;
  readonly environment?: string;
  readonly release?: string;
  readonly app: SentryAppName;
  readonly isProd: boolean;
}

let initialized = false;

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  if (event.message) {
    event.message = redactStringSecrets(event.message);
  }
  if (event.extra) {
    event.extra = redactClientLogMeta(event.extra as Record<string, unknown>) as Record<
      string,
      unknown
    >;
  }
  if (event.contexts) {
    event.contexts = redactClientLogMeta(event.contexts as Record<string, unknown>) as NonNullable<
      Sentry.ErrorEvent['contexts']
    >;
  }
  return event;
}

export function initSentry(options: InitSentryOptions): void {
  if (initialized) {
    return;
  }
  const dsn = options.dsn?.trim();
  if (!options.isProd || !dsn) {
    return;
  }
  try {
    Sentry.init({
      dsn,
      environment: options.environment ?? 'development',
      release: options.release,
      sendDefaultPii: false,
      sampleRate: 1.0,
      beforeSend: scrubEvent,
      initialScope: {
        tags: {
          app: options.app,
        },
      },
    });
    initialized = true;
  } catch {
    // UI may run without Sentry — not critical path
  }
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!initialized) {
    return;
  }
  const extra =
    context !== undefined
      ? (redactClientLogMeta(context) as Record<string, unknown>)
      : undefined;
  Sentry.captureException(error, extra !== undefined ? { extra } : undefined);
}

export function captureBoundaryError(error: Error, errorInfo: ErrorInfo): void {
  if (!initialized) {
    return;
  }
  const rawStack = errorInfo.componentStack;
  const componentStack =
    rawStack !== undefined && rawStack !== null
      ? redactStringSecrets(rawStack)
      : undefined;
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack,
      },
    },
  });
}
