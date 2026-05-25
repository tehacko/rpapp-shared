/**
 * Static emitter matrix for shipped analytics journeys (plan P0.3).
 * CI drift tests ensure every `eventName` is in the v1 catalog and that
 * required FE cells map to known orchestration surfaces.
 */
import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';

export type AnalyticsEmitterSurface = 'kiosk' | 'customer' | 'server';
export type AnalyticsEmitterLayer = 'FE' | 'BE';

export interface AnalyticsEmitterManifestCell {
  readonly eventName: AnalyticsEventName;
  readonly surface: AnalyticsEmitterSurface;
  readonly layer: AnalyticsEmitterLayer;
  readonly required: boolean;
  /** Allowlisted path fragment or server use-case name. */
  readonly reference: string;
}

/** Shipped journeys only — kiosk retail/donation, customer shop/checkout, server payment/session. */
export const ANALYTICS_EMITTER_MANIFEST: readonly AnalyticsEmitterManifestCell[] = [
  { eventName: 'session_started', surface: 'server', layer: 'BE', required: true, reference: 'StartAnalyticsSessionUseCase' },
  { eventName: 'session_completed', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'session_completed', surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  { eventName: 'session_abandoned', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'screen_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'shopAnalyticsMetadata' },
  { eventName: 'screen_viewed', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'catalog_interaction', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'catalog_interaction', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'product_added', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'product_added', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'cart_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'checkout_started', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'checkout_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'payment_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'payment_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstProductJourney' },
  { eventName: 'payment_qr_generated', surface: 'server', layer: 'BE', required: true, reference: 'CreateQRPaymentUseCase' },
  { eventName: 'payment_confirmed', surface: 'server', layer: 'BE', required: true, reference: 'CompletePaymentTransactionUseCase' },
  { eventName: 'donation_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstDonationJourney' },
  { eventName: 'kiosk_wakeup', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
] as const;

const ALLOWED_FE_REFERENCES = new Set<string>([
  'ShopScreen',
  'shopAnalyticsMetadata',
  'useKioskOrchestration',
  'QrPaymentView',
  'PhoneFirstProductJourney',
  'PhoneFirstDonationJourney',
]);

/** Repo-relative paths for CI grep wiring tests (G3). */
export const ANALYTICS_EMITTER_FE_REFERENCE_PATHS: Readonly<Record<string, string>> = {
  shopAnalyticsMetadata: 'rpapp-customer/src/features/shop/shopAnalyticsMetadata.ts',
  ShopScreen: 'rpapp-customer/src/features/shop/ShopScreen.tsx',
  useKioskOrchestration: 'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestration.ts',
  QrPaymentView: 'rpapp-customer/src/features/checkout/QrPaymentView.tsx',
  PhoneFirstProductJourney: 'rpapp-customer/src/features/journeys/PhoneFirstProductJourney.tsx',
  PhoneFirstDonationJourney: 'rpapp-customer/src/features/journeys/PhoneFirstDonationJourney.tsx',
};

const ALLOWED_BE_REFERENCES = new Set<string>([
  'StartAnalyticsSessionUseCase',
  'CreateQRPaymentUseCase',
  'CompletePaymentTransactionUseCase',
  'CreatePostKioskAnalyticsChildSessionUseCase',
]);

export function validateAnalyticsEmitterManifest(): string[] {
  const errors: string[] = [];
  const catalog = new Set<string>(ANALYTICS_EVENT_NAMES);

  for (const cell of ANALYTICS_EMITTER_MANIFEST) {
    if (!catalog.has(cell.eventName)) {
      errors.push(`manifest event not in catalog: ${cell.eventName}`);
    }
    if (cell.layer === 'FE' && !ALLOWED_FE_REFERENCES.has(cell.reference)) {
      errors.push(`unknown FE reference for ${cell.eventName}: ${cell.reference}`);
    }
    if (cell.layer === 'BE' && !ALLOWED_BE_REFERENCES.has(cell.reference)) {
      errors.push(`unknown BE reference for ${cell.eventName}: ${cell.reference}`);
    }
  }

  return errors;
}
