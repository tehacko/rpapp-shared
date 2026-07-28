/**
 * Read-only v5 session-metadata contract for kiosk/customer/PWA consumers.
 *
 * SSOT for upgrade/merge/payment resolution: `up-backend/src/application/services/checkout/sessionMetadataCompat.ts`
 * and `up-backend/src/domain/types/checkout/sessionMetadataV5.ts` (domain guard only).
 * Shared package = type mirror for future consumers; kiosk/customer re-export via `pi-kiosk-shared`.
 * Keep field names and optionality in sync with ADR-006 when backend evolves.
 */
import type {
  SessionMetadataCheckoutMode,
  SessionMetadataCollect,
  SessionMetadataShopLine,
} from './sessionMetadataV3.js';
import type { SessionMetadataLoyaltyV4 } from './sessionMetadataV4.js';

export type PromoStackingMode = 'EXCLUSIVE' | 'STACK_PROMO_THEN_LOYALTY';

/**
 * How the activated promo reward entered checkout.
 * MANUAL_CODE = typed apply-code path (reward metadata.source mirror).
 * WALLET_REWARD = customer/kiosk wallet activate path.
 */
export type PromoActivationSource = 'MANUAL_CODE' | 'WALLET_REWARD';

export interface SessionMetadataShopV5 {
  salesPointId: number;
  lines: SessionMetadataShopLine[];
}

export interface SessionMetadataPromotionsV5 {
  readonly activatedPromoRewardId?: string | null;
  readonly stackingMode?: PromoStackingMode;
  readonly activatedAt?: string | null;
  readonly ruleVersionId?: string | null;
  /** Typed apply-code vs wallet activation (plan MANUAL_CODE instrument bridge). */
  readonly source?: PromoActivationSource | null;
  /** Bound promo event when known (display / AUTO_DEAL suppress). */
  readonly eventId?: string | null;
}

export interface SessionMetadataEnvelopeV5 {
  version: 5;
  collect?: SessionMetadataCollect;
  checkoutMode?: SessionMetadataCheckoutMode;
  shop?: SessionMetadataShopV5;
  loyalty?: SessionMetadataLoyaltyV4;
  promotions?: SessionMetadataPromotionsV5;
}

export function isSessionMetadataV5(value: unknown): value is SessionMetadataEnvelopeV5 {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as SessionMetadataEnvelopeV5).version === 5
  );
}

/** Channel/mode matrix — throws on invalid combinations (inherits v4 rules). */
export function assertSessionMetadataV5ChannelRules(envelope: SessionMetadataEnvelopeV5): void {
  const mode = envelope.checkoutMode;
  if (mode === undefined) {
    return;
  }
  if (
    mode.channel === 'MOBILE_FIRST' &&
    mode.selectedMode !== 'PREPAY_COLLECT_LATER' &&
    mode.selectedMode !== 'PAY_NOW_SELF_SERVICE'
  ) {
    throw new Error('SESSION_METADATA_V5_MOBILE_MODE_INVALID');
  }
  if (mode.channel === 'KIOSK_FIRST' && mode.selectedMode === 'PREPAY_COLLECT_LATER') {
    throw new Error('SESSION_METADATA_V5_KIOSK_MODE_INVALID');
  }
  if (envelope.collect !== undefined) {
    if (
      mode.channel === 'MOBILE_FIRST' &&
      mode.selectedMode === 'PREPAY_COLLECT_LATER' &&
      envelope.collect.timing !== 'LATER'
    ) {
      throw new Error('SESSION_METADATA_V5_MOBILE_COLLECT_TIMING_INVALID');
    }
    if (
      mode.channel === 'MOBILE_FIRST' &&
      mode.selectedMode === 'PAY_NOW_SELF_SERVICE' &&
      envelope.collect.timing !== 'NOW'
    ) {
      throw new Error('SESSION_METADATA_V5_MOBILE_COLLECT_TIMING_INVALID');
    }
  }
}

export function upgradeSessionMetadataV4ToV5(
  envelope: { version: 4 } & Omit<SessionMetadataEnvelopeV5, 'version'>,
): SessionMetadataEnvelopeV5 {
  return {
    ...envelope,
    version: 5,
    promotions: envelope.promotions ?? {},
  };
}
