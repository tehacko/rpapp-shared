/**
 * Promo checkout handoff SSOT (ADR-006 / plan §3.8).
 *
 * Server session metadata wins over sessionStorage. FE overwrites handoff from
 * apply/activate responses; payment create reads server first.
 */

export function promoActivatedRewardStorageKey(
  tenantCode: string,
  checkoutSessionId: string,
): string {
  return `promo:activatedReward:${tenantCode}:${checkoutSessionId}`;
}

export function readPromoActivatedRewardHandoff(
  tenantCode: string,
  checkoutSessionId: string,
): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    const value = sessionStorage.getItem(
      promoActivatedRewardStorageKey(tenantCode, checkoutSessionId),
    );
    return value != null && value.length > 0 ? value : null;
  } catch {
    // sessionStorage may be unavailable in private mode
    return null;
  }
}

export function setPromoActivatedRewardHandoff(
  tenantCode: string,
  checkoutSessionId: string,
  activatedPromoRewardId: string,
): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  const trimmed = activatedPromoRewardId.trim();
  if (trimmed.length === 0) {
    clearPromoActivatedRewardHandoff(tenantCode, checkoutSessionId);
    return;
  }
  try {
    sessionStorage.setItem(
      promoActivatedRewardStorageKey(tenantCode, checkoutSessionId),
      trimmed,
    );
  } catch {
    // sessionStorage may be unavailable in private mode
  }
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
