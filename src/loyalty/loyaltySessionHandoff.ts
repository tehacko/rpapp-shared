export function loyaltyActivatedCouponStorageKey(
  tenantCode: string,
  checkoutSessionId: string
): string {
  return `loyalty:activatedCoupon:${tenantCode}:${checkoutSessionId}`;
}

export function clearLoyaltyActivatedCouponHandoff(
  tenantCode: string,
  checkoutSessionId: string
): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.removeItem(
      loyaltyActivatedCouponStorageKey(tenantCode, checkoutSessionId)
    );
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}
