/**
 * POST /api/v1/promotions/apply-code body (plan §5.2).
 * Shared package uses TypeScript interfaces (no Zod dependency).
 */

export const PROMO_CODE_APPLY_CHANNELS = ['KIOSK', 'CUSTOMER_CHECKOUT'] as const;

export type PromoCodeApplyChannel = (typeof PROMO_CODE_APPLY_CHANNELS)[number];

export interface ApplyPromoCodeRequest {
  readonly checkoutSessionPublicId: string;
  readonly code: string;
  readonly channel: PromoCodeApplyChannel;
}
