import { describe, expect, it } from '@jest/globals';

import { AppError, NetworkError, ValidationError } from '../../errors.js';
import { isUnexpectedClientError } from '../../logging/isUnexpectedClientError.js';

describe('isUnexpectedClientError', () => {
  it('treats network failures as unexpected', () => {
    expect(isUnexpectedClientError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isUnexpectedClientError(new NetworkError())).toBe(true);
  });

  it('treats 5xx as unexpected', () => {
    expect(isUnexpectedClientError({ status: 500, errorCode: 'SERVER' })).toBe(true);
    expect(isUnexpectedClientError(new AppError('boom', 'X', 503))).toBe(true);
  });

  it('treats unknown Error without domain code as unexpected', () => {
    expect(isUnexpectedClientError(new Error('oops'))).toBe(true);
    expect(isUnexpectedClientError('string-error')).toBe(true);
  });

  it('treats domain 4xx with errorCode / code as expected', () => {
    expect(isUnexpectedClientError({ status: 404, errorCode: 'NOT_FOUND' })).toBe(false);
    expect(isUnexpectedClientError({ statusCode: 401, code: 'AUTH_ERROR' })).toBe(false);
    expect(isUnexpectedClientError(new AppError('nope', 'AUTH_ERROR', 401))).toBe(false);
  });

  it('treats validation errors as expected', () => {
    expect(isUnexpectedClientError(new ValidationError('bad field'))).toBe(false);
    expect(
      isUnexpectedClientError({ status: 400, code: 'VALIDATION_ERROR', name: 'ValidationError' })
    ).toBe(false);
  });

  it('treats 409 conflicts as expected', () => {
    expect(isUnexpectedClientError({ status: 409, errorCode: 'CONFLICT' })).toBe(false);
    expect(isUnexpectedClientError({ statusCode: 409 })).toBe(false);
  });
});
