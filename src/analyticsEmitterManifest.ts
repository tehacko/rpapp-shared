/**
 * Static emitter matrix for shipped analytics journeys (plan P0.3).
 * CI drift tests ensure every `eventName` is in the v1 catalog and that
 * required FE cells map to known orchestration surfaces.
 */
import { ANALYTICS_V2_EXTENSION_EVENTS } from './analyticsCatalogV2.js';
import { ANALYTICS_V2_EXTENSION_EVENT_NAMES } from './analyticsCatalogV2.js';
import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';

export type AnalyticsEmitterSurface = 'kiosk' | 'customer' | 'server';
export type AnalyticsEmitterLayer = 'FE' | 'BE';

export interface AnalyticsEmitterManifestCell {
  readonly eventName: AnalyticsEventName | (typeof ANALYTICS_V2_EXTENSION_EVENTS)[keyof typeof ANALYTICS_V2_EXTENSION_EVENTS];
  readonly surface: AnalyticsEmitterSurface;
  readonly layer: AnalyticsEmitterLayer;
  readonly required: boolean;
  /** Allowlisted path fragment or server use-case name. */
  readonly reference: string;
}

/** Shipped journeys only — kiosk retail/donation, customer shop/checkout, server payment/session. */
export const ANALYTICS_EMITTER_MANIFEST: readonly AnalyticsEmitterManifestCell[] = [
  { eventName: 'session_started', surface: 'server', layer: 'BE', required: true, reference: 'StartAnalyticsSessionUseCase' },
  { eventName: 'session_completed', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskNavigationHandlers' },
  { eventName: 'session_completed', surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  { eventName: 'session_abandoned', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskPaymentFlowHandlers' },
  { eventName: 'screen_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'shopAnalyticsMetadata' },
  {
    eventName: 'screen_viewed',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: 'catalog_interaction', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'catalog_interaction', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'catalog_image_load_failed', surface: 'customer', layer: 'FE', required: true, reference: 'ProductCard' },
  { eventName: 'catalog_image_load_failed', surface: 'kiosk', layer: 'FE', required: true, reference: 'ProductGrid' },
  { eventName: 'product_added', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'product_added', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: 'cart_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'checkout_started', surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: 'checkout_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskNavigationHandlers' },
  { eventName: 'payment_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskPaymentFlowHandlers' },
  { eventName: 'payment_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstProductJourney' },
  { eventName: 'payment_qr_generated', surface: 'server', layer: 'BE', required: true, reference: 'CreateQRPaymentUseCase' },
  { eventName: 'payment_confirmed', surface: 'server', layer: 'BE', required: true, reference: 'CompletePaymentTransactionUseCase' },
  { eventName: 'donation_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstDonationJourney' },
  {
    eventName: 'kiosk_wakeup',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  {
    eventName: 'recurring_payment_missed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'RecurringDonationMissedPeriodWorker',
  },
  {
    eventName: 'recurring_payment_received',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'AdvanceRecurringDonationScheduleOnInboundMatch',
  },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.MENU_OPENED, surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  {
    eventName: ANALYTICS_V2_EXTENSION_EVENTS.MENU_OPENED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.PRODUCT_SELECTED, surface: 'customer', layer: 'FE', required: true, reference: 'ShopScreen' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.PRODUCT_SELECTED, surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestration' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.QR_DISPLAYED, surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  {
    eventName: ANALYTICS_V2_EXTENSION_EVENTS.QR_DISPLAYED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.RECEIPT_DOWNLOADED, surface: 'customer', layer: 'FE', required: true, reference: 'AccountReceiptDownloadButton' },
  { eventName: 'auth_flow_started', surface: 'customer', layer: 'FE', required: true, reference: 'SignInScreen' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.IDENTITY_RECOGNIZED, surface: 'customer', layer: 'FE', required: true, reference: 'CustomerAnalyticsProvider' },
  { eventName: 'receipt_opened', surface: 'customer', layer: 'FE', required: true, reference: 'AccountPaymentsPage' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.ACCOUNT_LOGGED_OUT, surface: 'customer', layer: 'FE', required: true, reference: 'AccountShell' },
  { eventName: 'login_success', surface: 'server', layer: 'BE', required: true, reference: 'LoginWithPasswordUseCase' },
  { eventName: 'account_created', surface: 'server', layer: 'BE', required: true, reference: 'RegisterCustomerUseCase' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.ACCOUNT_LOGGED_OUT, surface: 'server', layer: 'BE', required: true, reference: 'LogoutCustomerSessionUseCase' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.PROFILE_UPDATED, surface: 'server', layer: 'BE', required: true, reference: 'PutReceiptLocalePreferenceUseCase' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.IDENTITY_LINKED, surface: 'server', layer: 'BE', required: true, reference: 'LinkAccountToTransactionUseCase' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.IDENTITY_DELETED, surface: 'server', layer: 'BE', required: true, reference: 'CustomerErasureSideEffectsService' },
  { eventName: ANALYTICS_V2_EXTENSION_EVENTS.CUSTOMER_DELETED, surface: 'server', layer: 'BE', required: true, reference: 'CustomerErasureSideEffectsService' },
] as const;

const ALLOWED_FE_REFERENCES = new Set<string>([
  'ShopScreen',
  'shopAnalyticsMetadata',
  'useKioskOrchestration',
  'useKioskOrchestrationAnalyticsEffects',
  'kioskNavigationHandlers',
  'kioskPaymentFlowHandlers',
  'QrPaymentView',
  'PhoneFirstProductJourney',
  'PhoneFirstDonationJourney',
  'AccountReceiptDownloadButton',
  'SignInScreen',
  'CustomerAnalyticsProvider',
  'AccountPaymentsPage',
  'AccountShell',
  'ProductCard',
  'ProductGrid',
]);

/** Repo-relative paths for CI grep wiring tests (G3). */
export const ANALYTICS_EMITTER_FE_REFERENCE_PATHS: Readonly<Record<string, string>> = {
  shopAnalyticsMetadata: 'rpapp-customer/src/features/shop/shopAnalyticsMetadata.ts',
  ShopScreen: 'rpapp-customer/src/features/shop/hooks/useShopScreen.ts',
  useKioskOrchestration: 'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestration.ts',
  useKioskOrchestrationAnalyticsEffects:
    'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestrationAnalyticsEffects.ts',
  kioskNavigationHandlers: 'rpapp-kiosk/src/features/kiosk/handlers/kioskNavigationHandlers.ts',
  kioskPaymentFlowHandlers: 'rpapp-kiosk/src/features/kiosk/handlers/kioskPaymentFlowHandlers.ts',
  QrPaymentView: 'rpapp-customer/src/features/checkout/QrPaymentView.tsx',
  PhoneFirstProductJourney: 'rpapp-customer/src/features/journeys/PhoneFirstProductJourney.tsx',
  PhoneFirstDonationJourney: 'rpapp-customer/src/features/journeys/PhoneFirstDonationJourney.tsx',
  AccountReceiptDownloadButton:
    'rpapp-customer/src/features/account/components/AccountReceiptDownloadButton.tsx',
  SignInScreen: 'rpapp-customer/src/features/auth/SignInScreen.tsx',
  CustomerAnalyticsProvider: 'rpapp-customer/src/shared/analytics/CustomerAnalyticsProvider.tsx',
  AccountPaymentsPage: 'rpapp-customer/src/features/account/AccountPaymentsPage.tsx',
  AccountShell: 'rpapp-customer/src/features/account/AccountShell.tsx',
  ProductCard: 'rpapp-customer/src/features/shop/components/ProductCard.tsx',
  ProductGrid: 'rpapp-kiosk/src/features/products/components/ProductGrid/ProductGrid.tsx',
};

/** Repo-relative paths for server-layer CI grep wiring (G-P1-09 / AN-036). */
export const ANALYTICS_EMITTER_BE_REFERENCE_PATHS: Readonly<Record<string, string>> = {
  StartAnalyticsSessionUseCase:
    'up-backend/src/application/use-cases/analytics/StartAnalyticsSessionUseCase.ts',
  CreateQRPaymentUseCase:
    'up-backend/src/application/use-cases/payment/qr/CreateQRPaymentUseCase.ts',
  CompletePaymentTransactionUseCase:
    'up-backend/src/application/use-cases/payment/shared/CompletePaymentTransactionUseCase.ts',
  CreatePostKioskAnalyticsChildSessionUseCase:
    'up-backend/src/application/use-cases/analytics/CreatePostKioskAnalyticsChildSessionUseCase.ts',
  RecurringDonationMissedPeriodWorker:
    'up-backend/src/infrastructure/workers/RecurringDonationMissedPeriodWorker.ts',
  AdvanceRecurringDonationScheduleOnInboundMatch:
    'up-backend/src/application/use-cases/reconciliation/AdvanceRecurringDonationScheduleOnInboundMatch.ts',
  LoginWithPasswordUseCase:
    'up-backend/src/application/use-cases/customer-auth/LoginWithPasswordUseCase.ts',
  RegisterCustomerUseCase:
    'up-backend/src/application/use-cases/customer-auth/RegisterCustomerUseCase.ts',
  LogoutCustomerSessionUseCase:
    'up-backend/src/application/use-cases/customer-auth/LogoutCustomerSessionUseCase.ts',
  PutReceiptLocalePreferenceUseCase:
    'up-backend/src/application/use-cases/customer-account/CustomerReceiptLocalePreferenceUseCases.ts',
  LinkAccountToTransactionUseCase:
    'up-backend/src/application/use-cases/customer-auth/LinkAccountToTransactionUseCase.ts',
  CustomerErasureSideEffectsService:
    'up-backend/src/infrastructure/services/gdpr/CustomerErasureSideEffectsService.ts',
};

const ALLOWED_BE_REFERENCES = new Set<string>([
  'StartAnalyticsSessionUseCase',
  'CreateQRPaymentUseCase',
  'CompletePaymentTransactionUseCase',
  'CreatePostKioskAnalyticsChildSessionUseCase',
  'RecurringDonationMissedPeriodWorker',
  'AdvanceRecurringDonationScheduleOnInboundMatch',
  'LoginWithPasswordUseCase',
  'RegisterCustomerUseCase',
  'LogoutCustomerSessionUseCase',
  'PutReceiptLocalePreferenceUseCase',
  'LinkAccountToTransactionUseCase',
  'CustomerErasureSideEffectsService',
]);

export function validateAnalyticsEmitterManifest(): string[] {
  const errors: string[] = [];
  const catalog = new Set<string>([
    ...ANALYTICS_EVENT_NAMES,
    ...ANALYTICS_V2_EXTENSION_EVENT_NAMES,
  ]);

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
