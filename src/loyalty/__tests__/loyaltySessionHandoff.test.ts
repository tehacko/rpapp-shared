import { describe, expect, it, beforeEach } from '@jest/globals';
import {
  clearLoyaltyActivatedCouponHandoff,
  loyaltyActivatedCouponStorageKey,
} from '../loyaltySessionHandoff.js';

const sessionStore = new Map<string, string>();

function installSessionStorageMock(): void {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: {
      getItem: (key: string) => sessionStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        sessionStore.set(key, value);
      },
      removeItem: (key: string) => {
        sessionStore.delete(key);
      },
      clear: () => {
        sessionStore.clear();
      },
    },
    configurable: true,
  });
}

describe('loyaltyActivatedCouponStorageKey', () => {
  it('builds tenant and session scoped key', () => {
    expect(loyaltyActivatedCouponStorageKey('default', 'sess-1')).toBe(
      'loyalty:activatedCoupon:default:sess-1'
    );
  });
});

describe('clearLoyaltyActivatedCouponHandoff', () => {
  beforeEach(() => {
    sessionStore.clear();
    installSessionStorageMock();
  });

  it('removes the handoff key for tenant and session', () => {
    const key = loyaltyActivatedCouponStorageKey('default', 'sess-1');
    sessionStorage.setItem(key, 'coupon-abc');
    clearLoyaltyActivatedCouponHandoff('default', 'sess-1');
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('does not throw when the key is absent', () => {
    expect(() => clearLoyaltyActivatedCouponHandoff('default', 'missing')).not.toThrow();
  });
});
