/**
 * Database Health Check Hook
 *
 * Delegates to a singleton coordinator (one poll schedule per /health endpoint).
 * See databaseHealthCoordinator.ts for cross-tab, visibility, and 429 handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type HealthCoordinatorSnapshot,
  requestDatabaseHealthCheck,
  resolveDatabaseHealthEndpoint,
  subscribeDatabaseHealth,
} from './databaseHealthCoordinator.js';

interface UseDatabaseHealthOptions {
  pollInterval?: number;
  maxRetries?: number;
  enabled?: boolean;
}

interface UseDatabaseHealthReturn {
  isDatabaseAvailable: boolean;
  isChecking: boolean;
  hasResolvedInitialCheck: boolean;
  retryCount: number;
  nextRetryDelay: number;
  error: Error | null;
  checkHealth: () => Promise<void>;
}

export function useDatabaseHealth(
  options: UseDatabaseHealthOptions = {}
): UseDatabaseHealthReturn {
  const {
    pollInterval = 120_000,
    maxRetries = 5,
    enabled = true,
  } = options;

  const endpointRef = useRef(resolveDatabaseHealthEndpoint());
  const [snapshot, setSnapshot] = useState<HealthCoordinatorSnapshot>({
    isDatabaseAvailable: true,
    isChecking: false,
    hasResolvedInitialCheck: false,
    retryCount: 0,
    nextRetryDelay: 0,
    error: null,
  });

  useEffect(() => {
    const endpoint = endpointRef.current;
    return subscribeDatabaseHealth(
      { endpoint, enabled, pollInterval, maxRetries },
      setSnapshot
    );
  }, [enabled, pollInterval, maxRetries]);

  const checkHealth = useCallback(async (): Promise<void> => {
    await requestDatabaseHealthCheck(endpointRef.current, { force: true });
  }, []);

  return {
    isDatabaseAvailable: snapshot.isDatabaseAvailable,
    isChecking: snapshot.isChecking,
    hasResolvedInitialCheck: snapshot.hasResolvedInitialCheck,
    retryCount: snapshot.retryCount,
    nextRetryDelay: snapshot.nextRetryDelay,
    error: snapshot.error,
    checkHealth,
  };
}
