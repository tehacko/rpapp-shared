const STORAGE_PREFIX = 'rpapp-crosstab:';

class FakeBroadcastChannel implements BroadcastChannel {
  private static channels = new Map<string, Set<FakeBroadcastChannel>>();
  private static postedMessages = new Map<string, unknown[]>();

  readonly name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent<unknown>) => unknown) | null = null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent<unknown>) => unknown) | null = null;

  constructor(name: string) {
    this.name = name;
    const instances = FakeBroadcastChannel.channels.get(name) ?? new Set<FakeBroadcastChannel>();
    instances.add(this);
    FakeBroadcastChannel.channels.set(name, instances);
  }

  postMessage(message: unknown): void {
    const posted = FakeBroadcastChannel.postedMessages.get(this.name) ?? [];
    posted.push(message);
    FakeBroadcastChannel.postedMessages.set(this.name, posted);

    const instances = FakeBroadcastChannel.channels.get(this.name);
    if (!instances) {
      return;
    }

    const event = new MessageEvent<unknown>('message', { data: message });
    for (const instance of instances) {
      if (instance === this) {
        continue;
      }
      instance.onmessage?.call(instance, event);
    }
  }

  close(): void {
    const instances = FakeBroadcastChannel.channels.get(this.name);
    if (!instances) {
      return;
    }
    instances.delete(this);
    if (instances.size === 0) {
      FakeBroadcastChannel.channels.delete(this.name);
    }
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  addEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions
  ): void {
    // No-op for tests; bus uses `onmessage` callback style.
  }

  removeEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | EventListenerOptions
  ): void {
    // No-op for tests; bus uses `onmessage` callback style.
  }

  static reset(): void {
    FakeBroadcastChannel.channels.clear();
    FakeBroadcastChannel.postedMessages.clear();
  }

  static emitToChannel(channelName: string, message: unknown): void {
    const instances = FakeBroadcastChannel.channels.get(channelName);
    if (!instances) {
      return;
    }
    const event = new MessageEvent<unknown>('message', { data: message });
    for (const instance of instances) {
      instance.onmessage?.call(instance, event);
    }
  }

  static getPostedMessages(channelName: string): readonly unknown[] {
    return FakeBroadcastChannel.postedMessages.get(channelName) ?? [];
  }
}

export interface CrossTabTestHarness {
  install(): void;
  restore(): void;
  emitBroadcast(channelName: string, message: unknown): void;
  emitStorage(channelName: string, message: unknown): void;
  getPostedMessages(channelName: string): readonly unknown[];
}

export function createCrossTabTestHarness(): CrossTabTestHarness {
  const originalBroadcastChannel = globalThis.BroadcastChannel;

  return {
    install(): void {
      Object.defineProperty(globalThis, 'BroadcastChannel', {
        configurable: true,
        writable: true,
        value: FakeBroadcastChannel,
      });
      FakeBroadcastChannel.reset();
      window.localStorage.clear();
    },
    restore(): void {
      Object.defineProperty(globalThis, 'BroadcastChannel', {
        configurable: true,
        writable: true,
        value: originalBroadcastChannel,
      });
      FakeBroadcastChannel.reset();
      window.localStorage.clear();
    },
    emitBroadcast(channelName: string, message: unknown): void {
      FakeBroadcastChannel.emitToChannel(channelName, message);
    },
    emitStorage(channelName: string, message: unknown): void {
      const key = `${STORAGE_PREFIX}${channelName}`;
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(message),
          storageArea: window.localStorage,
          url: window.location.href,
        })
      );
    },
    getPostedMessages(channelName: string): readonly unknown[] {
      return FakeBroadcastChannel.getPostedMessages(channelName);
    },
  };
}
