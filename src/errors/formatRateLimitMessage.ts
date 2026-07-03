/**
 * Localized rate-limit user message with optional retry countdown.
 */
export function formatRateLimitMessage(
  translate: (key: string, options?: Record<string, unknown>) => string,
  retryAfterSeconds: number
): string {
  const seconds = Math.max(retryAfterSeconds, 1);
  return translate('auth.rateLimit.retryAfter', { seconds });
}
