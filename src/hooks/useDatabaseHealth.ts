/**
 * Database Health Check Hook
 *
 * Polls backend health endpoint to determine database availability.
 * Features:
 * - At most one request in flight at a time (prevents duplicate/burst requests)
 * - Minimum 15s between automatic checks when unhealthy (prevents rapid retry storm)
 * - Poll interval when healthy: 60s default (1 request/min)
 * - User-triggered retry is not throttled (only automatic checks use the 15s minimum interval)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const MIN_AUTO_INTERVAL_MS = 15000; // Minimum 15s between automatic checks to avoid hammering /health

interface HealthResponse {
  success: boolean;
  status?: 'healthy' | 'unhealthy';
}

interface UseDatabaseHealthOptions {
  pollInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  enabled?: boolean;
}

interface UseDatabaseHealthReturn {
  isDatabaseAvailable: boolean;
  isChecking: boolean;
  retryCount: number;
  nextRetryDelay: number;
  error: Error | null;
  checkHealth: () => Promise<void>;
}

export function useDatabaseHealth(
  options: UseDatabaseHealthOptions = {}
): UseDatabaseHealthReturn {
  const {
    pollInterval = 60000,
    maxRetries = 5,
    retryDelay = 1000,
    enabled = true,
  } = options;

  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [nextRetryDelay, setNextRetryDelay] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  const [healthEndpoint] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const windowConfig = (window as any).__RUNTIME_CONFIG__;
      const apiUrl = windowConfig?.apiUrl;
      if (apiUrl) {
        return `${apiUrl}/health`;
      }
    }
    return 'http://localhost:3015/health';
  });

  const retryCountRef = useRef<number>(0);
  const currentDelayRef = useRef<number>(retryDelay);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkHealthRef = useRef<(() => Promise<void>) | null>(null);
  const isCheckingRef = useRef<boolean>(false);
  const lastCheckTimeRef = useRef<number>(0);

  const checkHealth = useCallback(async (): Promise<void> => {
      if (!enabled) {
        return;
      }

      // Prevent overlapping requests (e.g. Strict Mode double-mount or poll + retry at once)
      if (isCheckingRef.current) {
        return;
      }
      isCheckingRef.current = true;
      setIsChecking(true);
      setError(null);

      try {
        const response = await fetch(healthEndpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`Invalid response: expected JSON, got ${contentType}`);
        }

        const data = (await response.json()) as HealthResponse;

        if (data.success === true) {
          setIsDatabaseAvailable(true);
          setRetryCount(0);
          setNextRetryDelay(0);
          retryCountRef.current = 0;
          currentDelayRef.current = retryDelay;
        } else {
          throw new Error('Database reported unhealthy status');
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Health check failed');
        setError(e);
        setIsDatabaseAvailable(false);

        const newRetryCount = retryCountRef.current + 1;
        retryCountRef.current = newRetryCount;
        setRetryCount(newRetryCount);

        const nextDelay = Math.min(
          currentDelayRef.current * 2,
          retryDelay * 30
        );
        currentDelayRef.current = nextDelay;
        const delayMs = Math.max(nextDelay, MIN_AUTO_INTERVAL_MS);
        setNextRetryDelay(delayMs);

        if (newRetryCount < maxRetries) {
          retryTimeoutRef.current = setTimeout(() => {
            void checkHealthRef.current?.();
          }, delayMs);
        } else {
          retryTimeoutRef.current = setTimeout(() => {
            void checkHealthRef.current?.();
          }, Math.max(pollInterval, MIN_AUTO_INTERVAL_MS));
        }
      } finally {
        lastCheckTimeRef.current = Date.now();
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [enabled, healthEndpoint, maxRetries, retryDelay, pollInterval]
  );

  checkHealthRef.current = checkHealth;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const doCheck = (): void => {
      const now = Date.now();
      if (now - lastCheckTimeRef.current < MIN_AUTO_INTERVAL_MS) {
        return;
      }
      if (checkHealthRef.current) {
        void checkHealthRef.current();
      }
    };

    const startPolling = (): void => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      pollTimeoutRef.current = setTimeout(() => {
        doCheck();
        startPolling();
      }, pollInterval);
    };

    doCheck();
    startPolling();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [enabled, healthEndpoint, pollInterval]);

  const checkHealthPublic = useCallback((): Promise<void> => {
    return checkHealthRef.current?.() ?? Promise.resolve();
  }, []);

  return {
    isDatabaseAvailable,
    isChecking,
    retryCount,
    nextRetryDelay,
    error,
    checkHealth: checkHealthPublic,
  };
}
