/**
 * Sales-point green-light for typed promo codes (plan §3.15).
 * Fail closed when `commerceConfigJson.promotionsProgramEnabled` is not true.
 */
export function resolvePromotionsProgramEnabledFromCommerceConfig(
  commerceConfigJson: unknown,
): boolean {
  if (commerceConfigJson === null || commerceConfigJson === undefined) {
    return false;
  }
  if (typeof commerceConfigJson !== 'object') {
    return false;
  }
  const record = commerceConfigJson as Record<string, unknown>;
  return record.promotionsProgramEnabled === true;
}

/**
 * Prefer explicit commerceCapabilities flag from customer/kiosk public config;
 * fall back to legacy commerceConfigJson shape.
 */
export function resolvePromotionsProgramEnabled(input: {
  readonly commerceCapabilitiesPromotionsProgramEnabled?: boolean | null;
  readonly commerceConfigJson?: unknown;
}): boolean {
  if (input.commerceCapabilitiesPromotionsProgramEnabled === true) {
    return true;
  }
  if (input.commerceCapabilitiesPromotionsProgramEnabled === false) {
    return false;
  }
  return resolvePromotionsProgramEnabledFromCommerceConfig(input.commerceConfigJson);
}
