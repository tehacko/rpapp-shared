import type {
  RefundAttemptStatus,
  RefundCustomerStatus,
  TransactionRefundProjectionStatus,
} from './refundContracts.js';

export interface MapRefundCustomerStatusInput {
  /** Null/undefined when projection REQUESTED and zero attempts (AC-24). */
  readonly attemptStatus?: RefundAttemptStatus | null;
  /** Art.13 SLA stamp — forces needs_resolution even while PENDING/REQUIRES_ACTION. */
  readonly slaBreachedAt?: string | null;
  /** Sale projection; REQUESTED + no attempt must never map to `returned`. */
  readonly saleRefundStatus?: TransactionRefundProjectionStatus | null;
}

function hasSlaBreach(slaBreachedAt: string | null | undefined): boolean {
  return typeof slaBreachedAt === 'string' && slaBreachedAt.trim().length > 0;
}

/**
 * Domain mapper shared by admin, pickup, customer, and guest (V1A.6 vocabulary).
 *
 * 1. SUCCEEDED → returned
 * 2. FAILED | REVERSED | CANCELED → needs_resolution
 * 3. slaBreachedAt set → needs_resolution (even PENDING / REQUIRES_ACTION)
 * 4. PENDING | REQUIRES_ACTION and no SLA → processing
 * 5. REQUESTED + zero attempts → processing (žádost přijata — never returned)
 * 6. else fail-closed needs_resolution (never returned)
 */
export function mapRefundCustomerStatus(
  input: MapRefundCustomerStatusInput,
): RefundCustomerStatus {
  const attemptStatus = input.attemptStatus ?? null;

  if (attemptStatus === 'SUCCEEDED') {
    return 'returned';
  }

  if (
    attemptStatus === 'FAILED' ||
    attemptStatus === 'REVERSED' ||
    attemptStatus === 'CANCELED'
  ) {
    return 'needs_resolution';
  }

  if (hasSlaBreach(input.slaBreachedAt)) {
    return 'needs_resolution';
  }

  if (attemptStatus === 'PENDING' || attemptStatus === 'REQUIRES_ACTION') {
    return 'processing';
  }

  if (attemptStatus === null && input.saleRefundStatus === 'REQUESTED') {
    return 'processing';
  }

  if (attemptStatus === null && input.saleRefundStatus === 'PROCESSING') {
    return 'processing';
  }

  return 'needs_resolution';
}
