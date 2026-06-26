import type {
  SessionMetadataCheckoutMode,
  SessionMetadataCollect,
  SessionMetadataShopLine,
} from './sessionMetadataV3.js';

export interface SessionMetadataShopV4 {
  salesPointId: number;
  lines: SessionMetadataShopLine[];
}

export interface SessionMetadataLoyaltyV4 {
  readonly activatedCouponId?: string | null;
}

export interface SessionMetadataEnvelopeV4 {
  version: 4;
  collect?: SessionMetadataCollect;
  checkoutMode?: SessionMetadataCheckoutMode;
  shop?: SessionMetadataShopV4;
  loyalty?: SessionMetadataLoyaltyV4;
}

export function isSessionMetadataV4(value: unknown): value is SessionMetadataEnvelopeV4 {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as SessionMetadataEnvelopeV4).version === 4
  );
}

/** Channel/mode matrix — throws on invalid combinations. */
export function assertSessionMetadataV4ChannelRules(envelope: SessionMetadataEnvelopeV4): void {
  const mode = envelope.checkoutMode;
  if (mode === undefined) {
    return;
  }
  if (
    mode.channel === 'MOBILE_FIRST' &&
    mode.selectedMode !== 'PREPAY_COLLECT_LATER' &&
    mode.selectedMode !== 'PAY_NOW_SELF_SERVICE'
  ) {
    throw new Error('SESSION_METADATA_V4_MOBILE_MODE_INVALID');
  }
  if (mode.channel === 'KIOSK_FIRST' && mode.selectedMode === 'PREPAY_COLLECT_LATER') {
    throw new Error('SESSION_METADATA_V4_KIOSK_MODE_INVALID');
  }
  if (envelope.collect !== undefined) {
    if (
      mode.channel === 'MOBILE_FIRST' &&
      mode.selectedMode === 'PREPAY_COLLECT_LATER' &&
      envelope.collect.timing !== 'LATER'
    ) {
      throw new Error('SESSION_METADATA_V4_MOBILE_COLLECT_TIMING_INVALID');
    }
    if (
      mode.channel === 'MOBILE_FIRST' &&
      mode.selectedMode === 'PAY_NOW_SELF_SERVICE' &&
      envelope.collect.timing !== 'NOW'
    ) {
      throw new Error('SESSION_METADATA_V4_MOBILE_COLLECT_TIMING_INVALID');
    }
  }
}
