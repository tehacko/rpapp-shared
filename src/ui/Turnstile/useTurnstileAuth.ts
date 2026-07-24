import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appendTurnstileToken, fetchTurnstileConfig } from '../../auth/turnstileTypes.js';

export interface UseTurnstileAuthResult {
  readonly required: boolean;
  readonly ready: boolean;
  readonly siteKey: string | null;
  readonly token: string | null;
  readonly widgetKey: number;
  readonly isLoading: boolean;
  readonly setToken: (value: string) => void;
  readonly resetTurnstile: () => void;
  readonly withTurnstile: <T extends Record<string, unknown>>(
    body: T
  ) => ReturnType<typeof appendTurnstileToken<T>>;
}

export function useTurnstileAuth(apiBaseUrl: string): UseTurnstileAuthResult {
  const [token, setTokenState] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const query = useQuery({
    queryKey: ['turnstile-config', apiBaseUrl],
    queryFn: () => fetchTurnstileConfig(apiBaseUrl),
    staleTime: 5 * 60_000,
  });

  const siteKey = query.data?.siteKey ?? null;
  const required =
    query.data?.enabled === true && typeof siteKey === 'string' && siteKey.length > 0;
  // Fail closed: config must load successfully before submit is considered ready.
  const ready =
    query.isSuccess && !query.isError && (!required || token !== null);

  const setToken = useCallback((value: string): void => {
    setTokenState(value);
  }, []);

  const resetTurnstile = useCallback((): void => {
    setTokenState(null);
    setWidgetKey((current) => current + 1);
  }, []);

  const withTurnstile = useCallback(
    <T extends Record<string, unknown>>(body: T) => appendTurnstileToken(body, token),
    [token]
  );

  return {
    required,
    ready,
    siteKey,
    token,
    widgetKey,
    isLoading: query.isPending,
    setToken,
    resetTurnstile,
    withTurnstile,
  };
}
