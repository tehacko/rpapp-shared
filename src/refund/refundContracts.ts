/**
 * Refunds V1A.6 — shared read contract + staff reason chips (HSS §6 CS).
 *
 * Mirrors CreateRefundAttempt / RefundAttempt fields for admin, pickup, customer,
 * and guest. `businessBasis` is staff-only (omit on customer/guest payloads).
 * `remainingSaleMajor` is required on list rows, optional on single-attempt GET.
 */

/** Attempt rail status — never map REQUIRES_ACTION / REVERSED / CANCELED to SUCCEEDED. */
export const REFUND_ATTEMPT_STATUSES = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REQUIRES_ACTION',
  'REVERSED',
  'CANCELED',
] as const;

export type RefundAttemptStatus = (typeof REFUND_ATTEMPT_STATUSES)[number];

/** Customer-visible chip keys from `mapRefundCustomerStatus`. */
export const REFUND_CUSTOMER_STATUSES = [
  'returned',
  'processing',
  'needs_resolution',
] as const;

export type RefundCustomerStatus = (typeof REFUND_CUSTOMER_STATUSES)[number];

/** Denormalized `Transaction.refundStatus` projection (not raw provider state). */
export const TRANSACTION_REFUND_PROJECTION_STATUSES = [
  'NONE',
  'REQUESTED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;

export type TransactionRefundProjectionStatus =
  (typeof TRANSACTION_REFUND_PROJECTION_STATUSES)[number];

export const REFUND_STAFF_REASONS = [
  'CUSTOMER_CANCEL_RETURN',
  'DISTANCE_WITHDRAWAL',
  'DEFECTIVE_COMPLAINT',
  'MERCHANT_NON_FULFILMENT',
  'PAYMENT_ORDER_CORRECTION',
  'NO_SHOW',
  'GOODWILL',
  'OTHER',
] as const;

export type RefundStaffReason = (typeof REFUND_STAFF_REASONS)[number];

export const REFUND_BUSINESS_BASES = [
  'COMMERCIAL_CANCELLATION',
  'MANDATORY_WITHDRAWAL',
  'COMPLAINT_OUTCOME',
  'MERCHANT_NON_FULFILMENT',
  'PAYMENT_CORRECTION',
  'NO_SHOW_POLICY',
  'DISCRETIONARY_GOODWILL',
  'OTHER',
] as const;

export type RefundBusinessBasis = (typeof REFUND_BUSINESS_BASES)[number];

/** Production write-accepted methods (create / goodwill). Prisma may still store legacy BANK. */
export const REFUND_METHODS = ['ORIGINAL', 'ALTERNATIVE_CASH'] as const;

export type RefundMethod = (typeof REFUND_METHODS)[number];

/**
 * Historical Prisma `RefundAttemptMethod.ALTERNATIVE_BANK` — parse/read only.
 * Not accepted on create / alternative / goodwill write Zod contracts.
 */
export const LEGACY_REFUND_METHODS = ['ALTERNATIVE_BANK'] as const;

export type LegacyRefundMethod = (typeof LEGACY_REFUND_METHODS)[number];

/** Read-wire method: production writes + historical ALTERNATIVE_BANK rows. */
export type RefundReadMethod = RefundMethod | LegacyRefundMethod;

/** HSS §6 staff selector chips (Czech) — locked, not legal labels. */
export const REFUND_STAFF_REASON_CHIP_CS: Readonly<Record<RefundStaffReason, string>> = {
  CUSTOMER_CANCEL_RETURN: 'Zákazník ruší / vrací bez tvrzení o vadě',
  DISTANCE_WITHDRAWAL: 'Odstoupení od online nákupu',
  DEFECTIVE_COMPLAINT: 'Zboží / služba má vadu nebo problém',
  MERCHANT_NON_FULFILMENT: 'Tenant nemůže dodat',
  PAYMENT_ORDER_CORRECTION: 'Chyba platby / ceny / množství',
  NO_SHOW: 'Nevyzvednuto / no-show',
  GOODWILL: 'Goodwill / výjimka',
  OTHER: 'Jiné',
};

/** Customer-facing status chips (Czech). REQUESTED queue uses processing + requested copy. */
export const REFUND_CUSTOMER_STATUS_CHIP_CS: Readonly<Record<RefundCustomerStatus, string>> = {
  returned: 'Peníze vráceny',
  processing: 'Refundace se zpracovává',
  needs_resolution: 'Vyžaduje řešení',
};

export const REFUND_REQUESTED_QUEUE_CHIP_CS = 'Žádost přijata, čeká na zpracování';

export interface RefundReadItemDTO {
  readonly productId: number;
  readonly variantId: number | null;
  readonly quantity: number;
  readonly amountMajor: number;
  readonly productNameSnapshot: string;
}

/**
 * Shared refund attempt read DTO (admin / pickup / customer / guest).
 * Staff-only: `businessBasis`. List rows also set `remainingSaleMajor`.
 */
export interface RefundReadDTO {
  readonly attemptId: string;
  readonly transactionId: number;
  readonly reference: string | null;
  readonly amountMajor: number;
  readonly currency: string;
  readonly staffReason: RefundStaffReason;
  readonly staffReasonChipCs: string;
  readonly businessBasis?: RefundBusinessBasis;
  readonly method: RefundReadMethod;
  /** Null when the wire value is missing or not a locked attempt status. */
  readonly attemptStatus: RefundAttemptStatus | null;
  readonly customerStatus: RefundCustomerStatus;
  readonly slaBreachedAt: string | null;
  readonly items: readonly RefundReadItemDTO[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly remainingSaleMajor?: number;
  /**
   * Customer/guest confirmation PDF when a REFUND_CONFIRMATION doc is ready.
   * Omitted or null for staff list rows and while the document is not ready.
   */
  readonly downloadUrl?: string | null;
}

/** Transaction refund list row — remaining cap is required. */
export interface RefundListReadDTO extends RefundReadDTO {
  readonly remainingSaleMajor: number;
}

/**
 * Customer/guest additive `refunds[]` placeholder when projection is REQUESTED
 * and zero `RefundAttempt` rows exist (AC-24 — never `returned`).
 */
export interface RefundRequestedQueueReadDTO {
  readonly attemptId: null;
  readonly transactionId: number;
  readonly reference: null;
  readonly amountMajor: number | null;
  readonly currency: string;
  readonly staffReason: null;
  readonly staffReasonChipCs: null;
  readonly method: null;
  readonly attemptStatus: null;
  readonly customerStatus: 'processing';
  readonly slaBreachedAt: null;
  readonly items: readonly [];
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
  readonly remainingSaleMajor?: number;
}

export type RefundCustomerFacingReadDTO = RefundReadDTO | RefundRequestedQueueReadDTO;

export function isRefundAttemptStatus(value: unknown): value is RefundAttemptStatus {
  return (
    typeof value === 'string' &&
    (REFUND_ATTEMPT_STATUSES as readonly string[]).includes(value)
  );
}

export function isRefundCustomerStatus(value: unknown): value is RefundCustomerStatus {
  return (
    typeof value === 'string' &&
    (REFUND_CUSTOMER_STATUSES as readonly string[]).includes(value)
  );
}

export function isRefundStaffReason(value: unknown): value is RefundStaffReason {
  return typeof value === 'string' && (REFUND_STAFF_REASONS as readonly string[]).includes(value);
}

export function isRefundBusinessBasis(value: unknown): value is RefundBusinessBasis {
  return (
    typeof value === 'string' && (REFUND_BUSINESS_BASES as readonly string[]).includes(value)
  );
}

export function isRefundMethod(value: unknown): value is RefundMethod {
  return typeof value === 'string' && (REFUND_METHODS as readonly string[]).includes(value);
}

/** Parse-only guard for historical `ALTERNATIVE_BANK` rows — not for create Zod. */
export function isLegacyRefundMethod(value: unknown): value is LegacyRefundMethod {
  return (
    typeof value === 'string' && (LEGACY_REFUND_METHODS as readonly string[]).includes(value)
  );
}

export function isTransactionRefundProjectionStatus(
  value: unknown,
): value is TransactionRefundProjectionStatus {
  return (
    typeof value === 'string' &&
    (TRANSACTION_REFUND_PROJECTION_STATUSES as readonly string[]).includes(value)
  );
}

export function refundStaffReasonChipCs(reason: RefundStaffReason): string {
  return REFUND_STAFF_REASON_CHIP_CS[reason];
}

export function refundCustomerStatusChipCs(
  status: RefundCustomerStatus,
  options?: { readonly requestedQueue?: boolean },
): string {
  if (status === 'processing' && options?.requestedQueue === true) {
    return REFUND_REQUESTED_QUEUE_CHIP_CS;
  }
  return REFUND_CUSTOMER_STATUS_CHIP_CS[status];
}
