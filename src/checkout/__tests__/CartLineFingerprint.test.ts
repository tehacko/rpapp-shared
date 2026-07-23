import { describe, expect, it } from '@jest/globals';
import {
  buildCheckoutSessionIdempotencyKey,
  buildCollectHash,
  buildCustomerIdentityDimension,
  buildLinesFingerprint,
  mapShopCartLinesToFingerprintLines,
} from '../CartLineFingerprint.js';

describe('CartLineFingerprint', () => {
  it('builds stable fingerprint regardless of line order', () => {
    const linesA = [
      { productId: 2, variantId: null, quantity: 1 },
      { productId: 1, variantId: 3, quantity: 2 },
    ];
    const linesB = [
      { productId: 1, variantId: 3, quantity: 2 },
      { productId: 2, variantId: null, quantity: 1 },
    ];

    expect(buildLinesFingerprint(linesA)).toBe(buildLinesFingerprint(linesB));
  });

  it('returns empty marker for no lines', () => {
    expect(buildLinesFingerprint([])).toBe('empty');
  });

  it('builds collect hash with pickup windows and self-collect flag', () => {
    expect(buildCollectHash(null)).toBe('none');
    expect(
      buildCollectHash({
        timing: 'LATER',
        pickupPointId: 9,
        pickup: {
          promisedPickupAt: '2026-01-01T10:00:00.000Z',
          pickupWindowEndAt: '2026-01-01T12:00:00.000Z',
        },
        selfCollectConfirmedAtKiosk: true,
      }),
    ).toBe('LATER:9:2026-01-01T10:00:00.000Z:2026-01-01T12:00:00.000Z:1');
    expect(
      buildCollectHash({
        timing: 'NOW',
        pickupPointId: 1,
      }),
    ).toBe('NOW:1:::0');
  });

  it('maps customer identity dimension', () => {
    expect(buildCustomerIdentityDimension(undefined)).toBe('guest');
    expect(buildCustomerIdentityDimension(null)).toBe('guest');
    expect(buildCustomerIdentityDimension(0)).toBe('guest');
    expect(buildCustomerIdentityDimension(42)).toBe('customer:42');
  });

  it('maps shop cart lines to fingerprint lines', () => {
    expect(
      mapShopCartLinesToFingerprintLines([
        { product: { id: 1 }, variant: { id: 2 }, quantity: 3 },
        { product: { id: 4 }, variant: null, quantity: 1 },
      ]),
    ).toEqual([
      { productId: 1, variantId: 2, quantity: 3 },
      { productId: 4, variantId: null, quantity: 1 },
    ]);
  });

  it('appends revision suffix after idempotency conflict', () => {
    const base = buildCheckoutSessionIdempotencyKey({
      tenantCode: 'acme',
      kioskId: 7,
      purposeType: 'PRODUCT',
      flowType: 'PHONE_FIRST',
      checkoutSubMode: 'PAY_NOW_SELF_SERVICE',
      collect: null,
      lines: [{ productId: 1, variantId: null, quantity: 1 }],
      revision: 0,
    });
    const bumped = buildCheckoutSessionIdempotencyKey({
      tenantCode: 'acme',
      kioskId: 7,
      purposeType: 'PRODUCT',
      flowType: 'PHONE_FIRST',
      checkoutSubMode: 'PAY_NOW_SELF_SERVICE',
      collect: null,
      lines: [{ productId: 1, variantId: null, quantity: 1 }],
      revision: 1,
    });
    const withCustomer = buildCheckoutSessionIdempotencyKey({
      tenantCode: 'acme',
      kioskId: 7,
      purposeType: 'PRODUCT',
      flowType: 'PHONE_FIRST',
      checkoutSubMode: 'PAY_NOW_SELF_SERVICE',
      collect: { timing: 'NOW', pickupPointId: 1 },
      lines: [{ productId: 1, variantId: null, quantity: 1 }],
      customerId: 99,
    });

    expect(base).not.toContain('|r:');
    expect(bumped).toContain('|r:1');
    expect(bumped.startsWith(base.replace('|r:1', ''))).toBe(true);
    expect(withCustomer).toContain('customer:99');
  });
});
