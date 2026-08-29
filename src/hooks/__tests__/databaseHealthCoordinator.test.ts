/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import {
  resetDatabaseHealthCoordinatorForTests,
  subscribeDatabaseHealth,
} from '../databaseHealthCoordinator.js';

function mockFetchResponse(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
    json: async () => JSON.parse(body) as unknown,
  } as Response;
}

async function flushPromises(rounds = 8): Promise<void> {
  for (let i = 0; i < rounds; i += 1) {
    await Promise.resolve();
  }
}

describe('databaseHealthCoordinator — 429 rate limit', () => {
  const endpoint = 'http://localhost:3015/health';

  beforeEach(() => {
    resetDatabaseHealthCoordinatorForTests();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    resetDatabaseHealthCoordinatorForTests();
  });

  it('keeps last isDatabaseAvailable state on 429 (does not force outage gate)', async () => {
    const fetchMock = jest.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;

    fetchMock.mockImplementation(async () => {
      if (fetchMock.mock.calls.length === 1) {
        return mockFetchResponse(200, JSON.stringify({ success: true }), {
          'content-type': 'application/json',
        });
      }
      return mockFetchResponse(429, 'rate limited', { 'retry-after': '120' });
    });

    let snapshot = {
      isDatabaseAvailable: true,
      isChecking: false,
      hasResolvedInitialCheck: false,
      retryCount: 0,
      nextRetryDelay: 0,
      error: null as Error | null,
    };

    const unsubscribe = subscribeDatabaseHealth({ endpoint, enabled: true }, (next) => {
      snapshot = next;
    });

    await flushPromises();
    await jest.runOnlyPendingTimersAsync();
    await flushPromises();

    expect(snapshot.isDatabaseAvailable).toBe(true);
    expect(snapshot.hasResolvedInitialCheck).toBe(true);

    await jest.advanceTimersByTimeAsync(120_000);
    await flushPromises();

    expect(snapshot.isDatabaseAvailable).toBe(true);
    expect(snapshot.error?.message).toContain('rate-limited');

    unsubscribe();
  });
});
