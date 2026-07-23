/**
 * Report unexpected client errors via an injected capture function.
 * MUST NOT static-import `@sentry/*` — apps inject `captureException` (or equivalent).
 */

import { isUnexpectedClientError } from './isUnexpectedClientError.js';

export type CaptureClientErrorFn = (
  error: unknown,
  extra?: Record<string, unknown>
) => void;

export interface ReportClientErrorOptions {
  readonly capture?: CaptureClientErrorFn;
  readonly extra?: Record<string, unknown>;
  /** When false, skip the unexpected classifier and never capture. Default true. */
  readonly onlyUnexpected?: boolean;
}

/**
 * Invokes `capture` for unexpected errors only (unless `onlyUnexpected: false`).
 * No-ops when `capture` is omitted.
 */
export function reportClientError(
  error: unknown,
  options: ReportClientErrorOptions = {}
): void {
  const { capture, extra, onlyUnexpected = true } = options;
  if (capture === undefined) {
    return;
  }
  if (onlyUnexpected && !isUnexpectedClientError(error)) {
    return;
  }
  capture(error, extra);
}
