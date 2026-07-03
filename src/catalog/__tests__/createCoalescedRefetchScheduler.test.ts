import { jest } from '@jest/globals';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { createCoalescedRefetchScheduler } from '../createCoalescedRefetchScheduler.js';

function createMockQueryClient(): QueryClient {
  return {
    cancelQueries: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    invalidateQueries: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    refetchQueries: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  } as unknown as QueryClient;
}

describe('createCoalescedRefetchScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces burst schedule calls into one refetch', async () => {
    const queryClient = createMockQueryClient();
    const cacheKey: QueryKey = ['products', { kioskId: 1 }];
    const coalesced = createCoalescedRefetchScheduler(
      () => queryClient,
      () => cacheKey,
      400,
    );

    coalesced.schedule();
    coalesced.schedule();
    coalesced.schedule();

    expect(queryClient.refetchQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(queryClient.cancelQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.refetchQueries).toHaveBeenCalledTimes(1);
  });

  it('cancel clears pending debounced refetch', () => {
    const queryClient = createMockQueryClient();
    const cacheKey: QueryKey = ['products', { kioskId: 1 }];
    const coalesced = createCoalescedRefetchScheduler(
      () => queryClient,
      () => cacheKey,
      400,
    );

    coalesced.schedule();
    coalesced.cancel();
    jest.advanceTimersByTime(400);

    expect(queryClient.refetchQueries).not.toHaveBeenCalled();
  });
});
