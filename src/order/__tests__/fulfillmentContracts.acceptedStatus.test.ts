/**
 * P1 / Q3 Spec-override: ACCEPTED is the only paid-not-preparing status.
 * PAID_QUEUED must never appear as OrderFulfillmentStatus.
 */
import { describe, expect, it } from '@jest/globals';
import {
  ORDER_FULFILLMENT_STATUSES,
  isOrderFulfillmentStatus,
  type AdminFulfillmentListItem,
  type CustomerOrderListItem,
  type OrderFulfillmentStatus,
} from '../fulfillmentContracts.js';

type AssertNever<T> = [T] extends [never] ? true : false;
type AssertEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

type ExpectedStatuses =
  | 'PENDING_PAYMENT'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'CANCELED'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED';

const _statusParity: AssertEqual<OrderFulfillmentStatus, ExpectedStatuses> = true;

type PaidQueuedForbidden = 'PAID_QUEUED' extends OrderFulfillmentStatus ? true : false;
const _paidQueuedNotInUnion: AssertEqual<PaidQueuedForbidden, false> = true;

type StatusOnAdmin = AdminFulfillmentListItem['status'];
type StatusOnCustomer = CustomerOrderListItem['status'];
const _adminUsesOrderStatus: AssertEqual<StatusOnAdmin, OrderFulfillmentStatus> = true;
const _customerUsesOrderStatus: AssertEqual<StatusOnCustomer, OrderFulfillmentStatus> = true;

describe('fulfillmentContracts ACCEPTED status (P1 / Q3)', () => {
  it('type-level: OrderFulfillmentStatus includes ACCEPTED and excludes PAID_QUEUED', () => {
    expect(_statusParity).toBe(true);
    expect(_paidQueuedNotInUnion).toBe(true);
    expect(_adminUsesOrderStatus).toBe(true);
    expect(_customerUsesOrderStatus).toBe(true);
  });

  it('runtime: ORDER_FULFILLMENT_STATUSES lists ACCEPTED after PENDING_PAYMENT', () => {
    expect([...ORDER_FULFILLMENT_STATUSES]).toEqual([
      'PENDING_PAYMENT',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'COLLECTED',
      'CANCELED',
      'READY_TO_SHIP',
      'SHIPPED',
      'DELIVERED',
    ]);
    expect(ORDER_FULFILLMENT_STATUSES).toContain('ACCEPTED');
    expect(ORDER_FULFILLMENT_STATUSES as readonly string[]).not.toContain('PAID_QUEUED');
  });

  it('runtime: isOrderFulfillmentStatus accepts ACCEPTED and rejects PAID_QUEUED', () => {
    expect(isOrderFulfillmentStatus('ACCEPTED')).toBe(true);
    expect(isOrderFulfillmentStatus('PREPARING')).toBe(true);
    expect(isOrderFulfillmentStatus('PAID_QUEUED')).toBe(false);
    expect(isOrderFulfillmentStatus('accepted')).toBe(false);
    expect(isOrderFulfillmentStatus(null)).toBe(false);
  });

  it('runtime: list DTO status fields accept ACCEPTED', () => {
    const status: OrderFulfillmentStatus = 'ACCEPTED';
    const admin: Pick<AdminFulfillmentListItem, 'status'> = { status };
    const customer: Pick<CustomerOrderListItem, 'status'> = { status };
    expect(admin.status).toBe('ACCEPTED');
    expect(customer.status).toBe('ACCEPTED');
    // Exhaustiveness helper — every const status is assignable
    const all: OrderFulfillmentStatus[] = [...ORDER_FULFILLMENT_STATUSES];
    expect(all).toHaveLength(6);
    void (null as unknown as AssertNever<Exclude<ExpectedStatuses, (typeof all)[number]>>);
  });
});
