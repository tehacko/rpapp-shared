/**
 * Client analytics outbox retry policy (G-P0-09 / CLIENT_ANALYTICS_RELIABILITY.md).
 *
 * Do not enqueue or retain outbox rows for validation/auth failures — they
 * will never succeed on replay and cause ingest storms against closed sessions.
 */

export function readAnalyticsIngestHttpStatus(err: unknown): number | null {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  if (err instanceof Error) {
    const match = /^HTTP (\d{3}):/.exec(err.message);
    if (match?.[1] !== undefined) {
      return Number(match[1]);
    }
  }
  return null;
}

function readAnalyticsIngestErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message.toLowerCase();
  }
  return String(err).toLowerCase();
}

/** Session completed/abandoned — start a fresh session instead of replaying. */
export function isAnalyticsSessionClosedError(err: unknown): boolean {
  const message = readAnalyticsIngestErrorMessage(err);
  if (message.includes('is closed')) {
    return true;
  }
  const status = readAnalyticsIngestHttpStatus(err);
  return status === 422 && message.includes('session');
}

/** Stale or invalid X-Analytics-Session-Auth after session rotation. */
export function isAnalyticsSessionAuthError(err: unknown): boolean {
  const message = readAnalyticsIngestErrorMessage(err);
  if (message.includes('invalid analytics session auth')) {
    return true;
  }
  const status = readAnalyticsIngestHttpStatus(err);
  return status === 401 && message.includes('analytics session auth');
}

/**
 * Drop the outbox row — the payload cannot succeed without user/session changes.
 * Covers 400/401/403/413/422 per ADR plus message fallbacks for kiosk HTTP errors.
 */
export function shouldDiscardAnalyticsOutboxError(err: unknown): boolean {
  if (isAnalyticsSessionClosedError(err) || isAnalyticsSessionAuthError(err)) {
    return true;
  }
  const status = readAnalyticsIngestHttpStatus(err);
  if (status !== null) {
    if (status === 400 || status === 401 || status === 403 || status === 413 || status === 422) {
      return true;
    }
    if (status >= 500 || status === 429) {
      return false;
    }
    return status >= 400;
  }
  const message = readAnalyticsIngestErrorMessage(err);
  return message.includes('unknown eventname');
}

/** Only network/5xx/429 failures belong in the outbox. */
export function shouldEnqueueAnalyticsOutboxError(err: unknown): boolean {
  if (shouldDiscardAnalyticsOutboxError(err)) {
    return false;
  }
  const status = readAnalyticsIngestHttpStatus(err);
  if (status === 429 || (status !== null && status >= 500)) {
    return true;
  }
  return status === null;
}
