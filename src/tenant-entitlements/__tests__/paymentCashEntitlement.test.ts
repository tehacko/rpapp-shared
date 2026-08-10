import {
  PAYMENT_CASH_BLOCK_KEY,
  PAYMENT_CARD_PRESENT_RESERVED_KEY,
  canCashContributeToPayReady,
  isPaymentCashAxesEntitled,
  isPaymentCashEntitledFromChecker,
  isPaymentCashRuntimeModeActive,
} from '../paymentCashEntitlement.js';
import { isEntitlementBlockKey } from '../catalog.js';

describe('paymentCashEntitlement', () => {
  it('exports payment_cash as a live catalog key and reserves payment_card_present in prose only', () => {
    expect(PAYMENT_CASH_BLOCK_KEY).toBe('payment_cash');
    expect(isEntitlementBlockKey(PAYMENT_CASH_BLOCK_KEY)).toBe(true);
    expect(PAYMENT_CARD_PRESENT_RESERVED_KEY).toBe('payment_card_present');
    expect(isEntitlementBlockKey(PAYMENT_CARD_PRESENT_RESERVED_KEY)).toBe(false);
  });

  it('treats ENABLED/ALWAYS_ON as entitled and DISABLED/missing as not', () => {
    expect(isPaymentCashRuntimeModeActive('ENABLED')).toBe(true);
    expect(isPaymentCashRuntimeModeActive('ALWAYS_ON')).toBe(true);
    expect(isPaymentCashRuntimeModeActive('DISABLED')).toBe(false);
    expect(isPaymentCashRuntimeModeActive(undefined)).toBe(false);
    expect(isPaymentCashAxesEntitled({ runtimeMode: 'ENABLED' })).toBe(true);
    expect(isPaymentCashAxesEntitled({ runtimeMode: 'DISABLED' })).toBe(false);
    expect(isPaymentCashAxesEntitled(undefined)).toBe(false);
  });

  it('gates payReady contribution on payment_cash entitlement', () => {
    expect(canCashContributeToPayReady(true)).toBe(true);
    expect(canCashContributeToPayReady(false)).toBe(false);
    expect(isPaymentCashEntitledFromChecker((key) => key === 'payment_cash')).toBe(true);
    expect(isPaymentCashEntitledFromChecker(() => false)).toBe(false);
  });
});
