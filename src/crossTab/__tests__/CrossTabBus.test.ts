import { createCrossTabBus } from '../CrossTabBus.js';

type TestMessage = { type: 'ping'; at: number };

describe('createCrossTabBus', () => {
  it('notifies subscribers on publish', () => {
    const bus = createCrossTabBus<TestMessage>({ channelName: 'test-bus-unit' });
    const received: TestMessage[] = [];
    const unsub = bus.subscribe((msg) => {
      received.push(msg);
    });
    bus.publish({ type: 'ping', at: 1 });
    expect(received).toEqual([{ type: 'ping', at: 1 }]);
    unsub();
    bus.close();
  });
});
