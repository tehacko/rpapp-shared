import type { SessionMetadataCollect } from './sessionMetadataV3.js';

/** Line snapshot for checkout session idempotency (customer PWA + kiosk parity). */
export interface CartLineFingerprintLine {
  readonly productId: number;
  readonly variantId: number | null;
  readonly quantity: number;
}

export interface CartLineFingerprintInput {
  readonly tenantCode: string;
  readonly kioskId: number;
  readonly purposeType: string;
  readonly flowType: string;
  readonly checkoutSubMode: string;
  readonly collect: SessionMetadataCollect | null;
  readonly lines: readonly CartLineFingerprintLine[];
  readonly customerId?: number | null;
  /** Bumped after `409 IDEMPOTENCY_CONFLICT` so the shopper can retry checkout. */
  readonly revision?: number;
}

export function buildCustomerIdentityDimension(customerId: number | null | undefined): string {
  if (customerId !== null && customerId !== undefined && customerId > 0) {
    return `customer:${customerId}`;
  }
  return 'guest';
}

export function buildCollectHash(collect: SessionMetadataCollect | null): string {
  if (collect === null) {
    return 'none';
  }
  const timing = collect.timing;
  const pickupPointId = collect.pickupPointId;
  const promisedPickupAt = collect.pickup?.promisedPickupAt ?? '';
  const pickupWindowEndAt = collect.pickup?.pickupWindowEndAt ?? '';
  const selfCollect = collect.selfCollectConfirmedAtKiosk === true ? '1' : '0';
  return [
    timing,
    String(pickupPointId),
    promisedPickupAt,
    pickupWindowEndAt,
    selfCollect,
  ].join(':');
}

export function buildLinesFingerprint(lines: readonly CartLineFingerprintLine[]): string {
  if (lines.length === 0) {
    return 'empty';
  }
  const stable = [...lines]
    .map((line) => `${line.productId}|${line.variantId ?? 'null'}|${line.quantity}`)
    .sort()
    .join(';');
  return stable;
}

/**
 * Stable idempotency key for `POST /customer-checkout/sessions`.
 *
 * Dimensions (ADR): tenantCode | kioskId | purposeType | flowType |
 * checkoutSubMode | collectHash | linesFingerprint | customerIdentityDimension
 */
export function buildCheckoutSessionIdempotencyKey(input: CartLineFingerprintInput): string {
  const fingerprint = [
    input.tenantCode,
    String(input.kioskId),
    input.purposeType,
    input.flowType,
    input.checkoutSubMode,
    buildCollectHash(input.collect),
    buildLinesFingerprint(input.lines),
    buildCustomerIdentityDimension(input.customerId),
  ].join('|');
  const revision = input.revision ?? 0;
  if (revision > 0) {
    return `ccs:${fingerprint}|r:${revision}`;
  }
  return `ccs:${fingerprint}`;
}

export function mapShopCartLinesToFingerprintLines(
  lines: ReadonlyArray<{
    readonly product: { readonly id: number };
    readonly variant: { readonly id: number } | null;
    readonly quantity: number;
  }>,
): CartLineFingerprintLine[] {
  return lines.map((line) => ({
    productId: line.product.id,
    variantId: line.variant?.id ?? null,
    quantity: line.quantity,
  }));
}
