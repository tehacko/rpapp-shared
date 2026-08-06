import type { TenantAllowedPurposes } from './tenantScopeTypes.js';

/** Per-account purpose picker is only meaningful when tenant allows both products and donations. */
export function isBankAccountPurposeSelectable(tenantAllowedPurposes: TenantAllowedPurposes): boolean {
  return tenantAllowedPurposes === 'BOTH';
}

export function isProductPurposeAllowed(tenantAllowedPurposes: TenantAllowedPurposes): boolean {
  return tenantAllowedPurposes === 'BOTH' || tenantAllowedPurposes === 'PRODUCT_ONLY';
}

export function isDonationPurposeAllowed(tenantAllowedPurposes: TenantAllowedPurposes): boolean {
  return tenantAllowedPurposes === 'BOTH' || tenantAllowedPurposes === 'DONATION_ONLY';
}

/** When tenant is not BOTH, bank must equal tenant; when BOTH, any of the three is OK. */
export function isBankAccountAllowedPurposesCompatible(
  tenantAllowedPurposes: TenantAllowedPurposes,
  bankAllowedPurposes: TenantAllowedPurposes
): boolean {
  if (tenantAllowedPurposes === 'BOTH') return true;
  return bankAllowedPurposes === tenantAllowedPurposes;
}

/**
 * Resolve bank account allowedPurposes for write paths.
 * - tenant !== BOTH → force tenant value (ignore requested mismatch)
 * - tenant === BOTH → use requested if valid, else 'BOTH'
 */
export function resolveBankAccountAllowedPurposes(
  tenantAllowedPurposes: TenantAllowedPurposes,
  requested?: TenantAllowedPurposes | null
): TenantAllowedPurposes {
  if (tenantAllowedPurposes !== 'BOTH') {
    return tenantAllowedPurposes;
  }
  if (requested === 'PRODUCT_ONLY' || requested === 'DONATION_ONLY' || requested === 'BOTH') {
    return requested;
  }
  return 'BOTH';
}

/** Whether mass-sync of all bank accounts to tenant purpose should run (narrowing only). */
export function shouldSyncBankAccountsToTenantAllowedPurposes(
  tenantAllowedPurposes: TenantAllowedPurposes
): boolean {
  return tenantAllowedPurposes !== 'BOTH';
}

/** True when tenant narrow requires clearing tenant-level defaultDonationProjectId. */
export function shouldClearTenantDefaultDonationProjectId(
  tenantAllowedPurposes: TenantAllowedPurposes
): boolean {
  return !isDonationPurposeAllowed(tenantAllowedPurposes);
}

/** Alias clarity: purpose UI (picker OR lock-hint card) only when BOTH. */
export function shouldShowBankAccountPurposeSection(
  tenantAllowedPurposes: TenantAllowedPurposes
): boolean {
  return isBankAccountPurposeSelectable(tenantAllowedPurposes);
}
