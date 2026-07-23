import { describe, expect, it } from '@jest/globals';

import { readRequestId } from '../../logging/readRequestId.js';

function mockResponse(headers: Record<string, string>): Response {
  return {
    headers: {
      get(name: string): string | null {
        const lower = name.toLowerCase();
        for (const [key, value] of Object.entries(headers)) {
          if (key.toLowerCase() === lower) {
            return value;
          }
        }
        return null;
      },
    },
  } as Response;
}

describe('readRequestId', () => {
  it('parses X-Request-ID header', () => {
    const id = '11111111-2222-4333-8444-555555555555';
    expect(readRequestId(mockResponse({ 'X-Request-ID': id }))).toBe(id);
  });

  it('accepts lowercase header name', () => {
    expect(readRequestId(mockResponse({ 'x-request-id': 'abc' }))).toBe('abc');
  });

  it('returns undefined when missing', () => {
    expect(readRequestId(mockResponse({}))).toBeUndefined();
  });

  it('rejects empty / whitespace-only values', () => {
    expect(readRequestId(mockResponse({ 'X-Request-ID': '   ' }))).toBeUndefined();
  });

  it('rejects values longer than 128 characters', () => {
    const tooLong = 'a'.repeat(129);
    expect(readRequestId(mockResponse({ 'X-Request-ID': tooLong }))).toBeUndefined();
  });

  it('accepts values of length 128', () => {
    const ok = 'b'.repeat(128);
    expect(readRequestId(mockResponse({ 'X-Request-ID': ok }))).toBe(ok);
  });
});
