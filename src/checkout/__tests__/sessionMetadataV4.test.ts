import {
  assertSessionMetadataV4ChannelRules,
  isSessionMetadataV4,
  type SessionMetadataEnvelopeV4,
} from '../sessionMetadataV4.js';

describe('sessionMetadataV4', () => {
  it('recognizes version 4 and rejects non-objects', () => {
    expect(isSessionMetadataV4({ version: 4 })).toBe(true);
    expect(isSessionMetadataV4({ version: 5 })).toBe(false);
    expect(isSessionMetadataV4(null)).toBe(false);
    expect(isSessionMetadataV4('x')).toBe(false);
  });

  it('allows missing checkoutMode', () => {
    const envelope: SessionMetadataEnvelopeV4 = { version: 4 };
    expect(() => assertSessionMetadataV4ChannelRules(envelope)).not.toThrow();
  });

  it('rejects invalid MOBILE_FIRST selectedMode', () => {
    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_STAFF_HANDOFF',
          pickupHandoffMode: 'STAFF_SCAN',
        },
      }),
    ).toThrow('SESSION_METADATA_V4_MOBILE_MODE_INVALID');
  });

  it('rejects KIOSK_FIRST + PREPAY_COLLECT_LATER', () => {
    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'KIOSK_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
      }),
    ).toThrow('SESSION_METADATA_V4_KIOSK_MODE_INVALID');
  });

  it('enforces MOBILE collect timing for PREPAY_COLLECT_LATER', () => {
    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
        collect: { timing: 'NOW', pickupPointId: 1 },
      }),
    ).toThrow('SESSION_METADATA_V4_MOBILE_COLLECT_TIMING_INVALID');

    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
        collect: { timing: 'LATER', pickupPointId: 1 },
      }),
    ).not.toThrow();
  });

  it('enforces MOBILE collect timing for PAY_NOW_SELF_SERVICE', () => {
    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_SELF_SERVICE',
          pickupHandoffMode: 'AUTO_ON_PAYMENT',
        },
        collect: { timing: 'LATER', pickupPointId: 1 },
      }),
    ).toThrow('SESSION_METADATA_V4_MOBILE_COLLECT_TIMING_INVALID');

    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_SELF_SERVICE',
          pickupHandoffMode: 'AUTO_ON_PAYMENT',
        },
        collect: { timing: 'NOW', pickupPointId: 1 },
      }),
    ).not.toThrow();
  });

  it('allows KIOSK_FIRST pay-now without collect', () => {
    expect(() =>
      assertSessionMetadataV4ChannelRules({
        version: 4,
        checkoutMode: {
          channel: 'KIOSK_FIRST',
          selectedMode: 'PAY_NOW_SELF_SERVICE',
          pickupHandoffMode: 'AUTO_ON_PAYMENT',
        },
      }),
    ).not.toThrow();
  });
});
