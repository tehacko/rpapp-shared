/**
 * Contract: PublicCustomerPaymentStatus vs KioskPaymentStatusResponseDTO stay
 * separate; public allowlist includes receiptDocumentStatus + transactionId +
 * variableSymbol and never declares receiptRecovery.
 */
import { describe, expect, it } from '@jest/globals';
import {
  KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS,
  PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS,
  PUBLIC_CUSTOMER_PAYMENT_STATUS_KEEP_KEYS,
  PUBLIC_CUSTOMER_PAYMENT_STATUSES,
  RECEIPT_DOCUMENT_STATUSES,
  isPublicCustomerPaymentWireStatus,
  isReceiptDocumentStatus,
  pickPublicCustomerPaymentStatus,
  publicCustomerPaymentStatusHasDeniedKey,
  type KioskPaymentStatusResponseDTO,
  type PublicCustomerPaymentStatus,
  type PublicCustomerPaymentStatusDenyKey,
  type PublicCustomerPaymentStatusKeepKey,
} from '../paymentStatusContracts.js';

type AssertNever<T> = [T] extends [never] ? true : false;
type AssertEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

type ExpectedKeep = [
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
];

const _keepParity: AssertEqual<
  PublicCustomerPaymentStatusKeepKey,
  ExpectedKeep[number]
> = true;

type PublicKeys = keyof PublicCustomerPaymentStatus;
type KeepMissingOnInterface = Exclude<PublicCustomerPaymentStatusKeepKey, PublicKeys>;
const _keepCovered: AssertNever<KeepMissingOnInterface> = true;

type DenyOnPublic = Extract<PublicCustomerPaymentStatusDenyKey, PublicKeys>;
const _noDenyOnPublic: AssertNever<DenyOnPublic> = true;

type ReceiptRecoveryOnPublic = 'receiptRecovery' extends keyof PublicCustomerPaymentStatus
  ? true
  : false;
const _noReceiptRecovery: AssertEqual<ReceiptRecoveryOnPublic, false> = true;

type PublicVsKioskOverlapForbidden = Extract<
  keyof PublicCustomerPaymentStatus,
  'success' | 'transaction' | 'items' | 'receiptSnapshotJson'
>;
const _publicNotRich: AssertNever<PublicVsKioskOverlapForbidden> = true;

type KioskHasTransaction = 'transaction' extends keyof KioskPaymentStatusResponseDTO
  ? true
  : false;
const _kioskRich: AssertEqual<KioskHasTransaction, true> = true;

describe('paymentStatusContracts contract', () => {
  it('type-level: KEEP keys match W1.2 allowlist and cover the public interface', () => {
    expect(_keepParity).toBe(true);
    expect(_keepCovered).toBe(true);
    expect(_noDenyOnPublic).toBe(true);
    expect(_noReceiptRecovery).toBe(true);
    expect(_publicNotRich).toBe(true);
    expect(_kioskRich).toBe(true);
  });

  it('runtime: KEEP includes receiptDocumentStatus, transactionId, variableSymbol', () => {
    expect([...PUBLIC_CUSTOMER_PAYMENT_STATUS_KEEP_KEYS]).toEqual([
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
    ]);
    expect(PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS).toContain('receiptRecovery');
    expect(PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS).toContain('viewUrl');
    expect(PUBLIC_CUSTOMER_PAYMENT_STATUS_DENY_KEYS).toContain('orderReference');
  });

  it('runtime: receiptDocumentStatus + wire status guards', () => {
    expect([...RECEIPT_DOCUMENT_STATUSES]).toEqual(['none', 'pending', 'ready', 'failed']);
    expect(isReceiptDocumentStatus('ready')).toBe(true);
    expect(isReceiptDocumentStatus('url')).toBe(false);
    expect([...PUBLIC_CUSTOMER_PAYMENT_STATUSES]).toContain('COMPLETED');
    expect(isPublicCustomerPaymentWireStatus('PENDING')).toBe(true);
    expect(isPublicCustomerPaymentWireStatus('INITIATED')).toBe(false);
  });

  it('runtime: pick allowlist strips receiptRecovery and nested oracles', () => {
    const picked = pickPublicCustomerPaymentStatus({
      paymentId: 'pay-1',
      status: 'COMPLETED',
      completedAt: '2026-01-01T00:00:00.000Z',
      amountMinor: 100,
      currency: 'CZK',
      receiptDocumentStatus: 'pending',
      transactionId: 42,
      variableSymbol: '1234567890',
      receiptRecovery: { viewUrl: 'https://evil.example/r' },
      orderReference: 'OR-1',
      customerEmail: 'x@y.z',
      transaction: { id: 1 },
    });
    expect(picked).toEqual({
      paymentId: 'pay-1',
      status: 'COMPLETED',
      completedAt: '2026-01-01T00:00:00.000Z',
      amountMinor: 100,
      currency: 'CZK',
      receiptDocumentStatus: 'pending',
      transactionId: 42,
      variableSymbol: '1234567890',
    });
    expect(picked).not.toHaveProperty('receiptRecovery');
    expect(
      publicCustomerPaymentStatusHasDeniedKey({
        paymentId: 'pay-1',
        receiptRecovery: { viewUrl: 'x' },
      })
    ).toBe('receiptRecovery');
  });

  it('runtime: kiosk top-level deny list stays disjoint from public lean fields reused as DENY', () => {
    expect(KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS).toContain('customerEmail');
    expect(KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS).toContain('receiptRecovery');
    expect(KIOSK_PAYMENT_STATUS_TOP_LEVEL_DENY_KEYS).toContain('receiptDocumentStatus');
  });

  it('runtime: PublicCustomerPaymentStatus accepts allowlisted shape only', () => {
    const publicStatus: PublicCustomerPaymentStatus = {
      paymentId: 'pay-2',
      status: 'COMPLETED',
      completedAt: null,
      amountMinor: 2500,
      currency: 'CZK',
      qrVisible: false,
      refundEligible: true,
      checkoutSessionPublicId: 'cs_pub',
      receiptDocumentStatus: 'ready',
      awaitingCashConfirmation: false,
      transactionId: 9,
      variableSymbol: '998877',
    };
    expect(publicStatus.receiptDocumentStatus).toBe('ready');
    expect(publicStatus.variableSymbol).toBe('998877');

    const kiosk: KioskPaymentStatusResponseDTO = {
      success: true,
      status: 'COMPLETED' as KioskPaymentStatusResponseDTO['status'],
      transaction: {
        id: 1,
        salesPointId: 2,
        customerId: null,
        productId: null,
        requestedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:01:00.000Z',
        status: 'COMPLETED' as KioskPaymentStatusResponseDTO['status'],
        amount: 25,
        paymentId: 'pay-2',
        receiptType: 'PLAIN',
        bankTransferTransactionId: null,
        gatewayProviderReferenceId: null,
        variableSymbol: '998877',
        bankCheckCount: 0,
        lastBankCheckAt: null,
        commerceOrderId: null,
        canonicalRole: 'sale',
      },
      customer: { id: 3, email: 'a@b.c', phone: null, name: null },
      items: [],
    };
    expect(kiosk.success).toBe(true);
    expect(kiosk.customer?.email).toBe('a@b.c');
  });
});