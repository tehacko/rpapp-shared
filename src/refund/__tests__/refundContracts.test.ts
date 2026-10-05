import { describe, expect, it } from '@jest/globals';
import {
  isRefundAttemptStatus,
  isRefundBusinessBasis,
  isRefundCustomerStatus,
  isRefundMethod,
  isRefundStaffReason,
  isTransactionRefundProjectionStatus,
  refundStaffReasonChipCs,
} from '../refundContracts.js';

describe('refundContracts guards', () => {
  it('accepts locked vocab unions', () => {
    expect(isRefundAttemptStatus('REQUIRES_ACTION')).toBe(true);
    expect(isRefundCustomerStatus('needs_resolution')).toBe(true);
    expect(isRefundStaffReason('DISTANCE_WITHDRAWAL')).toBe(true);
    expect(isRefundBusinessBasis('MANDATORY_WITHDRAWAL')).toBe(true);
    expect(isRefundMethod('ALTERNATIVE_BANK')).toBe(true);
    expect(isTransactionRefundProjectionStatus('REQUESTED')).toBe(true);
  });

  it('rejects unknown tokens', () => {
    expect(isRefundAttemptStatus('COMPLETED')).toBe(false);
    expect(isRefundCustomerStatus('vráceno')).toBe(false);
    expect(isRefundStaffReason('CANCEL')).toBe(false);
    expect(isRefundBusinessBasis('GOODWILL')).toBe(false);
    expect(isRefundMethod('CARD')).toBe(false);
    expect(isTransactionRefundProjectionStatus('SUCCEEDED')).toBe(false);
  });

  it('staff chip helper matches map', () => {
    expect(refundStaffReasonChipCs('NO_SHOW')).toBe('Nevyzvednuto / no-show');
  });
});
