const CUSTOMER_CARD_PREFIX = 'kc:';

/**
 * Detects server-issued physical loyalty card wedge payloads (`kc:{uuid}`).
 */
export function looksLikeCustomerCard(payload: string): boolean {
  return payload.trim().toLowerCase().startsWith(CUSTOMER_CARD_PREFIX);
}
