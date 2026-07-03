/**
 * Detect HTTP 429 rate-limit errors across admin, customer, kiosk, and pickup ApiError shapes.
 */
export function isRateLimitError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode === 429) {
    return true;
  }

  if ('status' in error && typeof error.status === 'number' && error.status === 429) {
    return true;
  }

  return false;
}

function parseRetryAfterHeaderValue(value: string): number | null {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(seconds * 1000, 0);
  }

  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) {
    return Math.max(dateMs - Date.now(), 0);
  }

  return null;
}

function readHeader(headers: unknown, name: string): string | null {
  if (headers === null || headers === undefined) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (typeof headers === 'object') {
    const record = headers as Record<string, string | string[] | undefined>;
    const direct = record[name] ?? record[name.toLowerCase()];
    if (typeof direct === 'string') {
      return direct;
    }
    if (Array.isArray(direct) && direct.length > 0) {
      return direct[0] ?? null;
    }
  }

  return null;
}

function retryAfterFromResponse(response: unknown): number | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  if ('headers' in response) {
    const retryAfter = readHeader(response.headers, 'retry-after');
    if (retryAfter !== null) {
      const parsed = parseRetryAfterHeaderValue(retryAfter);
      if (parsed !== null) {
        return parsed;
      }
    }

    const reset = readHeader(response.headers, 'ratelimit-reset');
    if (reset !== null) {
      const resetSeconds = Number(reset);
      if (Number.isFinite(resetSeconds) && resetSeconds >= 0) {
        return Math.max(resetSeconds * 1000, 0);
      }
    }
  }

  if ('retryAfterMs' in response && typeof response.retryAfterMs === 'number') {
    return Math.max(response.retryAfterMs, 0);
  }

  if ('retryAfter' in response && typeof response.retryAfter === 'number') {
    return Math.max(response.retryAfter * 1000, 0);
  }

  return null;
}

/**
 * Extract retry delay in milliseconds from a rate-limit error or response envelope.
 */
export function getRetryAfterMs(error: unknown, fallbackMs = 60_000): number {
  if (typeof error === 'object' && error !== null) {
    if ('retryAfterMs' in error && typeof error.retryAfterMs === 'number') {
      return Math.max(error.retryAfterMs, 0);
    }

    if ('response' in error) {
      const fromResponse = retryAfterFromResponse(error.response);
      if (fromResponse !== null) {
        return fromResponse;
      }
    }

    if ('data' in error) {
      const fromData = retryAfterFromResponse(error.data);
      if (fromData !== null) {
        return fromData;
      }
    }
  }

  return fallbackMs;
}
