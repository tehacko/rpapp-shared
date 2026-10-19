/**
 * EET / commerce fail-closed API error code (plan HYG-G15).
 * Mirrors backend `ErrorCodes.COMMERCE_BLOCKED`. Package has no Zod — const union + type guard.
 */

export const COMMERCE_BLOCKED_ERROR_CODES = ['COMMERCE_BLOCKED'] as const;

export type CommerceBlockedErrorCode = (typeof COMMERCE_BLOCKED_ERROR_CODES)[number];

export function isCommerceBlockedErrorCode(value: unknown): value is CommerceBlockedErrorCode {
  return (
    typeof value === 'string' &&
    (COMMERCE_BLOCKED_ERROR_CODES as readonly string[]).includes(value)
  );
}
