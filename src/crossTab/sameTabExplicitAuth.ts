/**
 * Same-tab login / establish marker that survives provider remount.
 *
 * Port of customer `sameTabExplicitAuth` for admin (and other) auth buses.
 * Login tabs publish auth-bus messages with notifyLocalSubscribers:false, but
 * remount races can still re-enter the bus subscriber as if this were a peer tab.
 * The TTL latch skips same-tab login bus re-entry so a fresh session is not
 * force-hydrated away. Logout must not self-echo — publishers use
 * notifyLocalSubscribers:false (CrossTabBus).
 *
 * Never put JWTs on the bus; this module only tracks a wall-clock TTL.
 */

const SAME_TAB_EXPLICIT_AUTH_TTL_MS = 8_000;

let sameTabExplicitAuthUntilMs = 0;

export function markSameTabExplicitAuth(nowMs: number = Date.now()): void {
  sameTabExplicitAuthUntilMs = nowMs + SAME_TAB_EXPLICIT_AUTH_TTL_MS;
}

export function hasSameTabExplicitAuth(nowMs: number = Date.now()): boolean {
  return nowMs < sameTabExplicitAuthUntilMs;
}

export function clearSameTabExplicitAuth(): void {
  sameTabExplicitAuthUntilMs = 0;
}
