/**
 * Seller-Assisted Retail V1A — shared DTOs (pi-kiosk-shared).
 *
 * Mirrors Self-Scan summary/list patterns for staff + customer read-only review,
 * without reusing Self-Scan types. Amounts are minor units (same as checkout lines).
 */

import type { CheckoutFlowOrigin } from '../checkout/checkoutFlowOrigin.js';

/** Live basket lifecycle — same status set as Self-Scan; separate type. */
export type SellerAssistedBasketStatus =
  | 'ACTIVE'
  | 'PAYMENT_LOCKED'
  | 'PAID'
  | 'ABANDONED'
  | 'ARCHIVED';

export const SELLER_ASSISTED_LIVE_STATUSES: readonly SellerAssistedBasketStatus[] = [
  'ACTIVE',
  'PAYMENT_LOCKED',
] as const;

export const SELLER_ASSISTED_TERMINAL_STATUSES: readonly SellerAssistedBasketStatus[] = [
  'PAID',
  'ABANDONED',
  'ARCHIVED',
] as const;

/**
 * Customer / kiosk read-only display line (gateway phone review + kiosk pre-pay).
 * Plan §2.3: name, qty, unit/line totals.
 */
export interface CheckoutSessionDisplayLine {
  readonly name: string;
  readonly quantity: number;
  /** Unit price in minor units (CheckoutSessionLineDTO.unitPrice convention). */
  readonly unitPrice: number;
  /** Line total in minor units. */
  readonly lineTotal: number;
}

/**
 * Staff / customer-safe basket summary for SA kiosk + handoff review.
 * Optional `lines` when API projects display rows with the summary.
 */
export interface SellerAssistedBasketSummary {
  readonly publicId: string;
  readonly status: SellerAssistedBasketStatus;
  readonly version: number;
  readonly currency: string;
  readonly salesPointId: number;
  readonly tenantId: number;
  readonly lineCount: number;
  readonly totalMinor: number;
  readonly createdByStaffUserId: number;
  readonly customerId: number | null;
  readonly transactionId: number | null;
  readonly customerCheckoutSessionId: number | null;
  readonly updatedAt: string;
  readonly lines?: readonly CheckoutSessionDisplayLine[];
}

/**
 * Session-metadata fields for SA mint (additive on SessionMetadataEnvelopeV5).
 * Prefer these names over ad-hoc metadata keys in clients.
 */
export interface SellerAssistedSessionMetadataFields {
  readonly sellerAssistedBasketPublicId?: string;
  readonly basketVersion?: number;
  readonly checkoutFlowOrigin?: CheckoutFlowOrigin;
}

export function isSellerAssistedBasketStatus(
  value: unknown,
): value is SellerAssistedBasketStatus {
  return (
    value === 'ACTIVE' ||
    value === 'PAYMENT_LOCKED' ||
    value === 'PAID' ||
    value === 'ABANDONED' ||
    value === 'ARCHIVED'
  );
}

export function isSellerAssistedLiveStatus(status: SellerAssistedBasketStatus): boolean {
  return (SELLER_ASSISTED_LIVE_STATUSES as readonly string[]).includes(status);
}
