import { useCallback, useRef, useState, type RefObject } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import {
  fetchTurnstileConfig,
  TurnstileConfigFetchError,
} from '../../auth/turnstileTypes.js';

const TURNSTILE_EXECUTE_TIMEOUT_MS = 30_000;
const TURNSTILE_WIDGET_READY_TIMEOUT_MS = 15_000;

export interface UseTurnstileExecuteResult {
  readonly required: boolean;
  readonly siteKey: string | null;
  readonly widgetKey: number;
  readonly isLoading: boolean;
  readonly isError: boolean;
  /** True when public config settled successfully (enabled or intentionally off). */
  readonly isReady: boolean;
  readonly turnstileRef: RefObject<TurnstileInstance | undefined>;
  readonly execute: () => Promise<string | undefined>;
  readonly resetTurnstile: () => void;
  readonly refetchConfig: () => void;
  readonly onWidgetLoad: () => void;
  readonly onSuccess: (token: string) => void;
  readonly onExpire: () => void;
  readonly onError: () => void;
}

export function useTurnstileExecute(apiBaseUrl = ''): UseTurnstileExecuteResult {
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const pendingResolveRef = useRef<((token: string) => void) | null>(null);
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const widgetReadyRef = useRef(false);
  const widgetReadyWaitersRef = useRef<Array<() => void>>([]);
  const [widgetKey, setWidgetKey] = useState(0);

  const query = useQuery({
    queryKey: ['turnstile-config', apiBaseUrl],
    queryFn: () => fetchTurnstileConfig(apiBaseUrl),
    staleTime: 5 * 60_000,
    // BAN retry stampede when API/proxy is down (ECONNREFUSED → Vite proxy spam).
    // Fail closed once; caller uses refetchConfig() / page refresh to retry.
    retry: false,
    refetchOnReconnect: false,
  });

  const siteKey = query.data?.siteKey ?? null;
  const required =
    query.data?.enabled === true && typeof siteKey === 'string' && siteKey.length > 0;
  const isLoading = query.isPending;
  const isError = query.isError;
  const isReady = query.isSuccess;

  const clearPending = useCallback((): void => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingResolveRef.current = null;
    pendingRejectRef.current = null;
  }, []);

  const resetTurnstile = useCallback((): void => {
    clearPending();
    widgetReadyRef.current = false;
    widgetReadyWaitersRef.current = [];
    setWidgetKey((current) => current + 1);
  }, [clearPending]);

  const onWidgetLoad = useCallback((): void => {
    widgetReadyRef.current = true;
    const waiters = widgetReadyWaitersRef.current;
    widgetReadyWaitersRef.current = [];
    for (const resolve of waiters) {
      resolve();
    }
  }, []);

  const waitForWidgetReady = useCallback(async (): Promise<void> => {
    if (widgetReadyRef.current) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        widgetReadyWaitersRef.current = widgetReadyWaitersRef.current.filter((w) => w !== onReady);
        reject(
          new Error(
            'Security check widget did not load in time. Refresh the page and retry.'
          )
        );
      }, TURNSTILE_WIDGET_READY_TIMEOUT_MS);
      const onReady = (): void => {
        clearTimeout(timeoutId);
        resolve();
      };
      widgetReadyWaitersRef.current.push(onReady);
    });
  }, []);

  const onSuccess = useCallback(
    (token: string): void => {
      pendingResolveRef.current?.(token);
      clearPending();
    },
    [clearPending]
  );

  const onExpire = useCallback((): void => {
    pendingRejectRef.current?.(
      new Error('Security check expired. Retry the action.')
    );
    clearPending();
    resetTurnstile();
  }, [clearPending, resetTurnstile]);

  const onError = useCallback((): void => {
    pendingRejectRef.current?.(
      new Error('Security check failed. Retry the action or refresh the page.')
    );
    clearPending();
    resetTurnstile();
  }, [clearPending, resetTurnstile]);

  const refetchConfig = useCallback((): void => {
    void query.refetch();
  }, [query]);

  const execute = useCallback(async (): Promise<string | undefined> => {
    if (isError) {
      const cause = query.error;
      if (cause instanceof TurnstileConfigFetchError) {
        throw cause;
      }
      throw new TurnstileConfigFetchError(
        'Security check configuration is unavailable. Retry in a few seconds or refresh the page.',
        { cause }
      );
    }
    if (!isReady) {
      throw new Error('Security check is still loading. Retry in a moment.');
    }
    if (!required) {
      return undefined;
    }
    await waitForWidgetReady();
    return new Promise<string>((resolve, reject) => {
      clearPending();
      pendingResolveRef.current = resolve;
      pendingRejectRef.current = reject;
      timeoutRef.current = setTimeout(() => {
        pendingRejectRef.current?.(
          new Error('Security check timed out. Retry the action.')
        );
        clearPending();
        resetTurnstile();
      }, TURNSTILE_EXECUTE_TIMEOUT_MS);
      turnstileRef.current?.execute();
    });
  }, [
    isError,
    isReady,
    required,
    query.error,
    waitForWidgetReady,
    clearPending,
    resetTurnstile,
  ]);

  return {
    required,
    siteKey,
    widgetKey,
    isLoading,
    isError,
    isReady,
    turnstileRef,
    execute,
    resetTurnstile,
    refetchConfig,
    onWidgetLoad,
    onSuccess,
    onExpire,
    onError,
  };
}
