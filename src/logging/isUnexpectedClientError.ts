/**
 * Classify whether a client error should be reported to Sentry (unexpected)
 * vs domain/expected HTTP failures (logger only / breadcrumbs).
 */

function readStatus(error: object): number | undefined {
  const record = error as Record<string, unknown>;
  const candidates = [record['statusCode'], record['status'], record['httpStatus']];
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function readErrorCode(error: object): string | undefined {
  const record = error as Record<string, unknown>;
  const candidates = [record['errorCode'], record['code']];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function isValidationError(error: object, status: number | undefined, code: string | undefined): boolean {
  const name = typeof (error as { name?: unknown }).name === 'string'
    ? (error as { name: string }).name
    : '';
  if (name === 'ValidationError') {
    return true;
  }
  if (code === 'VALIDATION_ERROR' || code === 'VALIDATION') {
    return true;
  }
  if (status === 400 && (code?.includes('VALID') ?? false)) {
    return true;
  }
  return false;
}

function isNetworkFailure(error: unknown, status: number | undefined): boolean {
  if (status !== undefined) {
    return false;
  }
  if (error instanceof TypeError) {
    return true;
  }
  if (typeof error === 'object' && error !== null) {
    const name = (error as { name?: unknown }).name;
    const code = readErrorCode(error);
    if (name === 'NetworkError' || code === 'NETWORK_ERROR') {
      return true;
    }
  }
  return false;
}

/**
 * Returns true when the error should be captured by Sentry (5xx, network, unknown).
 * Returns false for domain 4xx with errorCode, validation errors, and 409 conflicts.
 */
export function isUnexpectedClientError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return true;
  }

  if (typeof error !== 'object') {
    return true;
  }

  const status = readStatus(error);
  const code = readErrorCode(error);

  if (isNetworkFailure(error, status)) {
    return true;
  }

  if (status !== undefined && status >= 500) {
    return true;
  }

  if (status === 409) {
    return false;
  }

  if (isValidationError(error, status, code)) {
    return false;
  }

  if (status !== undefined && status >= 400 && status < 500 && code !== undefined) {
    return false;
  }

  // Domain-shaped AppError / API envelope without HTTP status but with a known code
  // and no 5xx status — treat as expected when code is present and not network/unknown.
  if (status === undefined && code !== undefined && code !== 'UNKNOWN_ERROR' && code !== 'NETWORK_ERROR') {
    const name = typeof (error as { name?: unknown }).name === 'string'
      ? (error as { name: string }).name
      : '';
    if (name === 'AppError' || name === 'AuthenticationError' || name === 'NotFoundError'
      || name === 'PaymentError' || name === 'InventoryError' || name === 'KioskError'
      || name === 'SalesPointError') {
      return false;
    }
  }

  // Plain Error / unknown without domain errorCode → unexpected
  return true;
}
