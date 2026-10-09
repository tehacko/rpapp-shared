import { describe, expect, it } from '@jest/globals';
import {
  alternativeRefundBodySchema,
  createRefundAttemptBodySchema,
  serializeAlternativeRefundBody,
  serializeCreateRefundAttemptBody,
} from '../createRefundAttemptBodySchema.js';

describe('createRefundAttemptBodySchema (G19 contract)', () => {
  const base = {
    transactionId: 42,
    amount: 80,
    currency: 'CZK',
    staffReason: 'CUSTOMER_CANCEL_RETURN' as const,
    lines: [{ productId: 7, quantity: 1, amount: 80 }],
  };

  it('happy path: serialize → safeParse succeeds (contract ≠ 400)', () => {
    const body = serializeCreateRefundAttemptBody({
      ...base,
      note: 'ok',
      method: 'ORIGINAL',
      lines: [{ productId: 7, variantId: null, quantity: 1, amount: 80 }],
    });
    const parsed = createRefundAttemptBodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body).not.toHaveProperty('businessBasis');
    expect(JSON.stringify(body)).not.toContain('productNameSnapshot');
  });

  it('rejects businessBasis on create body (strict)', () => {
    const result = createRefundAttemptBodySchema.safeParse({
      ...base,
      businessBasis: 'COMMERCIAL_CANCELLATION',
    });
    expect(result.success).toBe(false);
  });

  it('alternative serialize omits productNameSnapshot (G20)', () => {
    const body = serializeAlternativeRefundBody({
      transactionId: 42,
      amount: 80,
      currency: 'CZK',
      staffReason: 'CUSTOMER_CANCEL_RETURN',
      method: 'ALTERNATIVE_CASH',
      lines: [
        {
          productId: 10,
          variantId: null,
          quantity: 1,
          amount: 80,
          productNameSnapshot: 'Client Snapshot Espresso',
        } as {
          productId: number;
          variantId: number | null;
          quantity: number;
          amount: number;
          productNameSnapshot?: string;
        },
      ],
    });
    expect(JSON.stringify(body)).not.toContain('productNameSnapshot');
    expect(JSON.stringify(body)).not.toContain('Client Snapshot');
    const parsed = alternativeRefundBodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
  });

  it('rejects ALTERNATIVE_BANK on create write schema', () => {
    const result = createRefundAttemptBodySchema.safeParse({
      ...base,
      method: 'ALTERNATIVE_BANK',
    });
    expect(result.success).toBe(false);
  });

  it('rejects ALTERNATIVE_BANK on alternative write schema', () => {
    const result = alternativeRefundBodySchema.safeParse({
      ...base,
      method: 'ALTERNATIVE_BANK',
    });
    expect(result.success).toBe(false);
  });
});
