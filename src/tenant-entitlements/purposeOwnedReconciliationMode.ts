/**
 * Purpose-wins reconciliation mode helpers (PRODUCT_ONLY ⇒ MODE_1 when strategy allows).
 * Matching/payment_reconciliation Off hides UI only — must not rewrite PRODUCT_ONLY to BANK_FEED.
 */
import type { PaymentReconciliationStrategy } from './types.js';
import type { TenantAllowedPurposes } from './tenantScopeTypes.js';

/** Persisted bank_account reconciliationMode (not strategy MODE_1/MODE_2). */
export type BankReconciliationPersistMode =
  | 'APP_INITIATED_ONLY'
  | 'BANK_FEED_AUTHORITATIVE';

/** Minimal entitlement flags for create-omit resolution (mapped from snapshot at call site). */
export interface PurposeOwnedReconciliationEntitlementFlags {
  readonly paymentReconciliationOn: boolean;
  readonly hasKioskOrCustomerSurface: boolean;
}

export interface ResolvePurposeOwnedReconciliationModeInput {
  readonly purpose: TenantAllowedPurposes | string | null | undefined;
  readonly strategy: PaymentReconciliationStrategy;
}

export interface ResolveOmittedCreateReconciliationModeInput {
  readonly purpose: TenantAllowedPurposes | string | null | undefined;
  readonly strategy: PaymentReconciliationStrategy;
  readonly entitlements: PurposeOwnedReconciliationEntitlementFlags;
}

export interface ProductOnlyMode1CarveOutInput {
  readonly mode: BankReconciliationPersistMode;
  readonly purpose: TenantAllowedPurposes | string | null | undefined;
  readonly strategy: PaymentReconciliationStrategy;
  /** Accepted for assert call-site symmetry; carve-out predicate does not read snapshot. */
  readonly snapshot?: unknown;
}

/** True only for PRODUCT_ONLY (BOTH and DONATION_ONLY excluded). */
export function isProductOnlyPurpose(
  purpose: TenantAllowedPurposes | string | null | undefined
): boolean {
  return purpose === 'PRODUCT_ONLY';
}

/**
 * Purpose-owned default when purpose alone decides the mode.
 * - PRODUCT_ONLY → APP_INITIATED_ONLY when strategy allows MODE_1; else BANK_FEED_AUTHORITATIVE
 * - DONATION_ONLY → BANK_FEED_AUTHORITATIVE
 * - BOTH / unknown → null (caller applies entitlement gates; no auto-MODE_1)
 */
export function resolvePurposeOwnedReconciliationMode(
  input: ResolvePurposeOwnedReconciliationModeInput
): BankReconciliationPersistMode | null {
  const { purpose, strategy } = input;
  if (purpose === 'DONATION_ONLY') {
    return 'BANK_FEED_AUTHORITATIVE';
  }
  if (purpose === 'PRODUCT_ONLY') {
    return strategy.allowedModes.includes('MODE_1')
      ? 'APP_INITIATED_ONLY'
      : 'BANK_FEED_AUTHORITATIVE';
  }
  return null;
}

/**
 * Create-omit default under purpose-wins.
 * PRODUCT_ONLY / DONATION_ONLY use purpose-owned resolution; BOTH uses entitlement gates
 * (recon On + kiosk∨customer + strategy MODE_1) else BANK_FEED.
 */
export function resolveOmittedCreateReconciliationMode(
  input: ResolveOmittedCreateReconciliationModeInput
): BankReconciliationPersistMode {
  const purposeOwned = resolvePurposeOwnedReconciliationMode({
    purpose: input.purpose,
    strategy: input.strategy,
  });
  if (purposeOwned !== null) {
    return purposeOwned;
  }

  const mode1StrategyOk = input.strategy.allowedModes.includes('MODE_1');
  if (
    mode1StrategyOk &&
    input.entitlements.paymentReconciliationOn &&
    input.entitlements.hasKioskOrCustomerSurface
  ) {
    return 'APP_INITIATED_ONLY';
  }
  return 'BANK_FEED_AUTHORITATIVE';
}

/**
 * G2 carve-out: allow persist of APP_INITIATED_ONLY when payment_reconciliation is Off iff
 * mode === APP_INITIATED_ONLY ∧ purpose is PRODUCT_ONLY ∧ strategy allows MODE_1.
 * BOTH / DONATION_ONLY excluded. Surfaces are NOT required for this carve-out.
 */
export function isProductOnlyMode1CarveOutAllowed(
  input: ProductOnlyMode1CarveOutInput
): boolean {
  if (input.mode !== 'APP_INITIATED_ONLY') {
    return false;
  }
  if (!isProductOnlyPurpose(input.purpose)) {
    return false;
  }
  return input.strategy.allowedModes.includes('MODE_1');
}
