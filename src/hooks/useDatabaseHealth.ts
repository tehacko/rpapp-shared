import { useState, useEffect, useCallback, useRef } from 'react';

interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  services?: {
    database?: {
      status: 'healthy' | 'unhealthy' | 'degraded';
      message?: string;
    };
  };
}

interface UseDatabaseHealthOptions {
  healthEndpoint?: string;
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

/**
 * Hook to monitor database health via backend health endpoint
 * Implements exponential backoff retry logic
 */
export function useDatabaseHealth(
  options: UseDatabaseHealthOptions = {}
): UseDatabaseHealthReturn {
  const {
    healthEndpoint = '/health',
    pollInterval = 5000, // Poll every 5 seconds
    maxRetries = 5,
    retryDelay = 1000, // Initial delay: 1 second
    enabled = true,
  } = options;

  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean>(true); // Default to true initially
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [nextRetryDelay, setNextRetryDelay] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRetryCountRef = useRef<number>(0);
  const backoffMultiplierRef = useRef<number>(2);
  const currentDelayRef = useRef<number>(retryDelay);

  const checkHealth = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache-busting to prevent stale responses
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as HealthResponse;

      // Debug: Log the response
      console.log('[DatabaseHealth] Health check response:', { success: data.success, status: data.status, services: data.services });

      // Check if database service is healthy
      // The health endpoint returns success: true when healthy
      const isDbHealthy = data.success === true;

      if (isDbHealthy) {
        // Database is available - reset retry state
        setIsDatabaseAvailable(true);
        setRetryCount(0);
        setNextRetryDelay(0);
        currentRetryCountRef.current = 0;
        currentDelayRef.current = retryDelay;
        backoffMultiplierRef.current = 2;
      } else {
        // Database is unavailable
        setIsDatabaseAvailable(false);
        
        // Increment retry count
        const newRetryCount = currentRetryCountRef.current + 1;
        currentRetryCountRef.current = newRetryCount;
        setRetryCount(newRetryCount);

        if (newRetryCount < maxRetries) {
          // Calculate next delay with exponential backoff
          const nextDelay = Math.min(
            currentDelayRef.current * backoffMultiplierRef.current,
            retryDelay * 30 // Cap at 30x initial delay
          );
          currentDelayRef.current = nextDelay;
          setNextRetryDelay(nextDelay);

          // Schedule next retry
          retryTimeoutRef.current = setTimeout(() => {
            void checkHealth();
          }, nextDelay);
        } else {
          // Max retries reached - continue polling at regular interval
          setNextRetryDelay(pollInterval);
          retryTimeoutRef.current = setTimeout(() => {
            void checkHealth();
          }, pollInterval);
        }
      }
    } catch (err) {
      // Network error or other failure
      const error = err instanceof Error ? err : new Error('Failed to check database health');
      console.error('[DatabaseHealth] Health check error:', error);
      setError(error);
      setIsDatabaseAvailable(false);

      // Increment retry count
      const newRetryCount = currentRetryCountRef.current + 1;
      currentRetryCountRef.current = newRetryCount;
      setRetryCount(newRetryCount);

      if (newRetryCount < maxRetries) {
        // Calculate next delay with exponential backoff
        const nextDelay = Math.min(
          currentDelayRef.current * backoffMultiplierRef.current,
          retryDelay * 30 // Cap at 30x initial delay
        );
        currentDelayRef.current = nextDelay;
        setNextRetryDelay(nextDelay);

        // Schedule next retry
        retryTimeoutRef.current = setTimeout(() => {
          void checkHealth();
        }, nextDelay);
      } else {
        // Max retries reached - continue polling at regular interval
        setNextRetryDelay(pollInterval);
        retryTimeoutRef.current = setTimeout(() => {
          void checkHealth();
        }, pollInterval);
      }
    } finally {
      setIsChecking(false);
    }
  }, [enabled, healthEndpoint, maxRetries, retryDelay, pollInterval]);

  // Initial health check and polling
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    void checkHealth();

    // Set up polling interval (only when database is available)
    const startPolling = (): void => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }

      pollTimeoutRef.current = setTimeout(() => {
        if (isDatabaseAvailable) {
          void checkHealth();
        }
        startPolling();
      }, pollInterval);
    };

    startPolling();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [enabled, checkHealth, isDatabaseAvailable, pollInterval]);

  return {
    isDatabaseAvailable,
    isChecking,
    retryCount,
    nextRetryDelay,
    error,
    checkHealth,
  };
}

