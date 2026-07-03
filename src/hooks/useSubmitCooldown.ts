import { useCallback, useEffect, useState } from 'react';

export interface UseSubmitCooldownResult {
  readonly isCoolingDown: boolean;
  readonly remainingSeconds: number;
  readonly startCooldown: (durationMs: number) => void;
  readonly clearCooldown: () => void;
}

/**
 * Prevents double-tab / rapid repeat submits after rate-limit or mutation errors.
 */
export function useSubmitCooldown(): UseSubmitCooldownResult {
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (cooldownUntil === null) {
      setRemainingSeconds(0);
      return;
    }

    const tick = (): void => {
      const remainingMs = cooldownUntil - Date.now();
      if (remainingMs <= 0) {
        setCooldownUntil(null);
        setRemainingSeconds(0);
        return;
      }
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
    };

    tick();
    const intervalId = setInterval(tick, 250);
    return () => {
      clearInterval(intervalId);
    };
  }, [cooldownUntil]);

  const startCooldown = useCallback((durationMs: number): void => {
    const safeMs = Math.max(durationMs, 0);
    if (safeMs === 0) {
      return;
    }
    setCooldownUntil(Date.now() + safeMs);
  }, []);

  const clearCooldown = useCallback((): void => {
    setCooldownUntil(null);
    setRemainingSeconds(0);
  }, []);

  return {
    isCoolingDown: cooldownUntil !== null && Date.now() < cooldownUntil,
    remainingSeconds,
    startCooldown,
    clearCooldown,
  };
}
