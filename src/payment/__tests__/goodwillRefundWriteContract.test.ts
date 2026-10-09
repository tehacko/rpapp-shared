import {
  buildGoodwillRefundWriteBody,
  parseGoodwillRefundWriteBody,
} from '../goodwillRefundWriteContract.js';

describe('goodwillRefundWriteContract', () => {
  it('serializes transactionId + note without client-authoritative snapshots', () => {
    const body = buildGoodwillRefundWriteBody({
      transactionId: 101,
      note: '  customer request  ',
    });
    expect(body).toEqual({ transactionId: 101, note: 'customer request' });
    expect(parseGoodwillRefundWriteBody(body)).toEqual(body);
  });

  it('rejects productNameSnapshot / businessBasis / salesPointId', () => {
    expect(() =>
      parseGoodwillRefundWriteBody({ transactionId: 1, productNameSnapshot: 'Coffee' }),
    ).toThrow('CLIENT_AUTHORITATIVE_FIELD_FORBIDDEN');
    expect(() => parseGoodwillRefundWriteBody({ transactionId: 1, businessBasis: 'goodwill' })).toThrow(
      'CLIENT_AUTHORITATIVE_FIELD_FORBIDDEN',
    );
    expect(() => parseGoodwillRefundWriteBody({ transactionId: 1, salesPointId: 9 })).toThrow(
      'CLIENT_AUTHORITATIVE_FIELD_FORBIDDEN',
    );
  });

  it('rejects ALTERNATIVE_BANK at the goodwill write contract', () => {
    expect(() =>
      parseGoodwillRefundWriteBody({ transactionId: 1, method: 'ALTERNATIVE_BANK' }),
    ).toThrow('INVALID_GOODWILL_REFUND_BODY');
    expect(() =>
      buildGoodwillRefundWriteBody({ transactionId: 1, method: 'ALTERNATIVE_BANK' }),
    ).toThrow('INVALID_GOODWILL_REFUND_BODY');
  });

  it('accepts ORIGINAL / ALTERNATIVE_CASH on goodwill write contract', () => {
    expect(parseGoodwillRefundWriteBody({ transactionId: 1, method: 'ORIGINAL' })).toEqual({
      transactionId: 1,
      method: 'ORIGINAL',
    });
    expect(parseGoodwillRefundWriteBody({ transactionId: 1, method: 'ALTERNATIVE_CASH' })).toEqual({
      transactionId: 1,
      method: 'ALTERNATIVE_CASH',
    });
  });
});
