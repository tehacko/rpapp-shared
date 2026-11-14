/**
 * V1A DELTA 01 — payment status dual contracts (F10-04 / R15·R18).
 *
 * Two **separate** wire shapes:
 * - **Contract-Public** (`PublicCustomerPaymentStatus`) — Route-1/2 customer
 *   payment status (+ lean public analogues). Flat allowlist only.
 * - **Contract-Kiosk** (`KioskPaymentStatusResponseDTO`) — Route-3
 *   `GET /api/payments/check-status/:paymentId` device-bound rich body ONLY.
 *
 * **D-023:** Removing `receiptRecovery` / receipt URLs / PII / nested oracles
 * from the public status wire is a controlled breaking change. Do **not** keep
 * a parallel legacy public write-path for compatibility. Rollback = revert the
 * atomic W1+W5 cutover PR. See
 * `up-backend/docs/CUSTOMER/D-023_PUBLIC_PAYMENT_STATUS_CUTOVER.md`.
 *
 * Mirrors backend:
 * - Public: `GetCustomerPaymentStatusUseCase` result (post-strip)
 * - Kiosk: `PaymentStatusResponseDTO` in `TransactionDTOs.ts` (device-bound)
 */

import type { TransactionStatus } from '../types.js';

// ---------------------------------------------------------------------------
// Contract-Public — receipt document readiness (no URLs)
// ---------------------------------------------------------------------------

/**
 * Public readiness chip for delayed-receipt UX (preparing / retry).
 * Same literals as backend `ReceiptStatus` / `mapTransactionToReceiptMetadata`.
 * Never alone authorize minting viewUrl/downloadUrl — proof-gated recovery owns URLs.
 */
export const RECEIPT_DOCUMENT_STATUSES = ['none', 'pending', 'ready', 'failed'] as const;

export type ReceiptDocumentStatus = (typeof RECEIPT_DOCUMENT_STATUSES)[number];

export function isReceiptDocumentStatus(value: unknown): value is ReceiptDocumentStatus {
  return (
    typeof value === 'string' &&
    (RECEIPT_DOCUMENT_STATUSES as readonly string[]).includes(value)
  );
}

/** Public poll status literals (customer Route-1/2 wire). */
export const PUBLIC_CUSTOMER_PAYMENT_STATUSES = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
] as const;

export type PublicCustomerPaymentWireStatus =
  (typeof PUBLIC_CUSTOMER_PAYMENT_STATUSES)[number];

export function isPublicCustomerPaymentWireStatus(
  value: unknown
): value is PublicCustomerPaymentWireStatus {
  return (
    typeof value === 'string' &&
    (PUBLIC_CUSTOMER_PAYMENT_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Contract-Public KEEP allowlist (W1.2) — exact field names on the public status body.
 * Runtime helpers + type-level exhaustiveness use this list.
 */
export const PUBLIC_CUSTOMER_PAYMENT_STATUS_KEEP_KEYS = [
  'paymentId',
  'status',
  'completedAt',
  'amountMinor',
  'currency',
  'qrVisible',
  'refundEligible',
  'checkoutSessionPublicId',
  'receiptDocumentStatus',
  'awaitingCashConfirmation',
  'transactionId',
  'variableSymbol',
] as const;

export type PublicCustomerPaymentStatusKeepKey =
  (typeof PUBLIC_CUSTOMER_PAYMENT_STATUS_KEEP_KEYS)[number];

/**
 * Explicit DENY keys that previously leaked on public status (must never reappear).
 * Includes Stage-5 `receiptRecovery` / URLs and nested oracle fields.
 */
export const PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS = [
  'receiptRecovery',
  'viewUrl',
  'downloadUrl',
  'guestAccessCode',
  'qrCodeData',
  'customerEmail',
  'orderReference',
  'allocatedOrderDisplayNumber',
  'transaction',
  'product',
  'customer',
  'items',
  'receiptSnapshotJson',
  'success',
] as const;

export type PublicCustomerPaymentStatusDenyKey =
  (typeof PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS)[number];

/**
 * Contract-Public flat status body (Route-1/2).
 *
 * - `transactionId` — signed-in account confirmation nav only (never Order #).
 * - `variableSymbol` — sole public display order label when present.
 * - `receiptDocumentStatus` — preparing UX; never alone for receipt URLs.
 * - **No** `receiptRecovery` / viewUrl / downloadUrl / nested transaction.
 */
export interface PublicCustomerPaymentStatus {
  paymentId: string;
  status: PublicCustomerPaymentWireStatus;
  completedAt: string | null;
  /** Present when amount is known for the payment/session. */
  amountMinor?: number;
  /** ISO 4217 when stamped. */
  currency?: string;
  qrVisible?: boolean;
  /** True when customer may submit refund-request. */
  refundEligible?: boolean;
  checkoutSessionPublicId?: string;
  /**
   * Receipt document readiness for delayed-receipt poll UX.
   * Proof-gated recovery (Wave 2) mints URLs — not this field alone.
   */
  receiptDocumentStatus?: ReceiptDocumentStatus;
  /** True while staff has not yet confirmed cash receipt. */
  awaitingCashConfirmation?: boolean;
  /** Linked sale/order id for signed-in nav only — never render as Order #. */
  transactionId?: number | null;
  /** Bank-rail VS — sole public Order # / display label when present. */
  variableSymbol?: string | null;
}

/** Alias matching backend/FE `*DTO` naming. */
export type PublicCustomerPaymentStatusDTO = PublicCustomerPaymentStatus;

/**
 * Type-level: every KEEP key is a property of `PublicCustomerPaymentStatus`.
 * (Optional fields still count as keys on the interface.)
 */
type PublicKeepKeyCoverage = Exclude<
  PublicCustomerPaymentStatusKeepKey,
  keyof PublicCustomerPaymentStatus
>;
type AssertPublicKeepCovered = PublicKeepKeyCoverage extends never ? true : never;
const _assertPublicKeepCovered: AssertPublicKeepCovered = true;
void _assertPublicKeepCovered;

/**
 * Type-level: no DENY key may be a declared property of the public interface.
 */
type PublicDenyLeak = Extract<
  PublicCustomerPaymentStatusDenyKey,
  keyof PublicCustomerPaymentStatus
>;
type AssertPublicNoDenyKeys = PublicDenyLeak extends never ? true : never;
const _assertPublicNoDenyKeys: AssertPublicNoDenyKeys = true;
void _assertPublicNoDenyKeys;

/** Strip unknown keys to the Contract-Public allowlist (defensive client/mapper). */
export function pickPublicCustomerPaymentStatus(
  input: Record<string, unknown>
): Partial<PublicCustomerPaymentStatus> {
  const out: Partial<PublicCustomerPaymentStatus> = {};
  for (const key of PUBLIC_CUSTOMER_PAYMENT_STATUS_KEEP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      (out as Record<string, unknown>)[key] = input[key];
    }
  }
  return out;
}

export function publicCustomerPaymentStatusHasDeniedKey(
  input: Record<string, unknown>
): PublicCustomerPaymentStatusDenyKey | null {
  for (const key of PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      return key;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Contract-Kiosk — device-bound rich Route-3 ONLY (separate from public)
// ---------------------------------------------------------------------------

/** Nested product slice on kiosk payment status (KEEP). */
export interface KioskProductPaymentStatusDTO {
  id: number;
  name: string;
  price: number;
}

/**
 * Nested customer slice — **email SSOT** for status wire lives here only.
 * Top-level `customerEmail` alias is DENY on Contract-Kiosk.
 */
export interface KioskCustomerPaymentStatusDTO {
  id: number;
  email: string | null;
  phone: string | null;
  name: string | null;
}

/**
 * Top-level `items[]` line SSOT (TransactionItemDTO KEEP matrix).
 * Nested `transaction.items` is DENY — lines live here only.
 */
export interface KioskPaymentStatusItemDTO {
  id: number;
  transactionId: number;
  /** Null for donation synthetic seal lines. */
  productId: number | null;
  variantId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productNameSnapshot?: string | null;
  unitAmountSnapshot?: number;
  lineAmountSnapshot?: number;
  product?: KioskProductPaymentStatusDTO;
}

/**
 * Nested `transaction` on Route-3 status (KEEP matrix).
 * Omits `qrCodeData` (mint owns QR) and nested `items` (top-level items SSOT).
 */
export interface KioskPaymentStatusTransactionDTO {
  id: number;
  salesPointId: number;
  customerId: number | null;
  productId: number | null;
  requestedAt: string;
  completedAt: string | null;
  status: TransactionStatus;
  amount: number;
  paymentId: string | null;
  receiptType: string;
  bankTransferTransactionId: string | null;
  gatewayProviderReferenceId: string | null;
  variableSymbol: string | null;
  bankCheckCount: number;
  lastBankCheckAt: string | null;
  commerceOrderId: string | null;
  canonicalRole: 'sale' | 'payment_attempt';
}

/**
 * Contract-Kiosk rich status body (Route-3 device-bound).
 *
 * Anonymous rich = FORBIDDEN (generic 404). Do **not** reuse this shape for
 * Route-1/2 public status. DENY on this wire: top-level `customerEmail`,
 * `guestAccessCode`, `viewUrl` / `downloadUrl` / `receiptRecovery`,
 * status-wire `currency`, lean Route-3 substitute.
 *
 * G9 / KEEP·DENY: FE poll/scrub must read `customer.email` only — never a
 * top-level `customerEmail` alias — and must never log `fullResponse` that
 * could reintroduce DENY keys (guestAccessCode / receipt URLs).
 */
export interface KioskPaymentStatusResponseDTO {
  success: boolean;
  status: TransactionStatus;
  transaction: KioskPaymentStatusTransactionDTO;
  product?: KioskProductPaymentStatusDTO;
  customer?: KioskCustomerPaymentStatusDTO;
  items?: KioskPaymentStatusItemDTO[];
  /** Frozen receipt snapshot when a sale document exists (kiosk print). */
  receiptSnapshotJson?: unknown;
}

/**
 * Alias aligned with backend application DTO name
 * (`up-backend/.../TransactionDTOs.ts` `PaymentStatusResponseDTO`).
 */
export type PaymentStatusResponseDTO = KioskPaymentStatusResponseDTO;

/** Keys that must never appear on Contract-Kiosk top-level status wire. */
export const KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS = [
  'customerEmail',
  'guestAccessCode',
  'viewUrl',
  'downloadUrl',
  'receiptRecovery',
  'currency',
  'amountMinor',
  'receiptDocumentStatus',
] as const;

export type KioskPaymentStatusTopLevelDenyKey =
  (typeof KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS)[number];

type KioskDenyLeak = Extract<
  KioskPaymentStatusTopLevelDenyKey,
  keyof KioskPaymentStatusResponseDTO
>;
type AssertKioskNoDenyKeys = KioskDenyLeak extends never ? true : never;
const _assertKioskNoDenyKeys: AssertKioskNoDenyKeys = true;
void _assertKioskNoDenyKeys;

/** Nested transaction must not declare DENY fields `qrCodeData` / `items`. */
type KioskTxnForbidden = Extract<
  'qrCodeData' | 'items',
  keyof KioskPaymentStatusTransactionDTO
>;
type AssertKioskTxnClean = KioskTxnForbidden extends never ? true : never;
const _assertKioskTxnClean: AssertKioskTxnClean = true;
void _assertKioskTxnClean;