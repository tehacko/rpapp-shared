import { describe, expect, it } from '@jest/globals';
import {
  buildCheckoutSessionIdempotencyKey,
  buildLinesFingerprint,
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

    expect(base).not.toContain('|r:');
    expect(bumped).toContain('|r:1');
    expect(bumped.startsWith(base.replace('|r:1', ''))).toBe(true);
  });
});
