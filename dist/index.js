/**
 * Pi Kiosk Shared Package
 *
 * Exports shared types, API contracts, error classes, and utilities
 * for use across kiosk, admin, customer, pickup, and backend.
 *
 * Main barrel is Node-safe (no React UI). Runtime JS (not `.d.ts`):
 * - `tsx watch` and `node dist/server.js` both resolve `node_modules/pi-kiosk-shared`
 *   after `ensureDist.mjs` overlays this `dist` (monorepo sibling `../shared` @ 2.2.91;
 *   consumers pin ^2.2.91 matching shared/package.json — confirm registry at deploy time).
 * React UI is `pi-kiosk-shared/ui`.
 *
 * Note: relative imports use explicit `.js` extensions so the compiled
 * `dist/*.js` is consumable by native Node ESM (e.g. backend running
 * under tsx). Without extensions, Node fails to enumerate re-exports
 * for named imports across the `export * from` chain.
 */
export * from './types.js';
export * from './kiosk/kioskPublicConfig.js';
export * from './sales-point/salesPointPublicConfig.js';
export { parsePaymentRailsKioskFromCommerceConfig, parsePaymentRailsMobileFromCommerceConfig, } from './sales-point/salesPointPublicConfig.js';
export * from './loyalty/types.js';
export * from './loyalty/loyaltySessionHandoff.js';
export * from './api.js';
export * from './errors.js';
export * from './analyticsEvents.js';
export * from './analyticsEmitterManifest.js';
export * from './analyticsPiiTags.js';
export * from './analyticsConsentTier2.js';
export * from './analyticsConsentAllowlist.js';
export * from './analytics/metadataBuilders.js';
export * from './analytics/missionControl.js';
export * from './analytics/devAnalyticsViewsWire.js';
export * from './analytics/tenantCommandCenter.js';
export * from './analytics/platformCommandCenter.js';
export * from './analytics/retailOrderEvents.js';
export * from './analyticsExploreCaps.js';
export * from './analyticsApiTypes.js';
export * from './analyticsAnonymousIdentity.js';
export * from './analyticsEmitDedup.js';
export * from './auditEventCodes.js';
export * from './auditEventLabels.js';
export * from './analyticsEventLabels.js';
export * from './getAuditEventLabel.js';
export * from './getAnalyticsEventLabel.js';
export * from './analyticsEventDescriptions.js';
export * from './getAnalyticsEventDescription.js';
export * from './auditEventDescriptions.js';
export * from './getAuditEventDescription.js';
export * from './auditMetadataDisplayFields.js';
export * from './complianceDevCaps.js';
export * from './customerFailureRecovery.js';
export * from './labels/localizedLabel.js';
export * from './labels/localizedNameMap.js';
export * from './clientLogRedaction.js';
export { SHARED_SENSITIVE_META_KEYS, } from './sensitiveMetaKeys.js';
export * from './catalogImageUrl.js';
export * from './catalogImageTelemetry.js';
export * from './buildKioskLineKey.js';
export * from './commerce/reservedSalesPointSlugs.js';
export * from './catalogMediaPatch.js';
export * from './checkout/sessionMetadataV3.js';
export * from './checkout/sessionMetadataV4.js';
export * from './checkout/sessionMetadataV5.js';
export * from './checkout/CartLineFingerprint.js';
export * from './order/index.js';
export * from './contracts/inventory/index.js';
export * from './promo/promoSessionHandoff.js';
export * from './promo/resolvePromoLoyaltyStack.js';
export * from './promo/PromoCodeErrorCode.js';
export * from './promo/ApplyPromoCodeRequest.js';
export * from './promo/ApplyPromoCodeResponse.js';
export * from './promo/resolveApplyPromoEventDisplayName.js';
export * from './promo/RemovePromoCodeRequest.js';
export { resolvePromotionsProgramEnabled, resolvePromotionsProgramEnabledFromCommerceConfig, } from './promo/resolvePromotionsProgramEnabled.js';
export * from './catalogImagePresentation.js';
export * from './directoryMonogram.js';
export * from './branding/consumerSquareLogo.js';
export * from './branding/logoChipBackground.js';
export * from './branding/logoChipRim.js';
export * from './branding/logoChipMarkStyle.js';
export * from './branding/signedMediaUrlStability.js';
export * from './tenant/tenantPathResolution.js';
export * from './tenant/tenantLifecycle.js';
export { PERMISSION_DOMAIN_LABELS, PERMISSION_LEVEL_LABELS, PERMISSION_RESOURCE_LABELS, getPermissionDomainLabel, getPermissionLevelLabel, getPermissionResourceTitle, } from './permissions/permissionLabels.js';
export { expandCapabilitiesForClientCheck, grantImpliesTarget, hasEffectiveCapability, hasAnyEffectiveCapability, ADMIN_USERS_MANAGE_BRIDGE_SOURCES, ADMIN_USERS_MANAGE_BRIDGE_TARGETS, BRIDGE_PARITY_FIXTURE_GRANTS, BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS, } from './permissions/effectiveCapabilities.js';
export { TENANT_ADMIN_EVENTS_SUBSCRIBE, TENANT_ADMIN_USERS_VIEW, TENANT_ADMIN_USERS_MANAGE, TENANT_RECONCILIATION_READ, TENANT_BANK_INBOX_MANAGE, TENANT_PAYMENT_CLAIMS_APPROVE, } from './permissions/canonicalCapabilityIds.js';
export { TURNSTILE_PUBLIC_CONFIG_PATH, fetchTurnstileConfig, appendTurnstileToken, TurnstileConfigFetchError, } from './auth/turnstileTypes.js';
export { CUSTOMER_CONTACT_POLICY_MODES, resolveContactIdentifierCopyKind, resolveContactIdentifierInputMode, resolvePasswordIdentifierCopyKind, } from './auth/customerContactPolicy.js';
export { DEFAULT_CUSTOMER_CONTACT_POLICY_PAYLOAD, normalizePhoneToE164, passwordAllowsPhoneLookup, resolveOtpIdentifierCopyVariant, resolvePasswordIdentifierCopyVariant, resolveSignInIdentifierInputMode, } from './auth/customerContactPolicyUi.js';
export { isRateLimitError, getRetryAfterMs } from './http/rateLimitError.js';
export { computePollRetryDelayMs, isServerOverloadPollError, } from './http/pollRetryBackoff.js';
export { formatRateLimitMessage } from './errors/formatRateLimitMessage.js';
export { pickLocalizedApiMessage } from './errors/pickLocalizedApiMessage.js';
export { createCoalescedRefetchScheduler, } from './catalog/createCoalescedRefetchScheduler.js';
export { sha256Hex, isRealtimeEnvelope, verifyEnvelopeChecksum, isSupportedRealtimeEnvelopeVersion, SUPPORTED_REALTIME_EVENT_VERSION, REALTIME_SSE_VALIDATION_CODES, parseRealtimeCatalogSseMessage, unwrapRealtimeCatalogSsePayload, normalizeRealtimeCatalogSseEventData, } from './realtime/index.js';
export { resolvePickupHandoffModeForCheckout } from './checkout/resolvePickupHandoffModeForCheckout.js';
export * from './barcode/index.js';
export * from './tenant-entitlements/index.js';
export * from './screenState/types.js';
export { normalizeIban } from './payment/normalizeIban.js';
export { extractCzBankCode, isFioEligibleBankAccount, } from './payment/isFioEligibleBankAccount.js';
export { resolveAppBuildLabel } from './utils/resolveAppBuildLabel.js';
export { buildPaymentSurfaceReadiness, countCustomerPayableVerifiedMethods, countKioskPayableVerifiedMethods, derivePaymentSurfaceMethodVerified, isCashMethodPayableForCount, isMethodPayableForCount, } from './payment/PaymentSurfaceReadiness.js';
//# sourceMappingURL=index.js.map