/**
 * Apply/remove/validate promo-code API error codes (plan §20).
 * Package has no Zod — const union + type mirror for clients.
 */

export const PROMO_CODE_ERROR_CODES = [
  'PROMO_CODE_INVALID',
  'PROMO_CODE_EXPIRED',
  'PROMO_CODE_EXHAUSTED',
  'PROMO_CODE_DISABLED',
  'PROMO_CODE_GUEST_REQUIRED_SIGN_IN',
  'PROMO_CODE_CHANNEL_DENIED',
  'PROMO_CODE_MIN_SPEND',
  'PROMO_CODE_ENROLLMENT_REQUIRED',
  'PROMO_BUDGET_SOFT_STOP',
  'PROMO_BUDGET_EXHAUSTED',
  'PROMO_LOYALTY_MUTUAL_EXCLUSION',
  'PROMO_CODE_HOLD_ACTIVE_REMOVE_FORBIDDEN',
  'PROMO_CODE_HOLD_ALREADY_ACTIVE',
  'PROMO_CODE_HOLD_EXPIRED',
  'PROMO_CODE_CHECKOUT_SESSION_REQUIRED',
  'PROMO_MODULE_DISABLED',
  'PROMO_TENANT_DISABLED',
  'PROMO_SHADOW_OR_DISABLED',
  'PROMO_CODE_RATE_LIMITED',
  'PROMO_CODE_EVENT_NOT_ACTIVE',
  'PROMO_CODE_ZERO_MAGNITUDE',
  'PROMO_PRICE_REVALIDATION_REQUIRED',
] as const;

export type PromoCodeErrorCode = (typeof PROMO_CODE_ERROR_CODES)[number];

export function isPromoCodeErrorCode(value: unknown): value is PromoCodeErrorCode {
  return (
    typeof value === 'string' &&
    (PROMO_CODE_ERROR_CODES as readonly string[]).includes(value)
  );
}
