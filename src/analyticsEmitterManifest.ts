/**
 * Static emitter matrix for shipped analytics journeys (plan P0.3).
 * CI drift tests ensure every `eventName` is in the v1 catalog and that
 * required FE cells map to known orchestration surfaces.
 */
import {
  ANALYTICS_ACCOUNT_EVENTS,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_FUNNEL_EVENTS,
  ANALYTICS_IDENTITY_EVENTS,
  ANALYTICS_RETAIL_EVENTS,
  ANALYTICS_UNIVERSAL_EVENTS,
  type AnalyticsEventName,
} from './analyticsEvents.js';

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
  { eventName: 'session_completed', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskNavigationHandlers' },
  { eventName: 'session_completed', surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  { eventName: 'session_abandoned', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskPaymentFlowHandlers' },
  {
    eventName: 'session_abandoned',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'QrPaymentView',
  },
  { eventName: 'screen_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'shopAnalyticsMetadata' },
  {
    eventName: 'screen_viewed',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: 'catalog_image_load_failed', surface: 'customer', layer: 'FE', required: true, reference: 'ProductCard' },
  { eventName: 'catalog_image_load_failed', surface: 'kiosk', layer: 'FE', required: true, reference: 'ProductGrid' },
  { eventName: 'product_added', surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  { eventName: 'product_added', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestrationRetail' },
  { eventName: 'cta_clicked', surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  { eventName: 'cta_clicked', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskNavigationHandlers' },
  { eventName: 'back_clicked', surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  { eventName: 'back_clicked', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskPaymentFlowHandlers' },
  { eventName: 'error_shown', surface: 'customer', layer: 'FE', required: true, reference: 'customerErrorAnalytics' },
  { eventName: 'error_shown', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestrationAnalyticsEffects' },
  { eventName: 'product_removed', surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  {
    eventName: 'product_removed',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationRetail',
  },
  { eventName: 'cart_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  { eventName: 'cart_viewed', surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestrationAnalyticsEffects' },
  {
    eventName: 'cart_sheet_opened',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  {
    eventName: 'cart_sticky_pay_clicked',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  {
    eventName: 'collect_step_opened',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  {
    eventName: 'collect_step_confirmed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  { eventName: 'checkout_started', surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  { eventName: 'gift_surface_impression', surface: 'customer', layer: 'FE', required: false, reference: 'CustomerHubNav' },
  { eventName: 'checkout_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskNavigationHandlers' },
  {
    eventName: 'checkout_mode_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  {
    eventName: 'checkout_mode_selected',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: 'payment_started', surface: 'kiosk', layer: 'FE', required: true, reference: 'kioskPaymentFlowHandlers' },
  { eventName: 'payment_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstProductJourney' },
  { eventName: 'payment_method_viewed', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstProductJourney' },
  {
    eventName: 'payment_failed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CancelIntentUseCase',
  },
  { eventName: 'payment_qr_generated', surface: 'server', layer: 'BE', required: true, reference: 'CreateQRPaymentUseCase' },
  { eventName: 'payment_confirmed', surface: 'server', layer: 'BE', required: true, reference: 'CompletePaymentTransactionUseCase' },
  {
    eventName: 'retail_order_paid',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CompletePaymentTransactionUseCase',
  },
  {
    eventName: 'checkout_handoff_completed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CompletePaymentTransactionUseCase',
  },
  {
    eventName: 'checkout_handoff_expired',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ExpireCheckoutPaymentHandoffWorker',
  },
  {
    eventName: 'retail_order_prepared',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'AdminUpdateFulfillmentStatusUseCase',
  },
  {
    eventName: 'retail_order_ready',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'AdminUpdateFulfillmentStatusUseCase',
  },
  {
    eventName: 'retail_order_collected',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'PickupConfirmFulfillmentUseCase',
  },
  {
    eventName: 'retail_pickup_scheduled',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CreateOrderFulfillmentUseCase',
  },
  {
    eventName: 'pickup_qr_issued',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'IssuePickupCredentialsUseCase',
  },
  {
    eventName: 'pickup_qr_scanned',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ResolvePickupQrTokenUseCase',
  },
  {
    eventName: 'pickup_qr_scanned',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ResolvePickupByCodeUseCase',
  },
  { eventName: 'donation_started', surface: 'customer', layer: 'FE', required: true, reference: 'PhoneFirstDonationJourney' },
  {
    eventName: 'donation_started',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskDonationHandlers',
  },
  {
    eventName: 'donation_amount_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'donationAnalyticsMetadata',
  },
  {
    eventName: 'donation_amount_selected',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskDonationHandlers',
  },
  {
    eventName: 'donation_custom_amount_entered',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'donationAnalyticsMetadata',
  },
  {
    eventName: 'donation_custom_amount_entered',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskDonationHandlers',
  },
  {
    eventName: 'donation_project_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'donationAnalyticsMetadata',
  },
  {
    eventName: 'donation_project_selected',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskDonationHandlers',
  },
  {
    eventName: 'donation_completed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CompletePaymentTransactionUseCase',
  },
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
  { eventName: ANALYTICS_FUNNEL_EVENTS.MENU_OPENED, surface: 'customer', layer: 'FE', required: true, reference: 'useShopScreenEffects' },
  {
    eventName: ANALYTICS_FUNNEL_EVENTS.MENU_OPENED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  { eventName: ANALYTICS_FUNNEL_EVENTS.PRODUCT_SELECTED, surface: 'customer', layer: 'FE', required: true, reference: 'shopScreenHandlers' },
  { eventName: ANALYTICS_FUNNEL_EVENTS.PRODUCT_SELECTED, surface: 'kiosk', layer: 'FE', required: true, reference: 'useKioskOrchestrationRetail' },
  { eventName: ANALYTICS_FUNNEL_EVENTS.QR_DISPLAYED, surface: 'customer', layer: 'FE', required: true, reference: 'QrPaymentView' },
  {
    eventName: ANALYTICS_FUNNEL_EVENTS.QR_DISPLAYED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationAnalyticsEffects',
  },
  {
    eventName: ANALYTICS_UNIVERSAL_EVENTS.QR_REGENERATED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationRealtime',
  },
  { eventName: ANALYTICS_ACCOUNT_EVENTS.RECEIPT_DOWNLOADED, surface: 'customer', layer: 'FE', required: true, reference: 'AccountReceiptDownloadButton' },
  { eventName: 'auth_flow_started', surface: 'customer', layer: 'FE', required: true, reference: 'useSignInScreen' },
  {
    eventName: ANALYTICS_UNIVERSAL_EVENTS.IDENTITY_CREATED,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'OnboardingSetCredentialsScreen',
  },
  {
    eventName: ANALYTICS_UNIVERSAL_EVENTS.SESSION_RECOVERED,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'useCustomerAnalyticsManager',
  },
  {
    eventName: ANALYTICS_UNIVERSAL_EVENTS.CONSENT_BANNER_DISMISSED,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'MarketingAnalyticsConsentModal',
  },
  { eventName: 'slug_legacy_redirect', surface: 'customer', layer: 'FE', required: true, reference: 'useShopScreenEffects' },
  { eventName: 'slug_legacy_redirect', surface: 'server', layer: 'BE', required: true, reference: 'emitRetailV7Analytics' },
  { eventName: ANALYTICS_IDENTITY_EVENTS.IDENTITY_RECOGNIZED, surface: 'customer', layer: 'FE', required: true, reference: 'CustomerAnalyticsProvider' },
  { eventName: 'receipt_opened', surface: 'customer', layer: 'FE', required: true, reference: 'AccountPaymentsPage' },
  { eventName: ANALYTICS_ACCOUNT_EVENTS.ACCOUNT_LOGGED_OUT, surface: 'customer', layer: 'FE', required: true, reference: 'AccountShell' },
  { eventName: 'account_logged_in', surface: 'server', layer: 'BE', required: true, reference: 'LoginWithPasswordUseCase' },
  { eventName: 'account_logged_in', surface: 'server', layer: 'BE', required: true, reference: 'VerifyOtpUseCase' },
  {
    eventName: 'checkout_handoff_created',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CreateCheckoutPaymentHandoffUseCase',
  },
  { eventName: 'account_created', surface: 'server', layer: 'BE', required: true, reference: 'RegisterCustomerUseCase' },
  { eventName: 'tenant_switched', surface: 'server', layer: 'BE', required: true, reference: 'SwitchCustomerTenantUseCase' },
  { eventName: 'retail_pickup_slot_missed', surface: 'server', layer: 'BE', required: true, reference: 'CancelOrderFulfillmentOnPaymentTerminalUseCase' },
  { eventName: ANALYTICS_ACCOUNT_EVENTS.ACCOUNT_LOGGED_OUT, surface: 'server', layer: 'BE', required: true, reference: 'LogoutCustomerSessionUseCase' },
  { eventName: ANALYTICS_ACCOUNT_EVENTS.PROFILE_UPDATED, surface: 'server', layer: 'BE', required: true, reference: 'PutReceiptLocalePreferenceUseCase' },
  { eventName: ANALYTICS_IDENTITY_EVENTS.IDENTITY_LINKED, surface: 'server', layer: 'BE', required: true, reference: 'LinkAccountToTransactionUseCase' },
  { eventName: ANALYTICS_IDENTITY_EVENTS.IDENTITY_DELETED, surface: 'server', layer: 'BE', required: true, reference: 'CustomerErasureSideEffectsService' },
  { eventName: ANALYTICS_IDENTITY_EVENTS.CUSTOMER_DELETED, surface: 'server', layer: 'BE', required: true, reference: 'CustomerErasureSideEffectsService' },
  {
    eventName: 'product_barcode_lookup_hit',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'LookupProductByBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_lookup_miss',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'LookupProductByBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_assigned',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_cleared',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_alt_added',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_alt_removed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_alt_promoted',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  {
    eventName: 'product_barcode_assign_conflict',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ManageProductBarcodeUseCase',
  },
  // Phase 4 P2 — retail fulfillment / commerce server ops (grep-verified UCs)
  {
    eventName: 'retail_ticket_created',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'pickup_staff_mark_paid',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailV7Analytics',
  },
  {
    eventName: 'buy_again_started',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'StartBuyAgainCheckoutUseCase',
  },
  {
    eventName: 'buy_again_trimmed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'StartBuyAgainCheckoutUseCase',
  },
  {
    eventName: 'buy_again_failed_stock',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ValidateBuyAgainAvailabilityUseCase',
  },
  {
    eventName: 'pickup_partial_confirm',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'PartialPickupConfirmUseCase',
  },
  {
    eventName: 'pickup_fulfillment_refused',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'RefuseFulfillmentLinesUseCase',
  },
  {
    eventName: 'pickup_fulfillment_held',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'HoldFulfillmentUseCase',
  },
  {
    eventName: 'pickup_fulfillment_hold_released',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ReleaseFulfillmentHoldUseCase',
  },
  {
    eventName: 'kiosk_cash_complete',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CompleteKioskCashCheckoutUseCase',
  },
  {
    eventName: 'checkout_collect_configured',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CreateCustomerCheckoutSessionUseCase',
  },
  {
    eventName: 'checkout_collect_configured',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'UpdateCustomerCheckoutSessionCollectUseCase',
  },
  {
    eventName: 'physical_card_issued',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'IssuePhysicalCardUseCase',
  },
  {
    eventName: 'physical_card_revoked',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'RevokePhysicalCardUseCase',
  },
  {
    eventName: 'session_completed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CloseAnalyticsSessionUseCase',
  },
  {
    eventName: 'session_abandoned',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CloseAnalyticsSessionUseCase',
  },
  {
    eventName: ANALYTICS_IDENTITY_EVENTS.IDENTITY_LINKED,
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'IngestAnalyticsEventUseCase',
  },
  {
    eventName: 'payment_started',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'ServerAnalyticsEmitter',
  },
  {
    eventName: 'payment_started',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'CreateQRPaymentUseCase',
  },
  // P2 — emit-helper anchors (sessionless commerce / fulfillment)
  {
    eventName: 'retail_order_prepared',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'retail_order_ready',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'retail_order_collected',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'retail_pickup_scheduled',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'retail_pickup_slot_missed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailFulfillmentAnalytics',
  },
  {
    eventName: 'pickup_qr_issued',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailV7Analytics',
  },
  {
    eventName: 'pickup_qr_scanned',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailV7Analytics',
  },
  {
    eventName: 'tenant_switched',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitRetailV7Analytics',
  },
  {
    eventName: 'buy_again_started',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'buy_again_trimmed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'buy_again_failed_stock',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'pickup_partial_confirm',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'pickup_fulfillment_refused',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'pickup_fulfillment_held',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'pickup_fulfillment_hold_released',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'kiosk_cash_complete',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'checkout_collect_configured',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'checkout_handoff_created',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'checkout_handoff_completed',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  // Phase 4 P3 — customer retail / donation FE paths
  {
    eventName: ANALYTICS_RETAIL_EVENTS.SELF_SERVICE_SLA_NOTICE_SHOWN,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'shopScreenHandlers',
  },
  {
    eventName: ANALYTICS_RETAIL_EVENTS.CUSTOMER_PICKUP_ACK_INFORMATIONAL,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'InformationalPickupAckButton',
  },
  {
    eventName: ANALYTICS_ACCOUNT_EVENTS.ACCOUNT_LOGGED_OUT,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationRetail',
  },
  {
    eventName: ANALYTICS_RETAIL_EVENTS.CATALOG_IMAGE_LOAD_FAILED,
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'DonationProjectCard',
  },
  {
    eventName: ANALYTICS_RETAIL_EVENTS.CATALOG_IMAGE_LOAD_FAILED,
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'CustomerDonationProjectCard',
  },
  {
    eventName: 'checkout_started',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
  {
    eventName: 'payment_started',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
  {
    eventName: 'screen_viewed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstProductJourney',
  },
  {
    eventName: 'screen_viewed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PostKioskProductJourney',
  },
  {
    eventName: 'screen_viewed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PostKioskDonationJourney',
  },
  {
    eventName: 'screen_viewed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'donationAnalyticsMetadata',
  },
  {
    eventName: 'checkout_mode_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'useShopScreenEffects',
  },
  {
    eventName: 'back_clicked',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskNavigationHandlers',
  },
  {
    eventName: 'error_shown',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'useKioskOrchestrationRealtime',
  },
  {
    eventName: 'error_shown',
    surface: 'kiosk',
    layer: 'FE',
    required: true,
    reference: 'kioskPaymentFlowHandlers',
  },
  {
    eventName: 'checkout_handoff_expired',
    surface: 'server',
    layer: 'BE',
    required: true,
    reference: 'emitV814CommerceAnalytics',
  },
  {
    eventName: 'session_abandoned',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'CustomerAnalyticsProvider',
  },
  {
    eventName: 'session_abandoned',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'useCustomerAnalyticsManager',
  },
  {
    eventName: 'session_completed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'useCustomerAnalyticsManager',
  },
  {
    eventName: 'session_completed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'CustomerAnalyticsProvider',
  },
  {
    eventName: 'screen_viewed',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
  {
    eventName: 'donation_amount_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
  {
    eventName: 'donation_custom_amount_entered',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
  {
    eventName: 'donation_project_selected',
    surface: 'customer',
    layer: 'FE',
    required: true,
    reference: 'PhoneFirstDonationJourney',
  },
] as const;

/**
 * Phase 4 already-live slice (grep-verified emit paths; G-H-13).
 * `retail_pickup_slot_missed` included only when
 * `CancelOrderFulfillmentOnPaymentTerminalUseCase` emits on `SLOT_MISSED`.
 */
export const ANALYTICS_ALREADY_LIVE_EVENT_NAMES = [
  'tenant_switched',
  'slug_legacy_redirect',
  'recurring_payment_missed',
  'retail_pickup_slot_missed',
] as const satisfies readonly AnalyticsEventName[];

export type AnalyticsAlreadyLiveEventName =
  (typeof ANALYTICS_ALREADY_LIVE_EVENT_NAMES)[number];

export function requiredManifestCellsForEvent(
  eventName: AnalyticsAlreadyLiveEventName,
): readonly AnalyticsEmitterManifestCell[] {
  return ANALYTICS_EMITTER_MANIFEST.filter(
    (cell) => cell.eventName === eventName && cell.required,
  );
}

const ALLOWED_FE_REFERENCES = new Set<string>([
  'shopScreenHandlers',
  'useShopScreenEffects',
  'shopAnalyticsMetadata',
  'useKioskOrchestration',
  'useKioskOrchestrationRetail',
  'useKioskOrchestrationAnalyticsEffects',
  'useKioskOrchestrationRealtime',
  'kioskNavigationHandlers',
  'kioskPaymentFlowHandlers',
  'QrPaymentView',
  'PhoneFirstProductJourney',
  'PhoneFirstDonationJourney',
  'AccountReceiptDownloadButton',
  'useSignInScreen',
  'OnboardingSetCredentialsScreen',
  'useCustomerAnalyticsManager',
  'MarketingAnalyticsConsentModal',
  'CustomerAnalyticsProvider',
  'AccountPaymentsPage',
  'AccountShell',
  'ProductCard',
  'ProductGrid',
  'customerErrorAnalytics',
  'donationAnalyticsMetadata',
  'kioskDonationHandlers',
  'InformationalPickupAckButton',
  'DonationProjectCard',
  'CustomerDonationProjectCard',
  'PostKioskProductJourney',
  'PostKioskDonationJourney',
  'CustomerHubNav',
]);

/** Repo-relative paths for CI grep wiring tests (G3). */
export const ANALYTICS_EMITTER_FE_REFERENCE_PATHS: Readonly<Record<string, string>> = {
  shopAnalyticsMetadata: 'rpapp-customer/src/features/shop/shopAnalyticsMetadata.ts',
  shopScreenHandlers: 'rpapp-customer/src/features/shop/handlers/shopScreenHandlers.ts',
  useShopScreenEffects: 'rpapp-customer/src/features/shop/hooks/useShopScreenEffects.ts',
  useKioskOrchestration: 'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestration.ts',
  useKioskOrchestrationRetail: 'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestrationRetail.ts',
  useKioskOrchestrationAnalyticsEffects:
    'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestrationAnalyticsEffects.ts',
  useKioskOrchestrationRealtime:
    'rpapp-kiosk/src/features/kiosk/hooks/useKioskOrchestrationRealtime.ts',
  kioskNavigationHandlers: 'rpapp-kiosk/src/features/kiosk/handlers/kioskNavigationHandlers.ts',
  kioskPaymentFlowHandlers: 'rpapp-kiosk/src/features/kiosk/handlers/kioskPaymentFlowHandlers.ts',
  QrPaymentView: 'rpapp-customer/src/features/checkout/QrPaymentView.tsx',
  PhoneFirstProductJourney: 'rpapp-customer/src/features/journeys/hooks/usePhoneFirstCheckoutScreen.ts',
  PhoneFirstDonationJourney: 'rpapp-customer/src/features/journeys/hooks/usePhoneFirstDonationJourney.ts',
  AccountReceiptDownloadButton:
    'rpapp-customer/src/features/account/components/AccountReceiptDownloadButton.tsx',
  useSignInScreen: 'rpapp-customer/src/features/auth/hooks/useSignInScreen.ts',
  OnboardingSetCredentialsScreen:
    'rpapp-customer/src/features/auth/OnboardingSetCredentialsScreen.tsx',
  useCustomerAnalyticsManager:
    'rpapp-customer/src/shared/analytics/useCustomerAnalyticsManager.ts',
  MarketingAnalyticsConsentModal:
    'rpapp-customer/src/features/consent/MarketingAnalyticsConsentModal.tsx',
  CustomerAnalyticsProvider: 'rpapp-customer/src/shared/analytics/CustomerAnalyticsProvider.tsx',
  // Retail V1 thin-page / shell refs → emit site in hooks (same pattern as PhoneFirst*).
  AccountPaymentsPage: 'rpapp-customer/src/features/account/hooks/useAccountPaymentsScreen.ts',
  AccountShell: 'rpapp-customer/src/features/account/AccountShell.tsx',
  ProductCard: 'rpapp-customer/src/features/shop/components/ProductCard.tsx',
  ProductGrid: 'rpapp-kiosk/src/features/products/components/ProductGrid/ProductGrid.tsx',
  customerErrorAnalytics: 'rpapp-customer/src/shared/analytics/customerErrorAnalytics.ts',
  donationAnalyticsMetadata:
    'rpapp-customer/src/features/donation/donationAnalyticsMetadata.ts',
  kioskDonationHandlers: 'rpapp-kiosk/src/features/kiosk/handlers/kioskDonationHandlers.ts',
  InformationalPickupAckButton:
    'rpapp-customer/src/features/orders/components/InformationalPickupAckButton.tsx',
  DonationProjectCard:
    'rpapp-kiosk/src/features/donation/components/DonationProjectCard/DonationProjectCard.tsx',
  CustomerDonationProjectCard:
    'rpapp-customer/src/features/donation-projects/components/DonationProjectCard.tsx',
  PostKioskProductJourney:
    'rpapp-customer/src/features/journeys/hooks/usePostKioskProductJourney.ts',
  PostKioskDonationJourney:
    'rpapp-customer/src/features/journeys/hooks/usePostKioskDonationJourney.ts',
  CustomerHubNav: 'rpapp-customer/src/features/hub/CustomerHubNav.tsx',
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
  VerifyOtpUseCase:
    'up-backend/src/application/use-cases/customer-auth/VerifyOtpUseCase.ts',
  CreateCheckoutPaymentHandoffUseCase:
    'up-backend/src/application/use-cases/checkout-handoff/CreateCheckoutPaymentHandoffUseCase.ts',
  LookupProductByBarcodeUseCase:
    'up-backend/src/application/use-cases/product/LookupProductByBarcodeUseCase.ts',
  ManageProductBarcodeUseCase:
    'up-backend/src/application/use-cases/product/barcode/ManageProductBarcodeUseCase.ts',
  RegisterCustomerUseCase:
    'up-backend/src/application/use-cases/customer-auth/RegisterCustomerUseCase.ts',
  SwitchCustomerTenantUseCase:
    'up-backend/src/application/use-cases/customer-auth/SwitchCustomerTenantUseCase.ts',
  CancelOrderFulfillmentOnPaymentTerminalUseCase:
    'up-backend/src/application/use-cases/order/CancelOrderFulfillmentOnPaymentTerminalUseCase.ts',
  CancelIntentUseCase:
    'up-backend/src/application/use-cases/payment/shared/CancelIntentUseCase.ts',
  LogoutCustomerSessionUseCase:
    'up-backend/src/application/use-cases/customer-auth/LogoutCustomerSessionUseCase.ts',
  PutReceiptLocalePreferenceUseCase:
    'up-backend/src/application/use-cases/customer-account/CustomerReceiptLocalePreferenceUseCases.ts',
  LinkAccountToTransactionUseCase:
    'up-backend/src/application/use-cases/customer-auth/LinkAccountToTransactionUseCase.ts',
  CustomerErasureSideEffectsService:
    'up-backend/src/infrastructure/services/gdpr/CustomerErasureSideEffectsService.ts',
  ExpireCheckoutPaymentHandoffWorker:
    'up-backend/src/infrastructure/workers/ExpireCheckoutPaymentHandoffWorker.ts',
  AdminUpdateFulfillmentStatusUseCase:
    'up-backend/src/application/use-cases/order/AdminUpdateFulfillmentStatusUseCase.ts',
  PickupConfirmFulfillmentUseCase:
    'up-backend/src/application/use-cases/order/PickupConfirmFulfillmentUseCase.ts',
  CreateOrderFulfillmentUseCase:
    'up-backend/src/application/use-cases/order/CreateOrderFulfillmentUseCase.ts',
  IssuePickupCredentialsUseCase:
    'up-backend/src/application/use-cases/order/IssuePickupCredentialsUseCase.ts',
  ResolvePickupQrTokenUseCase:
    'up-backend/src/application/use-cases/order/ResolvePickupQrTokenUseCase.ts',
  ResolvePickupByCodeUseCase:
    'up-backend/src/application/use-cases/order/ResolvePickupByCodeUseCase.ts',
  emitRetailFulfillmentAnalytics:
    'up-backend/src/application/services/analytics/emitRetailFulfillmentAnalytics.ts',
  emitRetailV7Analytics: 'up-backend/src/application/services/analytics/emitRetailV7Analytics.ts',
  emitV814CommerceAnalytics:
    'up-backend/src/application/services/analytics/emitV814CommerceAnalytics.ts',
  StartBuyAgainCheckoutUseCase:
    'up-backend/src/application/use-cases/customer-checkout/StartBuyAgainCheckoutUseCase.ts',
  ValidateBuyAgainAvailabilityUseCase:
    'up-backend/src/application/use-cases/customer-checkout/ValidateBuyAgainAvailabilityUseCase.ts',
  PartialPickupConfirmUseCase:
    'up-backend/src/application/use-cases/order/PartialPickupConfirmUseCase.ts',
  RefuseFulfillmentLinesUseCase:
    'up-backend/src/application/use-cases/order/RefuseFulfillmentLinesUseCase.ts',
  HoldFulfillmentUseCase: 'up-backend/src/application/use-cases/order/HoldFulfillmentUseCase.ts',
  ReleaseFulfillmentHoldUseCase:
    'up-backend/src/application/use-cases/order/ReleaseFulfillmentHoldUseCase.ts',
  CompleteKioskCashCheckoutUseCase:
    'up-backend/src/application/use-cases/payment/kiosk/CompleteKioskCashCheckoutUseCase.ts',
  CreateCustomerCheckoutSessionUseCase:
    'up-backend/src/application/use-cases/customer-checkout/CreateCustomerCheckoutSessionUseCase.ts',
  UpdateCustomerCheckoutSessionCollectUseCase:
    'up-backend/src/application/use-cases/customer-checkout/UpdateCustomerCheckoutSessionCollectUseCase.ts',
  IssuePhysicalCardUseCase:
    'up-backend/src/application/use-cases/loyalty/IssuePhysicalCardUseCase.ts',
  RevokePhysicalCardUseCase:
    'up-backend/src/application/use-cases/loyalty/RevokePhysicalCardUseCase.ts',
  CloseAnalyticsSessionUseCase:
    'up-backend/src/application/use-cases/analytics/CloseAnalyticsSessionUseCase.ts',
  IngestAnalyticsEventUseCase:
    'up-backend/src/application/use-cases/analytics/IngestAnalyticsEventUseCase.ts',
  ServerAnalyticsEmitter:
    'up-backend/src/application/use-cases/analytics/ServerAnalyticsEmitter.ts',
};

const ALLOWED_BE_REFERENCES = new Set<string>([
  'StartAnalyticsSessionUseCase',
  'CreateQRPaymentUseCase',
  'CompletePaymentTransactionUseCase',
  'CreatePostKioskAnalyticsChildSessionUseCase',
  'RecurringDonationMissedPeriodWorker',
  'AdvanceRecurringDonationScheduleOnInboundMatch',
  'LoginWithPasswordUseCase',
  'VerifyOtpUseCase',
  'CreateCheckoutPaymentHandoffUseCase',
  'LookupProductByBarcodeUseCase',
  'ManageProductBarcodeUseCase',
  'RegisterCustomerUseCase',
  'SwitchCustomerTenantUseCase',
  'CancelOrderFulfillmentOnPaymentTerminalUseCase',
  'CancelIntentUseCase',
  'LogoutCustomerSessionUseCase',
  'PutReceiptLocalePreferenceUseCase',
  'LinkAccountToTransactionUseCase',
  'CustomerErasureSideEffectsService',
  'ExpireCheckoutPaymentHandoffWorker',
  'AdminUpdateFulfillmentStatusUseCase',
  'PickupConfirmFulfillmentUseCase',
  'CreateOrderFulfillmentUseCase',
  'IssuePickupCredentialsUseCase',
  'ResolvePickupQrTokenUseCase',
  'ResolvePickupByCodeUseCase',
  'emitRetailFulfillmentAnalytics',
  'emitRetailV7Analytics',
  'emitV814CommerceAnalytics',
  'StartBuyAgainCheckoutUseCase',
  'ValidateBuyAgainAvailabilityUseCase',
  'PartialPickupConfirmUseCase',
  'RefuseFulfillmentLinesUseCase',
  'HoldFulfillmentUseCase',
  'ReleaseFulfillmentHoldUseCase',
  'CompleteKioskCashCheckoutUseCase',
  'CreateCustomerCheckoutSessionUseCase',
  'UpdateCustomerCheckoutSessionCollectUseCase',
  'IssuePhysicalCardUseCase',
  'RevokePhysicalCardUseCase',
  'CloseAnalyticsSessionUseCase',
  'IngestAnalyticsEventUseCase',
  'ServerAnalyticsEmitter',
]);

export function validateAnalyticsEmitterManifest(): string[] {
  const errors: string[] = [];
  const catalog = new Set<string>([...ANALYTICS_EVENT_NAMES]);

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
