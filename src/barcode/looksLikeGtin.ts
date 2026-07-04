const GTIN_PATTERN = /^\d{8,14}$/;

/**
 * Returns true when the trimmed payload is an all-digit GTIN candidate (8–14 digits).
 */
export function looksLikeGtin(payload: string): boolean {
  const trimmed = payload.trim();
  if (trimmed.length === 0) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== trimmed.replace(/[\s-]/g, '').length) {
    return false;
  }
  return GTIN_PATTERN.test(digits);
}
