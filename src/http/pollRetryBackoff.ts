import { getRetryAfterMs } from './rateLimitError.js';

export interface PollRetryBackoffOptions {
  /** Base delay before exponential growth (ms). */
  baseMs?: number;
  /** Maximum delay cap (ms). */
  maxMs?: number;
  /** Multiplier per attempt (1-based attempt index). */
  multiplier?: number;
  /** Random jitter fraction (0–1) applied to the computed delay. */
  jitterRatio?: number;
}

const DEFAULT_BASE_MS = 1_000;
const DEFAULT_MAX_MS = 120_000;
const DEFAULT_MULTIPLIER = 2;
const DEFAULT_JITTER_RATIO = 0.2;

function isServerOverloadStatus(status: number): boolean {
  return status === 503 || status >= 500;
}

/**
 * True when a poll/fetch error should use server-overload backoff (G-45 / G-23-fe).
 */
export function isServerOverloadPollError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return isServerOverloadStatus(error.statusCode);
  }

  if ('status' in error && typeof error.status === 'number') {
    return isServerOverloadStatus(error.status);
  }

  return false;
}

/**
 * Exponential backoff with jitter for catalog poll / SWR retries on 5xx and 503.
 * Honors Retry-After when present on the error envelope.
 */
export function computePollRetryDelayMs(
  attemptIndex: number,
  error: unknown,
  options: PollRetryBackoffOptions = {},
): number {
  const baseMs = options.baseMs ?? DEFAULT_BASE_MS;
  const maxMs = options.maxMs ?? DEFAULT_MAX_MS;
  const multiplier = options.multiplier ?? DEFAULT_MULTIPLIER;
  const jitterRatio = options.jitterRatio ?? DEFAULT_JITTER_RATIO;

  const retryAfterMs = getRetryAfterMs(error, baseMs);
  const exponentialMs = Math.min(
    maxMs,
    Math.max(baseMs, retryAfterMs) * Math.pow(multiplier, Math.max(0, attemptIndex)),
  );
  const jitterSpan = exponentialMs * jitterRatio;
  const jitter = jitterSpan > 0 ? Math.floor(Math.random() * jitterSpan) : 0;
  return Math.min(maxMs, exponentialMs + jitter);
}
