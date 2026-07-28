/**
 * Parse `X-Request-ID` from a Fetch Response (length capped at 128).
 */

const MAX_REQUEST_ID_LENGTH = 128;

/**
 * Returns the response `X-Request-ID` header when present and within length limits.
 */
export function readRequestId(response: Response): string | undefined {
  const headers = (response as { headers?: { get?: (name: string) => string | null } } | null)?.headers;
  if (!headers || typeof headers.get !== 'function') {
    return undefined;
  }
  const raw = headers.get('X-Request-ID') ?? headers.get('x-request-id');
  if (raw === null || raw === undefined) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_REQUEST_ID_LENGTH) {
    return undefined;
  }
  return trimmed;
}
