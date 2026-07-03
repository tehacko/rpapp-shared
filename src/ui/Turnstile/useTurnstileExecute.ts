import { useCallback, useRef, useState, type RefObject } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { fetchTurnstileConfig } from '../../auth/turnstileTypes.js';

const TURNSTILE_EXECUTE_TIMEOUT_MS = 30_000;

export interface UseTurnstileExecuteResult {
  readonly required: boolean;
  readonly siteKey: string | null;
  readonly widgetKey: number;
  readonly isLoading: boolean;
  readonly turnstileRef: RefObject<TurnstileInstance | undefined>;
  readonly execute: () => Promise<string | undefined>;
  readonly resetTurnstile: () => void;
  readonly onSuccess: (token: string) => void;
  readonly onExpire: () => void;
  readonly onError: () => void;
}

export function useTurnstileExecute(apiBaseUrl = ''): UseTurnstileExecuteResult {
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const pendingResolveRef = useRef<((token: string) => void) | null>(null);
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const query = useQuery({
    queryKey: ['turnstile-config', apiBaseUrl],
    queryFn: () => fetchTurnstileConfig(apiBaseUrl),
    staleTime: 5 * 60_000,
  });

  const siteKey = query.data?.siteKey ?? null;
  const required =
    query.data?.enabled === true && typeof siteKey === 'string' && siteKey.length > 0;

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
    setWidgetKey((current) => current + 1);
  }, [clearPending]);

  const onSuccess = useCallback(
    (token: string): void => {
      pendingResolveRef.current?.(token);
      clearPending();
    },
    [clearPending]
  );

  const onExpire = useCallback((): void => {
    pendingRejectRef.current?.(new Error('Turnstile expired'));
    clearPending();
    resetTurnstile();
  }, [clearPending, resetTurnstile]);

  const onError = useCallback((): void => {
    pendingRejectRef.current?.(new Error('Turnstile error'));
    clearPending();
    resetTurnstile();
  }, [clearPending, resetTurnstile]);

  const execute = useCallback(async (): Promise<string | undefined> => {
    if (!required) {
      return undefined;
    }
    return new Promise<string>((resolve, reject) => {
      clearPending();
      pendingResolveRef.current = resolve;
      pendingRejectRef.current = reject;
      timeoutRef.current = setTimeout(() => {
        pendingRejectRef.current?.(new Error('Turnstile execute timeout'));
        clearPending();
        resetTurnstile();
      }, TURNSTILE_EXECUTE_TIMEOUT_MS);
      turnstileRef.current?.execute();
    });
  }, [required, clearPending, resetTurnstile]);

  return {
    required,
    siteKey,
    widgetKey,
    isLoading: query.isLoading,
    turnstileRef,
    execute,
    resetTurnstile,
    onSuccess,
    onExpire,
    onError,
  };
}
