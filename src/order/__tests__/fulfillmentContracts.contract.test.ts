/**
 * Contract: collectTiming / productCollectionMode / admin list fields are
 * named, exported, and structurally required on shared list DTOs.
 */
import { describe, expect, it } from '@jest/globals';
import {
  COLLECT_TIMINGS,
  PRODUCT_COLLECTION_MODES,
  isCollectTiming,
  isProductCollectionMode,
  normalizeProductCollectionMode,
  type AdminFulfillmentListItem,
  type AdminPendingOrderItem,
  type CollectTiming,
  type CustomerOrderListItem,
  type ProductCollectionMode,
} from '../fulfillmentContracts.js';
import type { CreateQRPaymentResponseData } from '../../types.js';

type AssertNever<T> = [T] extends [never] ? true : false;
type AssertEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

type ExpectedProductCollectionMode = 'PAY_AT_KIOSK' | 'PREPAY_COLLECT_LATER';
type ExpectedCollectTiming = 'NOW' | 'LATER';

const _productCollectionModeParity: AssertEqual<
  ProductCollectionMode,
  ExpectedProductCollectionMode
> = true;
const _collectTimingParity: AssertEqual<CollectTiming, ExpectedCollectTiming> = true;

type AdminListRequiredKeys = 'productCollectionMode' | 'collectTiming';
type AdminListMissing = Exclude<AdminListRequiredKeys, keyof AdminFulfillmentListItem>;
const _adminListHasModeAndTiming: AssertNever<AdminListMissing> = true;

type CustomerListMissing = Exclude<AdminListRequiredKeys, keyof CustomerOrderListItem>;
const _customerListHasModeAndTiming: AssertNever<CustomerListMissing> = true;

type PendingModeMissing = Exclude<'productCollectionMode', keyof AdminPendingOrderItem>;
const _pendingHasCollectionMode: AssertNever<PendingModeMissing> = true;

type QrResponseMode = NonNullable<CreateQRPaymentResponseData['productCollectionMode']>;
const _qrUsesProductCollectionMode: AssertEqual<QrResponseMode, ProductCollectionMode> = true;

describe('fulfillmentContracts contract', () => {
  it('type-level: ProductCollectionMode / CollectTiming match API literals', () => {
    expect(_productCollectionModeParity).toBe(true);
    expect(_collectTimingParity).toBe(true);
  });

  it('type-level: admin + customer list DTOs require productCollectionMode and collectTiming', () => {
    expect(_adminListHasModeAndTiming).toBe(true);
    expect(_customerListHasModeAndTiming).toBe(true);
    expect(_pendingHasCollectionMode).toBe(true);
    expect(_qrUsesProductCollectionMode).toBe(true);
  });

  it('runtime: const arrays and type guards cover both unions', () => {
    expect([...PRODUCT_COLLECTION_MODES]).toEqual(['PAY_AT_KIOSK', 'PREPAY_COLLECT_LATER']);
    expect([...COLLECT_TIMINGS]).toEqual(['NOW', 'LATER']);
    expect(isProductCollectionMode('PAY_AT_KIOSK')).toBe(true);
    expect(isProductCollectionMode('PREPAY_COLLECT_LATER')).toBe(true);
    expect(isProductCollectionMode('OTHER')).toBe(false);
    expect(isCollectTiming('NOW')).toBe(true);
    expect(isCollectTiming('LATER')).toBe(true);
    expect(isCollectTiming('SOON')).toBe(false);
    expect(normalizeProductCollectionMode(null)).toBe('PAY_AT_KIOSK');
    expect(normalizeProductCollectionMode('PREPAY_COLLECT_LATER')).toBe('PREPAY_COLLECT_LATER');
  });

  it('runtime: AdminFulfillmentListItem accepts typed mode + timing fields', () => {
    const row: AdminFulfillmentListItem = {
      id: 1,
      transactionId: 10,
      salesPointId: 2,
      pickupPointId: null,
      pickupPointName: null,
      status: 'PREPARING',
      version: 1,
      pickupScheduleType: 'ASAP',
      promisedPickupAt: null,
      pickupWindowEndAt: null,
      productCollectionMode: 'PAY_AT_KIOSK',
      collectTiming: 'LATER',
      paymentCompleted: true,
      amountMinor: 1000,
      currency: 'CZK',
      customerEmail: null,
      customerPhone: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      requiresPickupCode: false,
    };
    expect(row.productCollectionMode).toBe('PAY_AT_KIOSK');
    expect(row.collectTiming).toBe('LATER');
  });

  it('runtime: CustomerOrderListItem + AdminPendingOrderItem type at call sites', () => {
    const customer: CustomerOrderListItem = {
      transactionId: 1,
      fulfillmentId: 2,
      status: 'READY_FOR_PICKUP',
      pickupScheduleType: 'SCHEDULED',
      promisedPickupAt: null,
      productCollectionMode: 'PREPAY_COLLECT_LATER',
      collectTiming: 'LATER',
      pickupHandoffMode: 'STAFF_SCAN',
      amountMinor: 500,
      currency: 'CZK',
      createdAt: '2026-01-01T00:00:00.000Z',
      pickupPointName: 'Counter',
      tenantId: 7,
    };
    const pending: AdminPendingOrderItem = {
      id: 1,
      paymentId: 'pay_1',
      amount: 50,
      currency: 'CZK',
      salesPointId: 3,
      salesPointName: 'Kiosk A',
      purposeType: 'PRODUCT_PURCHASE',
      productCollectionMode: 'PAY_AT_KIOSK',
      variableSymbol: '123',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(customer.collectTiming).toBe('LATER');
    expect(customer.tenantId).toBe(7);
    expect(pending.productCollectionMode).toBe('PAY_AT_KIOSK');
  });
});
