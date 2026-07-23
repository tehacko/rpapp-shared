import {
  assertSessionMetadataV5ChannelRules,
  isSessionMetadataV5,
  upgradeSessionMetadataV4ToV5,
  type SessionMetadataEnvelopeV5,
} from '../sessionMetadataV5.js';

describe('sessionMetadataV5 compat (G-F2 / ADR-006)', () => {
  it('recognizes v5 envelope and promotions block', () => {
    const envelope: SessionMetadataEnvelopeV5 = {
      version: 5,
      promotions: {
        activatedPromoRewardId: 'reward-1',
        stackingMode: 'STACK_PROMO_THEN_LOYALTY',
        activatedAt: '2026-01-01T00:00:00.000Z',
        ruleVersionId: 'rule-v1',
      },
    };
    expect(isSessionMetadataV5(envelope)).toBe(true);
    expect(() => assertSessionMetadataV5ChannelRules(envelope)).not.toThrow();
  });

  it('rejects non-v5 payloads', () => {
    expect(isSessionMetadataV5({ version: 4 })).toBe(false);
    expect(isSessionMetadataV5(null)).toBe(false);
  });

  it('upgradeSessionMetadataV4ToV5 adds empty promotions when absent', () => {
    const upgraded = upgradeSessionMetadataV4ToV5({
      version: 4,
      loyalty: { activatedCouponId: 'coupon-1' },
    });
    expect(upgraded.version).toBe(5);
    expect(upgraded.promotions).toEqual({});
    expect(upgraded.loyalty?.activatedCouponId).toBe('coupon-1');
  });

  it('upgradeSessionMetadataV4ToV5 preserves existing promotions', () => {
    const upgraded = upgradeSessionMetadataV4ToV5({
      version: 4,
      promotions: { stackingMode: 'EXCLUSIVE' },
    });
    expect(upgraded.promotions?.stackingMode).toBe('EXCLUSIVE');
  });

  it('rejects invalid MOBILE_FIRST selectedMode', () => {
    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_STAFF_HANDOFF',
          pickupHandoffMode: 'STAFF_SCAN',
        },
      }),
    ).toThrow('SESSION_METADATA_V5_MOBILE_MODE_INVALID');
  });

  it('rejects KIOSK_FIRST + PREPAY_COLLECT_LATER', () => {
    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'KIOSK_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
      }),
    ).toThrow('SESSION_METADATA_V5_KIOSK_MODE_INVALID');
  });

  it('enforces MOBILE collect timing matrix', () => {
    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
        collect: { timing: 'NOW', pickupPointId: 1 },
      }),
    ).toThrow('SESSION_METADATA_V5_MOBILE_COLLECT_TIMING_INVALID');

    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_SELF_SERVICE',
          pickupHandoffMode: 'AUTO_ON_PAYMENT',
        },
        collect: { timing: 'LATER', pickupPointId: 1 },
      }),
    ).toThrow('SESSION_METADATA_V5_MOBILE_COLLECT_TIMING_INVALID');

    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PREPAY_COLLECT_LATER',
          pickupHandoffMode: 'STAFF_SCAN',
        },
        collect: { timing: 'LATER', pickupPointId: 1 },
      }),
    ).not.toThrow();

    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'MOBILE_FIRST',
          selectedMode: 'PAY_NOW_SELF_SERVICE',
          pickupHandoffMode: 'AUTO_ON_PAYMENT',
        },
        collect: { timing: 'NOW', pickupPointId: 1 },
      }),
    ).not.toThrow();
  });

  it('allows KIOSK_FIRST pay-now modes', () => {
    expect(() =>
      assertSessionMetadataV5ChannelRules({
        version: 5,
        checkoutMode: {
          channel: 'KIOSK_FIRST',
          selectedMode: 'PAY_NOW_STAFF_HANDOFF',
          pickupHandoffMode: 'STAFF_SCAN',
        },
      }),
    ).not.toThrow();
  });
});
