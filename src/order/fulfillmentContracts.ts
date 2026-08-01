/**
 * Shared order / fulfillment / payment list contracts.
 *
 * Mirrors backend DTOs in:
 * - `up-backend/src/application/dtos/order/FulfillmentDTOs.ts`
 * - `up-backend/src/application/dtos/order/AdminOrderDTOs.ts`
 * - `up-backend/src/domain/types/OrderFulfillmentTypes.ts`
 * - `up-backend/src/domain/types/ProductCollectionMode.ts`
 *
 * Consumers: admin fulfillment/pending queues, customer order list, kiosk payment create.
 * Keep field names and nullability aligned with the API responses.
 */
import type { CollectTiming } from '../checkout/sessionMetadataV3.js';
import type { ProductCollectionMode, TxPurposeType } from '../types.js';

export type { CollectTiming, ProductCollectionMode };

export const PRODUCT_COLLECTION_MODES = ['PAY_AT_KIOSK', 'PREPAY_COLLECT_LATER'] as const;
export const COLLECT_TIMINGS = ['NOW', 'LATER'] as const;

export type OrderFulfillmentStatus =
  | 'PENDING_PAYMENT'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'CANCELED';

export type PickupScheduleType = 'ASAP' | 'SCHEDULED';

/** Alias used by admin pending-orders screens — same union as ProductCollectionMode. */
export type AdminOrderCollectionMode = ProductCollectionMode;

export function isProductCollectionMode(value: unknown): value is ProductCollectionMode {
  return (
    value === 'PAY_AT_KIOSK' || value === 'PREPAY_COLLECT_LATER'
  );
}

export function isCollectTiming(value: unknown): value is CollectTiming {
  return value === 'NOW' || value === 'LATER';
}

export function normalizeProductCollectionMode(
  value: ProductCollectionMode | null | undefined
): ProductCollectionMode {
  return value ?? 'PAY_AT_KIOSK';
}

/**
 * Admin fulfillment queue row (`GET /api/v1/admin/fulfillments`).
 * `productCollectionMode` / `collectTiming` come from Transaction join (not fulfillment columns).
 */
export interface AdminFulfillmentListItem {
  readonly id: number;
  readonly transactionId: number;
  readonly salesPointId: number;
  readonly pickupPointId: number | null;
  readonly pickupPointName: string | null;
  readonly status: OrderFulfillmentStatus;
  readonly version: number;
  readonly pickupScheduleType: PickupScheduleType;
  readonly promisedPickupAt: string | null;
  readonly pickupWindowEndAt: string | null;
  readonly productCollectionMode: ProductCollectionMode | null;
  readonly collectTiming: CollectTiming | null;
  readonly paymentCompleted: boolean;
  readonly amountMinor: number | null;
  readonly currency: string | null;
  readonly customerEmail: string | null;
  readonly customerPhone: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly requiresPickupCode: boolean;
}

export interface AdminFulfillmentListResponse {
  readonly items: readonly AdminFulfillmentListItem[];
  readonly total: number;
}

/**
 * Admin pending-orders row (`GET /api/v1/admin/orders/pending`).
 * Collection mode only — collectTiming is not on this list DTO today.
 */
export interface AdminPendingOrderItem {
  readonly id: number;
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
  readonly salesPointId: number;
  readonly salesPointName: string | null;
  readonly purposeType: TxPurposeType;
  readonly productCollectionMode: AdminOrderCollectionMode | null;
  readonly variableSymbol: string;
  readonly createdAt: string;
}

export interface AdminPendingOrdersResponse {
  readonly items: readonly AdminPendingOrderItem[];
  readonly total: number;
}

export interface AdminMarkOrderPaidResponse {
  readonly transactionId: number;
  readonly paymentId: string;
  readonly status: 'COMPLETED';
  readonly idempotent: boolean;
}

/**
 * Customer order list row (`GET .../customer-account/orders`).
 * Includes collectTiming + productCollectionMode from Transaction join.
 */
export interface CustomerOrderListItem {
  readonly transactionId: number;
  readonly fulfillmentId: number;
  readonly status: OrderFulfillmentStatus;
  readonly pickupScheduleType: PickupScheduleType;
  readonly promisedPickupAt: string | null;
  readonly productCollectionMode: ProductCollectionMode | null;
  readonly collectTiming: CollectTiming | null;
  readonly pickupHandoffMode: string | null;
  readonly amountMinor: number | null;
  readonly currency: string | null;
  readonly createdAt: string;
  readonly pickupPointName: string | null;
}

export interface CustomerOrderListResponse {
  readonly items: readonly CustomerOrderListItem[];
  readonly total: number;
}
