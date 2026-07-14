export function promoActivatedRewardStorageKey(
  tenantCode: string,
  checkoutSessionId: string,
): string {
  return `promo:activatedReward:${tenantCode}:${checkoutSessionId}`;
}

export function clearPromoActivatedRewardHandoff(
  tenantCode: string,
  checkoutSessionId: string,
): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.removeItem(promoActivatedRewardStorageKey(tenantCode, checkoutSessionId));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}
