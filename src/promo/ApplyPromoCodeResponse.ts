import type { PromoStackingMode } from '../checkout/sessionMetadataV5.js';

/**
 * POST /api/v1/promotions/apply-code success payload (plan §3.8 / §3.17).
 * FE overwrites handoff from `activatedPromoRewardId`; success chip uses eventName + magnitude only.
 */

export interface ApplyPromoCodeResponse {
  readonly activatedPromoRewardId: string;
  readonly eventId: string;
  readonly eventName: string;
  /** Major-currency FIXED amount when applicable; null for percent-only. */
  readonly discountAmount: number | null;
  /** Basis points 1…10000 when percent; null for fixed-only. */
  readonly discountBps: number | null;
  readonly stackingMode: PromoStackingMode;
  readonly activatedAt: string;
  readonly ruleVersionId: string | null;
  /** Typed apply always MANUAL_CODE (reward metadata.source mirror). */
  readonly source: 'MANUAL_CODE';
}
