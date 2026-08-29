/**
 * Singleton /health poller — one schedule per endpoint per browser profile.
 *
 * Best practices:
 * - Cross-tab leader via Web Locks (fallback: in-process mutex only)
 * - Pause automatic polls while document is hidden
 * - 429 = rate-limited (keep last known DB state; backoff via Retry-After)
 * - Real outages (5xx / unhealthy JSON / network) use exponential backoff
 * - No overlapping in-flight requests
 */

import { createCrossTabBus } from '../crossTab/CrossTabBus.js';

const DEFAULT_HEALTHY_POLL_MS = 120_000;
const MIN_AUTO_INTERVAL_MS = 60_000;
const UNHEALTHY_BACKOFF_START_MS = 60_000;
const UNHEALTHY_BACKOFF_MAX_MS = 300_000;
const LOCK_STALE_MS = 15_000;

export interface HealthCoordinatorSnapshot {
  readonly isDatabaseAvailable: boolean;
  readonly isChecking: boolean;
  readonly hasResolvedInitialCheck: boolean;
  readonly retryCount: number;
  readonly nextRetryDelay: number;
  readonly error: Error | null;
}

interface HealthResponse {
  success: boolean;
  status?: 'healthy' | 'unhealthy';
}

type HealthBusMessage =
  | {
      type: 'health-update';
      endpoint: string;
      available: boolean;
      checkedAt: number;
      errorMessage: string | null;
    }
  | { type: 'health-checking'; endpoint: string };

interface EndpointState {
  endpoint: string;
  subscribers: Set<(snapshot: HealthCoordinatorSnapshot) => void>;
  snapshot: HealthCoordinatorSnapshot;
  enabled: boolean;
  pollIntervalMs: number;
  maxRetries: number;
  pollTimer: ReturnType<typeof setTimeout> | null;
  leaderAbort: AbortController | null;
  inFlight: boolean;
  lastCheckAt: number;
  unhealthyBackoffMs: number;
  retryCount: number;
}

const endpoints = new Map<string, EndpointState>();

const healthBus = createCrossTabBus<HealthBusMessage>({
  channelName: 'rpapp-database-health',
});

healthBus.subscribe((message) => {
  if (message.type === 'health-update') {
    applyRemoteResult(message.endpoint, message.available, message.errorMessage, message.checkedAt);
  }
});

function emptySnapshot(): HealthCoordinatorSnapshot {
  return {
    isDatabaseAvailable: true,
    isChecking: false,
    hasResolvedInitialCheck: false,
    retryCount: 0,
    nextRetryDelay: 0,
    error: null,
  };
}

function getOrCreateState(endpoint: string): EndpointState {
  const existing = endpoints.get(endpoint);
  if (existing) {
    return existing;
  }
  const created: EndpointState = {
    endpoint,
    subscribers: new Set(),
    snapshot: emptySnapshot(),
    enabled: false,
    pollIntervalMs: DEFAULT_HEALTHY_POLL_MS,
    maxRetries: 5,
    pollTimer: null,
    leaderAbort: null,
    inFlight: false,
    lastCheckAt: 0,
    unhealthyBackoffMs: UNHEALTHY_BACKOFF_START_MS,
    retryCount: 0,
  };
  endpoints.set(endpoint, created);
  return created;
}

function notify(state: EndpointState): void {
  for (const listener of state.subscribers) {
    listener(state.snapshot);
  }
}

function patchSnapshot(
  state: EndpointState,
  patch: Partial<HealthCoordinatorSnapshot>
): void {
  state.snapshot = { ...state.snapshot, ...patch };
  notify(state);
}

function applyRemoteResult(
  endpoint: string,
  available: boolean,
  errorMessage: string | null,
  checkedAt: number
): void {
  const state = endpoints.get(endpoint);
  if (!state) {
    return;
  }
  state.lastCheckAt = checkedAt;
  patchSnapshot(state, {
    isDatabaseAvailable: available,
    isChecking: false,
    hasResolvedInitialCheck: true,
    error: errorMessage ? new Error(errorMessage) : null,
    retryCount: available ? 0 : state.retryCount,
    nextRetryDelay: available ? 0 : state.snapshot.nextRetryDelay,
  });
  if (available) {
    state.retryCount = 0;
    state.unhealthyBackoffMs = UNHEALTHY_BACKOFF_START_MS;
  }
}

function parseRetryAfterMs(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.max(seconds * 1000, MIN_AUTO_INTERVAL_MS);
    }
    const dateMs = Date.parse(retryAfter);
    if (!Number.isNaN(dateMs)) {
      return Math.max(dateMs - Date.now(), MIN_AUTO_INTERVAL_MS);
    }
  }
  const reset = response.headers.get('ratelimit-reset');
  if (reset) {
    const resetSeconds = Number(reset);
    if (Number.isFinite(resetSeconds) && resetSeconds >= 0) {
      return Math.max(resetSeconds * 1000, MIN_AUTO_INTERVAL_MS);
    }
  }
  return null;
}

function isDocumentHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}

function clearPollTimer(state: EndpointState): void {
  if (state.pollTimer !== null) {
    clearTimeout(state.pollTimer);
    state.pollTimer = null;
  }
}

function scheduleNextPoll(state: EndpointState, delayMs: number): void {
  clearPollTimer(state);
  if (!state.enabled || state.subscribers.size === 0) {
    return;
  }
  const delay = Math.max(delayMs, MIN_AUTO_INTERVAL_MS);
  patchSnapshot(state, { nextRetryDelay: delay });
  state.pollTimer = setTimeout(() => {
    void performHealthFetch(state);
  }, delay);
}

async function performHealthFetch(state: EndpointState): Promise<void> {
  if (state.inFlight) {
    return;
  }
  const now = Date.now();
  if (now - state.lastCheckAt < MIN_AUTO_INTERVAL_MS) {
    return;
  }
  if (isDocumentHidden()) {
    scheduleNextPoll(state, state.pollIntervalMs);
    return;
  }

  state.inFlight = true;
  patchSnapshot(state, { isChecking: true, error: null });
  healthBus.publish({ type: 'health-checking', endpoint: state.endpoint });

  try {
    const response = await fetch(state.endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (response.status === 429) {
      // Product intent: 429 is transport throttling, not an outage — keep the last known
      // isDatabaseAvailable value so the full-screen gate does not flash during backoff.
      const retryMs = parseRetryAfterMs(response) ?? state.pollIntervalMs;
      state.lastCheckAt = Date.now();
      patchSnapshot(state, {
        isChecking: false,
        hasResolvedInitialCheck: true,
        error: new Error('Health check rate-limited; backing off'),
      });
      scheduleNextPoll(state, retryMs);
      return;
    }

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid response: expected JSON, got ${contentType ?? 'unknown'}`);
    }

    const data = (await response.json()) as HealthResponse;
    if (data.success !== true) {
      throw new Error('Database reported unhealthy status');
    }

    state.lastCheckAt = Date.now();
    state.retryCount = 0;
    state.unhealthyBackoffMs = UNHEALTHY_BACKOFF_START_MS;
    patchSnapshot(state, {
      isDatabaseAvailable: true,
      isChecking: false,
      hasResolvedInitialCheck: true,
      retryCount: 0,
      nextRetryDelay: 0,
      error: null,
    });
    healthBus.publish({
      type: 'health-update',
      endpoint: state.endpoint,
      available: true,
      checkedAt: state.lastCheckAt,
      errorMessage: null,
    });
    scheduleNextPoll(state, state.pollIntervalMs);
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Health check failed');
    state.lastCheckAt = Date.now();
    state.retryCount += 1;
    const nextBackoff = Math.min(state.unhealthyBackoffMs * 2, UNHEALTHY_BACKOFF_MAX_MS);
    state.unhealthyBackoffMs = nextBackoff;
    const delayMs =
      state.retryCount >= state.maxRetries
        ? Math.max(state.pollIntervalMs, nextBackoff)
        : Math.max(nextBackoff, MIN_AUTO_INTERVAL_MS);

    patchSnapshot(state, {
      isDatabaseAvailable: false,
      isChecking: false,
      hasResolvedInitialCheck: true,
      retryCount: state.retryCount,
      nextRetryDelay: delayMs,
      error,
    });
    healthBus.publish({
      type: 'health-update',
      endpoint: state.endpoint,
      available: false,
      checkedAt: state.lastCheckAt,
      errorMessage: error.message,
    });
    scheduleNextPoll(state, delayMs);
  } finally {
    state.inFlight = false;
  }
}

async function leaderLoop(state: EndpointState, signal: AbortSignal): Promise<void> {
  while (!signal.aborted && state.enabled && state.subscribers.size > 0) {
    if (!isDocumentHidden()) {
      await performHealthFetch(state);
    } else {
      scheduleNextPoll(state, state.pollIntervalMs);
    }
    await new Promise<void>((resolve) => {
      const onAbort = (): void => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      };
      signal.addEventListener('abort', onAbort);
      if (signal.aborted) {
        onAbort();
      }
    });
    if (state.pollTimer !== null) {
      await new Promise<void>((resolve) => {
        const timer = state.pollTimer;
        if (timer === null) {
          resolve();
          return;
        }
        const check = (): void => {
          if (state.pollTimer !== timer) {
            resolve();
          }
        };
        const interval = setInterval(check, 250);
        const timeout = setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, state.snapshot.nextRetryDelay + LOCK_STALE_MS);
        void timeout;
      });
    }
  }
}

function stopLeader(state: EndpointState): void {
  clearPollTimer(state);
  state.leaderAbort?.abort();
  state.leaderAbort = null;
}

function startLeader(state: EndpointState): void {
  if (state.leaderAbort) {
    return;
  }
  const abort = new AbortController();
  state.leaderAbort = abort;

  const run = async (): Promise<void> => {
    if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks) {
      try {
        await navigator.locks.request(
          `rpapp-database-health:${state.endpoint}`,
          { signal: abort.signal },
          async () => {
            await leaderLoop(state, abort.signal);
          }
        );
      } catch {
        if (!abort.signal.aborted) {
          await leaderLoop(state, abort.signal);
        }
      }
    } else {
      await leaderLoop(state, abort.signal);
    }
    state.leaderAbort = null;
  };

  void run();
}

function onVisibilityChange(endpoint: string): void {
  const state = endpoints.get(endpoint);
  if (!state || !state.enabled) {
    return;
  }
  if (!isDocumentHidden()) {
    void performHealthFetch(state);
  }
}

const visibilityHandlers = new Map<string, () => void>();

function ensureVisibilityListener(endpoint: string): void {
  if (typeof document === 'undefined' || visibilityHandlers.has(endpoint)) {
    return;
  }
  const handler = (): void => {
    onVisibilityChange(endpoint);
  };
  visibilityHandlers.set(endpoint, handler);
  document.addEventListener('visibilitychange', handler);
}

function removeVisibilityListener(endpoint: string): void {
  const handler = visibilityHandlers.get(endpoint);
  if (!handler || typeof document === 'undefined') {
    return;
  }
  document.removeEventListener('visibilitychange', handler);
  visibilityHandlers.delete(endpoint);
}

export interface SubscribeDatabaseHealthInput {
  readonly endpoint: string;
  readonly enabled?: boolean;
  readonly pollInterval?: number;
  readonly maxRetries?: number;
}

export function subscribeDatabaseHealth(
  input: SubscribeDatabaseHealthInput,
  listener: (snapshot: HealthCoordinatorSnapshot) => void
): () => void {
  const state = getOrCreateState(input.endpoint);
  state.enabled = input.enabled ?? true;
  state.pollIntervalMs = input.pollInterval ?? DEFAULT_HEALTHY_POLL_MS;
  state.maxRetries = input.maxRetries ?? 5;

  state.subscribers.add(listener);
  listener(state.snapshot);
  ensureVisibilityListener(input.endpoint);

  if (state.subscribers.size === 1 && state.enabled) {
    startLeader(state);
    void performHealthFetch(state);
  }

  return () => {
    state.subscribers.delete(listener);
    if (state.subscribers.size === 0) {
      state.enabled = false;
      stopLeader(state);
      endpoints.delete(input.endpoint);
      removeVisibilityListener(input.endpoint);
    }
  };
}

export async function requestDatabaseHealthCheck(
  endpoint: string,
  options?: { readonly force?: boolean }
): Promise<void> {
  const state = endpoints.get(endpoint);
  if (!state) {
    return;
  }
  if (!options?.force && Date.now() - state.lastCheckAt < MIN_AUTO_INTERVAL_MS) {
    return;
  }
  await performHealthFetch(state);
}

export function resolveDatabaseHealthEndpoint(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3015/health';
  }
  const windowConfig = (window as { __RUNTIME_CONFIG__?: { apiUrl?: string } }).__RUNTIME_CONFIG__;
  const apiUrl = windowConfig?.apiUrl?.trim();
  if (apiUrl) {
    try {
      return `${new URL(apiUrl).origin}/health`;
    } catch {
      return `${apiUrl.replace(/\/+$/, '')}/health`;
    }
  }
  return `${window.location.origin}/health`;
}

/** Test-only reset */
export function resetDatabaseHealthCoordinatorForTests(): void {
  for (const state of endpoints.values()) {
    stopLeader(state);
    removeVisibilityListener(state.endpoint);
  }
  endpoints.clear();
  healthBus.close();
}
