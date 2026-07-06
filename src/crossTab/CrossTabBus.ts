/**
 * Cross-tab messaging bus — BroadcastChannel with localStorage fallback.
 * No secrets on the wire; payloads must be non-sensitive sync signals only.
 */

const STORAGE_PREFIX = 'rpapp-crosstab:';
const STORAGE_DEBOUNCE_MS = 50;
const TAB_ID_SYMBOL = Symbol.for('rpapp.crossTab.tabId');
const SEQUENCE_SYMBOL = Symbol.for('rpapp.crossTab.sequence');

interface CrossTabGlobalState {
  [TAB_ID_SYMBOL]?: string;
  [SEQUENCE_SYMBOL]?: number;
}

export interface CrossTabEnvelope<TMessage extends { type: string }> {
  tabId: string;
  sequence: number;
  payload: TMessage;
}

export interface CrossTabBus<TMessage extends { type: string }> {
  publish(message: TMessage): void;
  subscribe(handler: (msg: TMessage) => void): () => void;
  close(): void;
}

interface CrossTabBusOptions {
  readonly channelName: string;
  readonly debounceMs?: number;
}

function getCrossTabGlobalState(): CrossTabGlobalState {
  return globalThis as unknown as CrossTabGlobalState;
}

function createTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getTabId(): string {
  const globalState = getCrossTabGlobalState();
  const existingTabId = globalState[TAB_ID_SYMBOL];
  if (existingTabId) {
    return existingTabId;
  }
  const newTabId = createTabId();
  globalState[TAB_ID_SYMBOL] = newTabId;
  return newTabId;
}

function nextSequence(): number {
  const globalState = getCrossTabGlobalState();
  const currentSequence = globalState[SEQUENCE_SYMBOL] ?? 0;
  const newSequence = currentSequence + 1;
  globalState[SEQUENCE_SYMBOL] = newSequence;
  return newSequence;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function isEnvelope<TMessage extends { type: string }>(
  value: unknown
): value is CrossTabEnvelope<TMessage> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<CrossTabEnvelope<TMessage>>;
  return (
    typeof candidate.tabId === 'string' &&
    typeof candidate.sequence === 'number' &&
    Boolean(candidate.payload) &&
    typeof candidate.payload === 'object' &&
    typeof candidate.payload.type === 'string'
  );
}

function isMessageWithType<TMessage extends { type: string }>(value: unknown): value is TMessage {
  return Boolean(value) && typeof value === 'object' && typeof (value as TMessage).type === 'string';
}

export function createCrossTabBus<TMessage extends { type: string }>(
  options: CrossTabBusOptions
): CrossTabBus<TMessage> {
  const { channelName, debounceMs = STORAGE_DEBOUNCE_MS } = options;
  const tabId = getTabId();
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

  const parseIncoming = (raw: unknown): TMessage | null => {
    if (isEnvelope<TMessage>(raw)) {
      if (raw.tabId === tabId) {
        return null;
      }
      return raw.payload;
    }
    if (isMessageWithType<TMessage>(raw)) {
      return raw;
    }
    return null;
  };

  if (isBrowser() && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcast = new BroadcastChannel(channelName);
      broadcast.onmessage = (event: MessageEvent<unknown>): void => {
        const data = parseIncoming(event.data);
        if (data) {
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
        const parsed = parseIncoming(JSON.parse(event.newValue) as unknown);
        if (parsed) {
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
      // GAP-P0-05: local subscribers first, then broadcast + storage fallback.
      notify(message);
      const envelope: CrossTabEnvelope<TMessage> = {
        tabId,
        sequence: nextSequence(),
        payload: message,
      };
      const payload = JSON.stringify(envelope);
      if (broadcast) {
        broadcast.postMessage(envelope);
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
