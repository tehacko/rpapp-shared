import type { QueryClient, QueryKey } from '@tanstack/react-query';

const DEFAULT_DEBOUNCE_MS = 400;

export interface CoalescedRefetchScheduler {
  schedule: () => void;
  flush: () => Promise<void>;
  cancel: () => void;
}

/**
 * Debounces catalog refetches and skips overlapping in-flight runs.
 * Burst realtime events collapse to one HTTP fetch.
 */
export function createCoalescedRefetchScheduler(
  getQueryClient: () => QueryClient,
  getCacheKey: () => QueryKey,
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): CoalescedRefetchScheduler {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let rerunAfterCurrent = false;

  const runRefetch = async (): Promise<void> => {
    if (inFlight) {
      rerunAfterCurrent = true;
      return;
    }

    inFlight = true;
    const queryClient = getQueryClient();
    const cacheKey = getCacheKey();

    try {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      await queryClient.invalidateQueries({ queryKey: cacheKey });
      await queryClient.refetchQueries({
        queryKey: cacheKey,
        type: 'active',
      });
    } finally {
      inFlight = false;
      if (rerunAfterCurrent) {
        rerunAfterCurrent = false;
        void runRefetch();
      }
    }
  };

  const schedule = (): void => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runRefetch();
    }, debounceMs);
  };

  const flush = async (): Promise<void> => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    await runRefetch();
  };

  const cancel = (): void => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    rerunAfterCurrent = false;
  };

  return { schedule, flush, cancel };
}
