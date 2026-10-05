import { describe, expect, it } from '@jest/globals';
import { mapRefundCustomerStatus } from '../mapRefundCustomerStatus.js';
import {
  REFUND_CUSTOMER_STATUS_CHIP_CS,
  REFUND_REQUESTED_QUEUE_CHIP_CS,
  REFUND_STAFF_REASON_CHIP_CS,
  refundCustomerStatusChipCs,
} from '../refundContracts.js';

describe('mapRefundCustomerStatus', () => {
  it('SUCCEEDED → returned', () => {
    expect(mapRefundCustomerStatus({ attemptStatus: 'SUCCEEDED' })).toBe('returned');
  });

  it('SUCCEEDED wins over slaBreachedAt (money already returned)', () => {
    expect(
      mapRefundCustomerStatus({
        attemptStatus: 'SUCCEEDED',
        slaBreachedAt: '2026-10-01T00:00:00.000Z',
      }),
    ).toBe('returned');
  });

  it('FAILED | REVERSED | CANCELED → needs_resolution', () => {
    expect(mapRefundCustomerStatus({ attemptStatus: 'FAILED' })).toBe('needs_resolution');
    expect(mapRefundCustomerStatus({ attemptStatus: 'REVERSED' })).toBe('needs_resolution');
    expect(mapRefundCustomerStatus({ attemptStatus: 'CANCELED' })).toBe('needs_resolution');
  });

  it('slaBreachedAt → needs_resolution even when PENDING', () => {
    expect(
      mapRefundCustomerStatus({
        attemptStatus: 'PENDING',
        slaBreachedAt: '2026-10-01T00:00:00.000Z',
      }),
    ).toBe('needs_resolution');
  });

  it('slaBreachedAt → needs_resolution even when REQUIRES_ACTION', () => {
    expect(
      mapRefundCustomerStatus({
        attemptStatus: 'REQUIRES_ACTION',
        slaBreachedAt: '2026-10-01T00:00:00.000Z',
      }),
    ).toBe('needs_resolution');
  });

  it('PENDING with no SLA → processing', () => {
    expect(
      mapRefundCustomerStatus({ attemptStatus: 'PENDING', slaBreachedAt: null }),
    ).toBe('processing');
  });

  it('REQUIRES_ACTION with no SLA → processing', () => {
    expect(mapRefundCustomerStatus({ attemptStatus: 'REQUIRES_ACTION' })).toBe('processing');
  });

  it('REQUESTED + zero attempts → processing, never returned', () => {
    const status = mapRefundCustomerStatus({
      attemptStatus: null,
      slaBreachedAt: null,
      saleRefundStatus: 'REQUESTED',
    });
    expect(status).toBe('processing');
    expect(status).not.toBe('returned');
    expect(refundCustomerStatusChipCs(status, { requestedQueue: true })).toBe(
      REFUND_REQUESTED_QUEUE_CHIP_CS,
    );
    expect(REFUND_CUSTOMER_STATUS_CHIP_CS.returned).toBe('Peníze vráceny');
  });

  it('fail-closed needs_resolution when status is unknown / missing', () => {
    expect(mapRefundCustomerStatus({})).toBe('needs_resolution');
    expect(mapRefundCustomerStatus({ saleRefundStatus: 'NONE' })).toBe('needs_resolution');
    expect(mapRefundCustomerStatus({ saleRefundStatus: 'COMPLETED' })).toBe('needs_resolution');
    expect(mapRefundCustomerStatus({ saleRefundStatus: 'FAILED' })).toBe('needs_resolution');
  });

  it('whitespace slaBreachedAt is not a breach', () => {
    expect(
      mapRefundCustomerStatus({ attemptStatus: 'PENDING', slaBreachedAt: '   ' }),
    ).toBe('processing');
  });

  it('exports HSS §6 staff chips in Czech', () => {
    expect(REFUND_STAFF_REASON_CHIP_CS.CUSTOMER_CANCEL_RETURN).toContain('Zákazník ruší');
    expect(REFUND_STAFF_REASON_CHIP_CS.DISTANCE_WITHDRAWAL).toContain('Odstoupení');
    expect(REFUND_STAFF_REASON_CHIP_CS.OTHER).toBe('Jiné');
  });
});
