import type { RefundAttemptStatus } from './refundContracts.js';

/** Spec §8 Layer B — staff settlement disclosure (≠ Layer A slot-profile labels). */
export const REFUND_SETTLEMENT_LAYER_B_CS = {
  attempt_created: 'pokus založen',
  payment_waiting: 'platba čeká',
  result_unknown: 'výsledek neznámý',
  money_paid_out: 'peníze skutečně vyplaceny',
} as const;

export type RefundSettlementLayerBKey = keyof typeof REFUND_SETTLEMENT_LAYER_B_CS;

/** Provider codes that mean outcome is unknown / recon-required (Layer B → result_unknown). */
export const PROVIDER_RESULT_UNKNOWN_CODE = 'PROVIDER_RESULT_UNKNOWN';
export const RECONCILIATION_REQUIRED_CODE = 'RECONCILIATION_REQUIRED';

/**
 * UNKNOWN-class provider failure / recon unknown — staff should pass
 * `providerOutcomeUnknown: true` into Layer B so UI shows „výsledek neznámý“.
 */
export function isRefundProviderOutcomeUnknown(
  providerFailureCode: string | null | undefined,
): boolean {
  const normalized = (providerFailureCode ?? '').trim().toUpperCase();
  return (
    normalized === PROVIDER_RESULT_UNKNOWN_CODE ||
    normalized === RECONCILIATION_REQUIRED_CODE
  );
}

export interface MapRefundSettlementLayerBOptions {
  readonly cashHandoffSettled?: boolean;
  readonly providerOutcomeUnknown?: boolean;
  /**
   * Open cash / ALTERNATIVE_CASH handoff await (`isCashRefundHandoffEligible`) —
   * Layer B shows platba čeká even when attemptStatus is still PENDING.
   */
  readonly cashHandoffEligible?: boolean;
}

/**
 * Map attempt status → Layer B four-state key (Spec §8).
 * PENDING = pokus založen; REQUIRES_ACTION = platba čeká;
 * SUCCEEDED = vyplaceny; FAILED/REVERSED/CANCELED = výsledek neznámý;
 * providerOutcomeUnknown → výsledek neznámý; handoff-eligible open cash → platba čeká.
 */
export function mapRefundSettlementLayerBKey(
  attemptStatus: RefundAttemptStatus | string | null | undefined,
  options?: MapRefundSettlementLayerBOptions,
): RefundSettlementLayerBKey {
  // Handoff-confirm → Settle is the only cash path into money_paid_out (Wave 3/5).
  if (options?.cashHandoffSettled === true || attemptStatus === 'SUCCEEDED') {
    return 'money_paid_out';
  }
  if (options?.providerOutcomeUnknown === true) {
    return 'result_unknown';
  }
  // Handoff-eligible open cash / ALTERNATIVE_CASH (e.g. PENDING) = platba čeká.
  if (options?.cashHandoffEligible === true) {
    return 'payment_waiting';
  }
  if (attemptStatus === 'PENDING') {
    return 'attempt_created';
  }
  if (attemptStatus === 'REQUIRES_ACTION') {
    return 'payment_waiting';
  }
  if (
    attemptStatus === 'FAILED' ||
    attemptStatus === 'REVERSED' ||
    attemptStatus === 'CANCELED'
  ) {
    return 'result_unknown';
  }
  return 'result_unknown';
}

export function mapRefundSettlementLayerBCs(
  attemptStatus: RefundAttemptStatus | string | null | undefined,
  options?: MapRefundSettlementLayerBOptions,
): string {
  return REFUND_SETTLEMENT_LAYER_B_CS[mapRefundSettlementLayerBKey(attemptStatus, options)];
}

export const CASH_HANDOFF_REQUIRED_CODE = 'CASH_HANDOFF_REQUIRED';

/** Staff CTA: open cash / ALTERNATIVE_CASH attempt awaiting handoff confirm. */
export function isCashRefundHandoffEligible(input: {
  readonly method: string | null | undefined;
  readonly attemptStatus: string | null | undefined;
  readonly providerFailureCode?: string | null;
}): boolean {
  const open =
    input.attemptStatus === 'PENDING' || input.attemptStatus === 'REQUIRES_ACTION';
  if (!open) {
    return false;
  }
  if (input.method === 'ALTERNATIVE_CASH') {
    return true;
  }
  if (
    input.method === 'ORIGINAL' &&
    input.providerFailureCode === CASH_HANDOFF_REQUIRED_CODE
  ) {
    return true;
  }
  return false;
}
