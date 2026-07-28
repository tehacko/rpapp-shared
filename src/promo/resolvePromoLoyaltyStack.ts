import type { PromoStackingMode } from '../checkout/sessionMetadataV5.js';

export type PromoLoyaltyApplicationOrder =
  | 'NONE'
  | 'PROMO_ONLY'
  | 'LOYALTY_ONLY'
  | 'PROMO_THEN_LOYALTY';

export interface ResolvePromoLoyaltyStackInput {
  readonly stackingMode: PromoStackingMode;
  readonly activatedPromoRewardId?: string | null;
  readonly activatedCouponId?: string | null;
  /** Major-currency promo discount from preview (optional; used for totals). */
  readonly promoDiscountAmount?: number;
  /** Major-currency loyalty discount from preview (optional; used for totals). */
  readonly loyaltyDiscountAmount?: number;
}

export interface ResolvePromoLoyaltyStackResult {
  /** False when EXCLUSIVE and both instruments are present (apply must 409). */
  readonly allowed: boolean;
  readonly mutualExclusion: boolean;
  readonly mutualExclusionCode: 'PROMO_LOYALTY_MUTUAL_EXCLUSION' | null;
  /** HTTP hint for apply/remove conflict surfaces. */
  readonly httpStatus: 409 | null;
  readonly applicationOrder: PromoLoyaltyApplicationOrder;
  readonly effectiveActivatedPromoRewardId: string | null;
  readonly effectiveActivatedCouponId: string | null;
  /**
   * Preview total: STACK sums both; EXCLUSIVE uses max when conflict unresolved,
   * otherwise the single active instrument amount.
   */
  readonly totalDiscountAmount: number;
}

function nonEmptyId(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function nonNegativeAmount(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

/**
 * Resolve promo ↔ loyalty stacking for apply / preview / remove UX (plan §3.16).
 *
 * - EXCLUSIVE + both present → mutual exclusion (`PROMO_LOYALTY_MUTUAL_EXCLUSION` / 409).
 * - STACK_PROMO_THEN_LOYALTY → promo first, then loyalty on residual (both effective).
 * - Remove code clears promo only; loyalty remains when still eligible (callers pass
 *   `activatedPromoRewardId: null` after remove).
 */
export function resolvePromoLoyaltyStack(
  input: ResolvePromoLoyaltyStackInput,
): ResolvePromoLoyaltyStackResult {
  const promoId = nonEmptyId(input.activatedPromoRewardId);
  const couponId = nonEmptyId(input.activatedCouponId);
  const promoDiscount = nonNegativeAmount(input.promoDiscountAmount);
  const loyaltyDiscount = nonNegativeAmount(input.loyaltyDiscountAmount);
  const hasPromo = promoId !== null;
  const hasLoyalty = couponId !== null;

  if (!hasPromo && !hasLoyalty) {
    return {
      allowed: true,
      mutualExclusion: false,
      mutualExclusionCode: null,
      httpStatus: null,
      applicationOrder: 'NONE',
      effectiveActivatedPromoRewardId: null,
      effectiveActivatedCouponId: null,
      totalDiscountAmount: 0,
    };
  }

  if (input.stackingMode === 'STACK_PROMO_THEN_LOYALTY') {
    if (hasPromo && hasLoyalty) {
      return {
        allowed: true,
        mutualExclusion: false,
        mutualExclusionCode: null,
        httpStatus: null,
        applicationOrder: 'PROMO_THEN_LOYALTY',
        effectiveActivatedPromoRewardId: promoId,
        effectiveActivatedCouponId: couponId,
        totalDiscountAmount: promoDiscount + loyaltyDiscount,
      };
    }
    if (hasPromo) {
      return {
        allowed: true,
        mutualExclusion: false,
        mutualExclusionCode: null,
        httpStatus: null,
        applicationOrder: 'PROMO_ONLY',
        effectiveActivatedPromoRewardId: promoId,
        effectiveActivatedCouponId: null,
        totalDiscountAmount: promoDiscount,
      };
    }
    return {
      allowed: true,
      mutualExclusion: false,
      mutualExclusionCode: null,
      httpStatus: null,
      applicationOrder: 'LOYALTY_ONLY',
      effectiveActivatedPromoRewardId: null,
      effectiveActivatedCouponId: couponId,
      totalDiscountAmount: loyaltyDiscount,
    };
  }

  // EXCLUSIVE
  if (hasPromo && hasLoyalty) {
    return {
      allowed: false,
      mutualExclusion: true,
      mutualExclusionCode: 'PROMO_LOYALTY_MUTUAL_EXCLUSION',
      httpStatus: 409,
      applicationOrder: 'NONE',
      effectiveActivatedPromoRewardId: null,
      effectiveActivatedCouponId: null,
      totalDiscountAmount: Math.max(promoDiscount, loyaltyDiscount),
    };
  }

  if (hasPromo) {
    return {
      allowed: true,
      mutualExclusion: false,
      mutualExclusionCode: null,
      httpStatus: null,
      applicationOrder: 'PROMO_ONLY',
      effectiveActivatedPromoRewardId: promoId,
      effectiveActivatedCouponId: null,
      totalDiscountAmount: promoDiscount,
    };
  }

  return {
    allowed: true,
    mutualExclusion: false,
    mutualExclusionCode: null,
    httpStatus: null,
    applicationOrder: 'LOYALTY_ONLY',
    effectiveActivatedPromoRewardId: null,
    effectiveActivatedCouponId: couponId,
    totalDiscountAmount: loyaltyDiscount,
  };
}
