export type CollectTiming = 'NOW' | 'LATER';

export type CommerceChannel = 'MOBILE_FIRST' | 'KIOSK_FIRST';

export type CheckoutSubModeV3 =
  | 'PAY_NOW_SELF_SERVICE'
  | 'PAY_NOW_STAFF_HANDOFF'
  | 'PREPAY_COLLECT_LATER';

export type PickupHandoffModeV3 =
  | 'AUTO_ON_PAYMENT'
  | 'CUSTOMER_TAP'
  | 'SCAN_AT_STAND'
  | 'STAFF_SCAN';

export interface SessionMetadataCollect {
  timing: CollectTiming;
  pickupPointId: number;
  pickup?: {
    promisedPickupAt?: string;
    pickupWindowEndAt?: string;
  };
}

export interface SessionMetadataCheckoutMode {
  channel: CommerceChannel;
  selectedMode: CheckoutSubModeV3;
  pickupHandoffMode: PickupHandoffModeV3;
}

export interface SessionMetadataShopLine {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface SessionMetadataShop {
  kioskId: number;
  lines: SessionMetadataShopLine[];
}

export interface SessionMetadataEnvelopeV3 {
  version: 3;
  collect?: SessionMetadataCollect;
  checkoutMode?: SessionMetadataCheckoutMode;
  shop?: SessionMetadataShop;
}

export function isSessionMetadataV3(value: unknown): value is SessionMetadataEnvelopeV3 {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as SessionMetadataEnvelopeV3).version === 3
  );
}
