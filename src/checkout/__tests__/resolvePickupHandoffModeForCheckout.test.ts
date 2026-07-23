import { resolvePickupHandoffModeForCheckout } from '../resolvePickupHandoffModeForCheckout.js';

describe('resolvePickupHandoffModeForCheckout', () => {
  it('uses configured handoffDefaults when valid', () => {
    expect(
      resolvePickupHandoffModeForCheckout('PAY_NOW_SELF_SERVICE', {
        handoffDefaults: { PAY_NOW_SELF_SERVICE: 'CUSTOMER_TAP' },
      }),
    ).toBe('CUSTOMER_TAP');
  });

  it('ignores invalid configured values', () => {
    expect(
      resolvePickupHandoffModeForCheckout('PAY_NOW_SELF_SERVICE', {
        handoffDefaults: { PAY_NOW_SELF_SERVICE: 'NOT_A_MODE' },
      }),
    ).toBe('AUTO_ON_PAYMENT');
  });

  it('defaults staff modes to STAFF_SCAN', () => {
    expect(resolvePickupHandoffModeForCheckout('PREPAY_COLLECT_LATER')).toBe('STAFF_SCAN');
    expect(resolvePickupHandoffModeForCheckout('PAY_NOW_STAFF_HANDOFF', null)).toBe('STAFF_SCAN');
  });

  it('defaults self-service to AUTO_ON_PAYMENT', () => {
    expect(resolvePickupHandoffModeForCheckout('PAY_NOW_SELF_SERVICE', {})).toBe(
      'AUTO_ON_PAYMENT',
    );
    expect(
      resolvePickupHandoffModeForCheckout('PAY_NOW_SELF_SERVICE', { handoffDefaults: {} }),
    ).toBe('AUTO_ON_PAYMENT');
  });

  it('accepts all valid handoff modes', () => {
    for (const mode of ['AUTO_ON_PAYMENT', 'CUSTOMER_TAP', 'SCAN_AT_STAND', 'STAFF_SCAN'] as const) {
      expect(
        resolvePickupHandoffModeForCheckout('PAY_NOW_SELF_SERVICE', {
          handoffDefaults: { PAY_NOW_SELF_SERVICE: mode },
        }),
      ).toBe(mode);
    }
  });
});
