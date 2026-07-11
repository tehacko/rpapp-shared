import {
  computePollRetryDelayMs,
  isServerOverloadPollError,
} from '../http/pollRetryBackoff.js';

describe('pollRetryBackoff', () => {
  it('detects 5xx and 503 overload errors', () => {
    expect(isServerOverloadPollError({ status: 503 })).toBe(true);
    expect(isServerOverloadPollError({ statusCode: 502 })).toBe(true);
    expect(isServerOverloadPollError({ status: 429 })).toBe(false);
    expect(isServerOverloadPollError(new Error('network'))).toBe(false);
  });

  it('grows delay exponentially and caps at maxMs', () => {
    const first = computePollRetryDelayMs(0, { status: 503 }, {
      baseMs: 1_000,
      maxMs: 5_000,
      multiplier: 2,
      jitterRatio: 0,
    });
    const second = computePollRetryDelayMs(1, { status: 503 }, {
      baseMs: 1_000,
      maxMs: 5_000,
      multiplier: 2,
      jitterRatio: 0,
    });
    expect(first).toBe(1_000);
    expect(second).toBe(2_000);
    expect(
      computePollRetryDelayMs(10, { status: 503 }, {
        baseMs: 1_000,
        maxMs: 5_000,
        multiplier: 2,
        jitterRatio: 0,
      }),
    ).toBe(5_000);
  });

  it('honors retryAfterMs on the error object', () => {
    const delay = computePollRetryDelayMs(0, { status: 503, retryAfterMs: 15_000 }, {
      baseMs: 1_000,
      maxMs: 60_000,
      multiplier: 2,
      jitterRatio: 0,
    });
    expect(delay).toBe(15_000);
  });
});
