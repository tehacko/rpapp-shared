/** @jest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { createCrossTabBus } from '../CrossTabBus.js';
import {
  createCrossTabTestHarness,
  type CrossTabTestHarness,
} from './crossTabTestHarness.js';

type TestMessage = { type: 'ping'; at: number };
type TestEnvelope = {
  tabId: string;
  sequence: number;
  payload: TestMessage;
};

describe('createCrossTabBus', () => {
  let harness: CrossTabTestHarness;

  beforeEach(() => {
    harness = createCrossTabTestHarness();
    harness.install();
  });

  afterEach(() => {
    harness.restore();
  });

  it('notifies subscribers on publish', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-unit' });
    const received: TestMessage[] = [];
    const unsubscribe = bus.subscribe((msg) => {
      received.push(msg);
    });

    bus.publish({ type: 'ping', at: 1 });

    expect(received).toEqual([{ type: 'ping', at: 1 }]);
    unsubscribe();
    bus.close();
  });

  it('receives enveloped broadcast messages from another tab', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-broadcast' });
    const received: TestMessage[] = [];
    const unsubscribe = bus.subscribe((msg) => {
      received.push(msg);
    });

    harness.emitBroadcast('test-bus-broadcast', {
      tabId: 'other-tab',
      sequence: 10,
      payload: { type: 'ping', at: 2 },
    });

    expect(received).toEqual([{ type: 'ping', at: 2 }]);
    unsubscribe();
    bus.close();
  });

  it('ignores same-tab enveloped echo', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-echo' });
    const received: TestMessage[] = [];
    const unsubscribe = bus.subscribe((msg) => {
      received.push(msg);
    });

    bus.publish({ type: 'ping', at: 3 });
    const posted = harness.getPostedMessages('test-bus-echo');
    expect(posted).toHaveLength(1);
    const publishedEnvelope = posted[0] as TestEnvelope;

    harness.emitBroadcast('test-bus-echo', publishedEnvelope);

    expect(received).toEqual([{ type: 'ping', at: 3 }]);
    unsubscribe();
    bus.close();
  });

  it('accepts legacy storage payloads without envelope', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-storage' });
    const received: TestMessage[] = [];
    const unsubscribe = bus.subscribe((msg) => {
      received.push(msg);
    });

    harness.emitStorage('test-bus-storage', { type: 'ping', at: 4 });

    expect(received).toEqual([{ type: 'ping', at: 4 }]);
    unsubscribe();
    bus.close();
  });

  it('assigns monotonically increasing sequence numbers (GAP-P0-05)', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-sequence' });

    bus.publish({ type: 'ping', at: 1 });
    bus.publish({ type: 'ping', at: 2 });

    const posted = harness.getPostedMessages('test-bus-sequence');
    expect(posted).toHaveLength(2);
    const first = posted[0] as TestEnvelope;
    const second = posted[1] as TestEnvelope;
    expect(second.sequence).toBeGreaterThan(first.sequence);

    bus.close();
  });

  it('notifies local subscribers synchronously before broadcast post (GAP-P0-05)', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-order' });
    const order: string[] = [];

    bus.subscribe(() => {
      order.push('local');
    });

    bus.publish({ type: 'ping', at: 5 });

    expect(order).toEqual(['local']);
    expect(harness.getPostedMessages('test-bus-order')).toHaveLength(1);

    bus.close();
  });
});
