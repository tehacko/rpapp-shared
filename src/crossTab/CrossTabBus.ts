/**
 * Cross-tab messaging bus — BroadcastChannel with localStorage fallback.
 * No secrets on the wire; payloads must be non-sensitive sync signals only.
 */

const STORAGE_PREFIX = 'rpapp-crosstab:';
const STORAGE_DEBOUNCE_MS = 50;
const TAB_ID_SYMBOL = Symbol.for('rpapp.crossTab.tabId');
const SEQUENCE_SYMBOL = Symbol.for('rpapp.crossTab.sequence');
/** Cap remembered peer tabs for BC+storage dual-delivery dedupe. */
const MAX_SEEN_PEER_TABS = 32;

interface CrossTabGlobalState {
  [TAB_ID_SYMBOL]?: string;
  [SEQUENCE_SYMBOL]?: number;
}

export interface CrossTabEnvelope<TMessage extends { type: string }> {
  tabId: string;
  sequence: number;
  payload: TMessage;
}

export interface CrossTabPublishOptions {
  /**
   * When true (default), notify same-tab subscribers synchronously on publish.
   * Auth buses that already apply local side effects should pass false so
   * publish is cross-tab only (BroadcastChannel + storage) — avoids self-echo.
   */
  readonly notifyLocalSubscribers?: boolean;
}

export interface CrossTabBus<TMessage extends { type: string }> {
  publish(message: TMessage, options?: CrossTabPublishOptions): void;
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
  /** Last accepted envelope sequence per peer tabId (G24 BC+storage dedupe). */
  const lastSequenceByTabId = new Map<string, number>();
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

  const rememberPeerSequence = (peerTabId: string, sequence: number): boolean => {
    const previous = lastSequenceByTabId.get(peerTabId);
    if (previous !== undefined && sequence <= previous) {
      return false;
    }
    if (!lastSequenceByTabId.has(peerTabId) && lastSequenceByTabId.size >= MAX_SEEN_PEER_TABS) {
      const oldestKey = lastSequenceByTabId.keys().next().value;
      if (typeof oldestKey === 'string') {
        lastSequenceByTabId.delete(oldestKey);
      }
    }
    lastSequenceByTabId.set(peerTabId, sequence);
    return true;
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
      // G24 — BC + storage fallback can deliver the same envelope twice.
      if (!rememberPeerSequence(raw.tabId, raw.sequence)) {
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
    publish(message: TMessage, publishOptions?: CrossTabPublishOptions): void {
      if (closed) {
        return;
      }
      const notifyLocal = publishOptions?.notifyLocalSubscribers !== false;
      // GAP-P0-05 / G3: optional same-tab notify (default true); then BC + storage.
      if (notifyLocal) {
        notify(message);
      }
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
      lastSequenceByTabId.clear();
    },
  };
}
