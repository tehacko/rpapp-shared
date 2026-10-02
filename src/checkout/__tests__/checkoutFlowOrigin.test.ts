import { describe, expect, it } from '@jest/globals';
import {
  CHECKOUT_FLOW_ORIGIN_SELLER_ASSISTED_KIOSK,
  isApiEntryChannel,
  isCheckoutFlowOrigin,
  isSellerAssistedKioskOrigin,
} from '../checkoutFlowOrigin.js';

describe('checkoutFlowOrigin', () => {
  it('recognizes SELLER_ASSISTED_KIOSK as CheckoutFlowOrigin and ApiEntryChannel', () => {
    expect(isCheckoutFlowOrigin(CHECKOUT_FLOW_ORIGIN_SELLER_ASSISTED_KIOSK)).toBe(true);
    expect(isApiEntryChannel('SELLER_ASSISTED_KIOSK')).toBe(true);
    expect(isSellerAssistedKioskOrigin('SELLER_ASSISTED_KIOSK')).toBe(true);
  });

  it('keeps legacy entry channels valid', () => {
    expect(isApiEntryChannel('KIOSK_QR')).toBe(true);
    expect(isApiEntryChannel('PHONE_FIRST_PWA')).toBe(true);
    expect(isApiEntryChannel('POST_KIOSK_PWA')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isCheckoutFlowOrigin('SELF_SCAN')).toBe(false);
    expect(isApiEntryChannel('DIRECT_LINK')).toBe(false);
    expect(isSellerAssistedKioskOrigin('KIOSK_QR')).toBe(false);
  });
});
