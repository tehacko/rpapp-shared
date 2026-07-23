/**
 * @jest-environment jsdom
 */

jest.mock('../sentry/initSentry.js', () => ({
  setSentryCorrelationId: jest.fn(),
}));

import { API_ENDPOINTS, APIClient, createAPIClient } from '../api.js';

describe('APIClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('rejects invalid baseUrl and exports endpoint constants', () => {
    expect(() => new APIClient('')).toThrow(/baseUrl/);
    expect(API_ENDPOINTS.HEALTH).toBe('/health');
    expect(typeof createAPIClient().get).toBe('function');
  });

  it('injects tenant into /api paths and sends device headers', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new APIClient('https://api.example/', 'secret', 'acme', 7);
    await client.get('/api/products?x=1');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/api/acme/products?x=1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-Sales-Point-Secret': 'secret',
          'X-Sales-Point-Id': '7',
        }),
      }),
    );

    await client.post('/api/products', { a: 1 });
    await client.put('/health', { b: 2 });
    await client.delete('/events/1');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('throws structured HTTP errors with retryAfter and requestId', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many',
      headers: {
        get: (name: string) => {
          if (name === 'Retry-After') return '9';
          if (name.toLowerCase() === 'x-request-id') return 'rid-1';
          return null;
        },
      },
      json: async () => ({ error: 'slow down', code: 'RATE_LIMIT', requestId: 'rid-1' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new APIClient('https://api.example');
    await expect(client.get('/api/products')).rejects.toMatchObject({
      statusCode: 429,
      code: 'RATE_LIMIT',
      retryAfterSeconds: 9,
      requestId: 'rid-1',
    });
  });

  it('handles non-json error bodies and invalid endpoints', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Boom',
      headers: { get: () => null },
      json: async () => {
        throw new Error('not json');
      },
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const client = new APIClient('https://api.example', undefined, 't');
    await expect(client.get('/api/x')).rejects.toThrow(/HTTP 500/);
    await expect(client.get('' as unknown as string)).rejects.toThrow(/endpoint/);
  });

  it('supports conditional GET 200 and 304', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => (name === 'etag' ? '"v1"' : null),
        },
        json: async () => ({ items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 304,
        headers: {
          get: (name: string) => (name === 'etag' ? '"v1"' : null),
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'err',
        headers: { get: () => null },
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new APIClient('https://api.example', 'sec', 'acme', 3);
    await expect(client.getConditional<{ items: unknown[] }>('/api/catalog', '"old"')).resolves.toEqual({
      status: 200,
      data: { items: [] },
      etag: '"v1"',
    });
    await expect(client.getConditional('/api/catalog')).resolves.toEqual({
      status: 304,
      etag: '"v1"',
    });
    await expect(client.getConditional('/api/catalog')).rejects.toThrow(/HTTP 500/);
  });
});
