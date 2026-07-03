/**
 * G-I09 / AN-070 — client emit storm dedup (500ms cooldown per event+screen).
 */
const DEFAULT_COOLDOWN_MS = 500;

const lastEmitAtMs = new Map<string, number>();

function dedupKey(eventName: string, screenName?: string | null): string {
  return `${eventName}::${screenName ?? ''}`;
}

export interface ShouldDedupAnalyticsEmitInput {
  readonly eventName: string;
  readonly screenName?: string | null;
  readonly nowMs?: number;
  readonly cooldownMs?: number;
}

/**
 * Returns true when the emit should be skipped (storm dedup window).
 * Call `recordAnalyticsEmitDedup` after a successful emit.
 */
export function shouldDedupAnalyticsEmit(input: ShouldDedupAnalyticsEmitInput): boolean {
  const cooldownMs = input.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const key = dedupKey(input.eventName, input.screenName);
  const nowMs = input.nowMs ?? Date.now();
  const last = lastEmitAtMs.get(key);
  return last !== undefined && nowMs - last < cooldownMs;
}

export function recordAnalyticsEmitDedup(input: ShouldDedupAnalyticsEmitInput): void {
  const key = dedupKey(input.eventName, input.screenName);
  lastEmitAtMs.set(key, input.nowMs ?? Date.now());
}

/** Test-only reset. */
export function resetAnalyticsEmitDedupForTests(): void {
  lastEmitAtMs.clear();
}

export const ANALYTICS_EMIT_DEDUP_COOLDOWN_MS = DEFAULT_COOLDOWN_MS;
