/**
 * payment_cash entitlement helpers — outer gate for cash payReady / offer / create.
 * Catalog key lives in types/catalog; this module exports check helpers for readiness workers.
 */
import type { EntitlementBlockAxes, EntitlementBlockKey, EntitlementRuntimeMode } from './types.js';

export const PAYMENT_CASH_BLOCK_KEY = 'payment_cash' as const satisfies EntitlementBlockKey;

/**
 * Reserved name for a future Stripe Terminal / card-present channel entitlement.
 * Documented in TENANT_ENTITLEMENTS.md only — must NOT appear in ENTITLEMENT_BLOCK_KEYS / catalog.
 */
export const PAYMENT_CARD_PRESENT_RESERVED_KEY = 'payment_card_present' as const;

export function isPaymentCashRuntimeModeActive(
  runtimeMode: EntitlementRuntimeMode | string | undefined | null,
): boolean {
  return runtimeMode === 'ALWAYS_ON' || runtimeMode === 'ENABLED';
}

/** Fail-closed when axes are missing (absent policy row ⇒ not entitled). */
export function isPaymentCashAxesEntitled(
  axes: Pick<EntitlementBlockAxes, 'runtimeMode'> | undefined | null,
): boolean {
  if (axes == null) {
    return false;
  }
  return isPaymentCashRuntimeModeActive(axes.runtimeMode);
}

export function isPaymentCashEntitledFromChecker(
  isEntitled: (blockKey: EntitlementBlockKey) => boolean,
): boolean {
  return isEntitled(PAYMENT_CASH_BLOCK_KEY);
}

/**
 * When payment_cash is DISABLED (or not entitled), cash must never contribute to payReady.
 * Wire into TenantPaymentReadinessService / publishability (other workers).
 */
export function canCashContributeToPayReady(isPaymentCashEntitled: boolean): boolean {
  return isPaymentCashEntitled;
}
