/**
 * Database Health Check Hook
 * 
 * Polls backend health endpoint to determine database availability
 * Features:
 * - Exponential backoff on failures
 * - Configurable poll intervals (defaults to 60s = 1 request/min)
 * - Automatic retry with configurable max retries
 * - Runtime config support for API URL detection
 */

import { useState, useEffect, useCallback, useRef } from 'react';

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

  // Read runtime config synchronously on first render (already loaded by main.tsx bootstrap)
  // This avoids a race condition where the first health check fires with localhost before
  // a useEffect can update the endpoint from __RUNTIME_CONFIG__
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
  const backoffMultiplierRef = useRef<number>(2);
  const currentDelayRef = useRef<number>(retryDelay);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkHealth = useCallback(async (): Promise<void> => {
    if (!enabled) return;

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
        backoffMultiplierRef.current = 2;
      } else {
        throw new Error('Database reported unhealthy status');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Health check failed');
      setError(error);
      setIsDatabaseAvailable(false);

      const newRetryCount = retryCountRef.current + 1;
      retryCountRef.current = newRetryCount;
      setRetryCount(newRetryCount);

      if (newRetryCount < maxRetries) {
        const nextDelay = Math.min(currentDelayRef.current * backoffMultiplierRef.current, retryDelay * 30);
        currentDelayRef.current = nextDelay;
        setNextRetryDelay(nextDelay);

        retryTimeoutRef.current = setTimeout(() => {
          void checkHealth();
        }, nextDelay);
      } else {
        setNextRetryDelay(pollInterval);
        retryTimeoutRef.current = setTimeout(() => {
          void checkHealth();
        }, pollInterval);
      }
    } finally {
      setIsChecking(false);
    }
  }, [enabled, healthEndpoint, maxRetries, retryDelay, pollInterval]);

  useEffect(() => {
    if (!enabled) return;

    // Initial check
    void checkHealth();

    // Polling
    const startPolling = (): void => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = setTimeout(() => {
        void checkHealth();
        startPolling();
      }, pollInterval);
    };

    startPolling();

    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [enabled, checkHealth, pollInterval]);

  return {
    isDatabaseAvailable,
    isChecking,
    retryCount,
    nextRetryDelay,
    error,
    checkHealth,
  };
}
