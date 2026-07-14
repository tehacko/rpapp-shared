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
});
