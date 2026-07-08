/**
 * Funnel metadata builders (Retail V1 Analytics P0).
 */
export interface ScreenMetadataInput {
  readonly screenName?: string;
  readonly previousScreenName?: string;
}

export function buildScreenMetadata(
  input: ScreenMetadataInput,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (input.screenName !== undefined && input.screenName.length > 0) {
    out.screen_name = input.screenName;
  }
  if (input.previousScreenName !== undefined && input.previousScreenName.length > 0) {
    out.previous_screen_name = input.previousScreenName;
  }
  return out;
}

export function buildMenuOpenedMetadata(
  input: ScreenMetadataInput & { productCount?: number },
): Record<string, string | number> {
  return {
    ...buildScreenMetadata(input),
    ...(input.productCount !== undefined ? { product_count: input.productCount } : {}),
  };
}

export function buildProductSelectedMetadata(
  input: ScreenMetadataInput & {
    productId: number | string;
    interactionType?: string;
  },
): Record<string, string | number> {
  return {
    ...buildScreenMetadata(input),
    product_id: String(input.productId),
    ...(input.interactionType !== undefined ? { interaction_type: input.interactionType } : {}),
  };
}

export function buildQrDisplayedMetadata(
  input: ScreenMetadataInput & {
    paymentId?: string;
    surface?: string;
  },
): Record<string, string> {
  return {
    ...buildScreenMetadata(input),
    ...(input.paymentId !== undefined ? { payment_id: input.paymentId } : {}),
    ...(input.surface !== undefined ? { surface: input.surface } : {}),
  };
}
