/**
 * Stable cart line identity for kiosk checkout (product + optional variant).
 */
export function buildKioskLineKey(productId: number, variantId?: number | null): string {
  return `${productId}:${variantId ?? 'base'}`;
}
