/**
 * Per-SP commerce flags for Seller-Assisted + CUSTOMER_FACING cash attestation.
 * Fail closed (default false) — independent of pickup `staffSellingEnabled` (G4).
 */

function readCommerceFlag(commerceConfigJson: unknown, key: string): boolean {
  if (commerceConfigJson === null || commerceConfigJson === undefined) {
    return false;
  }
  if (typeof commerceConfigJson !== 'object') {
    return false;
  }
  const record = commerceConfigJson as Record<string, unknown>;
  return record[key] === true;
}

/** `commerceConfigJson.kioskSellerAssistedEnabled === true` only. */
export function resolveKioskSellerAssistedEnabledFromCommerceConfig(
  commerceConfigJson: unknown,
): boolean {
  return readCommerceFlag(commerceConfigJson, 'kioskSellerAssistedEnabled');
}

/** `commerceConfigJson.customerFacingCashAttestationEnabled === true` only. */
export function resolveCustomerFacingCashAttestationEnabledFromCommerceConfig(
  commerceConfigJson: unknown,
): boolean {
  return readCommerceFlag(commerceConfigJson, 'customerFacingCashAttestationEnabled');
}

/**
 * Prefer explicit public-config / capabilities flag; fall back to commerceConfigJson.
 * Undefined explicit → legacy JSON; false/true short-circuit.
 */
export function resolveKioskSellerAssistedEnabled(input: {
  readonly kioskSellerAssistedEnabled?: boolean | null;
  readonly commerceConfigJson?: unknown;
}): boolean {
  if (input.kioskSellerAssistedEnabled === true) {
    return true;
  }
  if (input.kioskSellerAssistedEnabled === false) {
    return false;
  }
  return resolveKioskSellerAssistedEnabledFromCommerceConfig(input.commerceConfigJson);
}

export function resolveCustomerFacingCashAttestationEnabled(input: {
  readonly customerFacingCashAttestationEnabled?: boolean | null;
  readonly commerceConfigJson?: unknown;
}): boolean {
  if (input.customerFacingCashAttestationEnabled === true) {
    return true;
  }
  if (input.customerFacingCashAttestationEnabled === false) {
    return false;
  }
  return resolveCustomerFacingCashAttestationEnabledFromCommerceConfig(input.commerceConfigJson);
}
