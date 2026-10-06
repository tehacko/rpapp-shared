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

  it('does not reject ALTERNATIVE_BANK at the write contract (domain 409 owns fail-close)', () => {
    expect(parseGoodwillRefundWriteBody({ transactionId: 1, method: 'ALTERNATIVE_BANK' })).toEqual({
      transactionId: 1,
      method: 'ALTERNATIVE_BANK',
    });
  });
});
