/**
 * Simple Map-based repeat cap for frontend hot-loop logging.
 * Callers decide how to emit; this only tracks whether another emit is allowed.
 */

export const DEFAULT_CLIENT_LOG_REPEAT_CAP = 10;

const repeatCounts = new Map<string, number>();

/**
 * Increments the counter for `key` and returns whether the caller should emit
 * (true while count ≤ maxRepeats).
 */
export function shouldEmitLogRepeat(
  key: string,
  maxRepeats: number = DEFAULT_CLIENT_LOG_REPEAT_CAP
): boolean {
  const count = (repeatCounts.get(key) ?? 0) + 1;
  repeatCounts.set(key, count);
  return count <= maxRepeats;
}

/** Current count for a key (0 if never seen). */
export function getLogRepeatCount(key: string): number {
  return repeatCounts.get(key) ?? 0;
}

/** Test-only reset of repeat counters. */
export function resetLogRepeatCapForTests(): void {
  repeatCounts.clear();
}
