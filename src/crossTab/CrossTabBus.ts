/**
 * Cross-tab messaging bus — BroadcastChannel with localStorage fallback.
 * No secrets on the wire; payloads must be non-sensitive sync signals only.
 */

const STORAGE_PREFIX = 'rpapp-crosstab:';
const STORAGE_DEBOUNCE_MS = 50;

export interface CrossTabBus<TMessage extends { type: string }> {
  publish(message: TMessage): void;
  subscribe(handler: (msg: TMessage) => void): () => void;
  close(): void;
}

interface CrossTabBusOptions {
  readonly channelName: string;
  readonly debounceMs?: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function createCrossTabBus<TMessage extends { type: string }>(
  options: CrossTabBusOptions
): CrossTabBus<TMessage> {
  const { channelName, debounceMs = STORAGE_DEBOUNCE_MS } = options;
  const subscribers = new Set<(msg: TMessage) => void>();
  let closed = false;
  let broadcast: BroadcastChannel | null = null;
  let storageTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingStoragePayload: string | null = null;

  const notify = (msg: TMessage): void => {
    if (closed) {
      return;
    }
    for (const handler of subscribers) {
      handler(msg);
    }
  };

  const flushStorage = (): void => {
    storageTimer = null;
    if (!isBrowser() || pendingStoragePayload === null) {
      return;
    }
    try {
      const key = `${STORAGE_PREFIX}${channelName}`;
      window.localStorage.setItem(key, pendingStoragePayload);
      window.localStorage.removeItem(key);
    } catch {
      // ignore quota / private mode
    }
    pendingStoragePayload = null;
  };

  const scheduleStoragePublish = (payload: string): void => {
    pendingStoragePayload = payload;
    if (storageTimer !== null) {
      return;
    }
    storageTimer = setTimeout(flushStorage, debounceMs);
  };

  if (isBrowser() && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcast = new BroadcastChannel(channelName);
      broadcast.onmessage = (event: MessageEvent<unknown>): void => {
        const data = event.data as TMessage;
        if (data && typeof data === 'object' && typeof data.type === 'string') {
          notify(data);
        }
      };
    } catch {
      broadcast = null;
    }
  }

  let onStorage: ((event: StorageEvent) => void) | null = null;
  if (isBrowser()) {
    onStorage = (event: StorageEvent): void => {
      if (event.key !== `${STORAGE_PREFIX}${channelName}` || !event.newValue) {
        return;
      }
      try {
        const parsed = JSON.parse(event.newValue) as TMessage;
        if (parsed && typeof parsed.type === 'string') {
          notify(parsed);
        }
      } catch {
        // ignore malformed payloads
      }
    };
    window.addEventListener('storage', onStorage);
  }

  return {
    publish(message: TMessage): void {
      if (closed) {
        return;
      }
      notify(message);
      const payload = JSON.stringify(message);
      if (broadcast) {
        broadcast.postMessage(message);
      }
      if (isBrowser()) {
        scheduleStoragePublish(payload);
      }
    },
    subscribe(handler: (msg: TMessage) => void): () => void {
      subscribers.add(handler);
      return () => {
        subscribers.delete(handler);
      };
    },
    close(): void {
      closed = true;
      if (storageTimer !== null) {
        clearTimeout(storageTimer);
        storageTimer = null;
      }
      if (onStorage && isBrowser()) {
        window.removeEventListener('storage', onStorage);
        onStorage = null;
      }
      broadcast?.close();
      broadcast = null;
      subscribers.clear();
    },
  };
}
