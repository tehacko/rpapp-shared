/**
 * Pi Kiosk Shared Package
 *
 * Exports shared types, API contracts, error classes, and utilities
 * for use across kiosk, admin, and backend applications.
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
export * from './components/DatabaseUnavailable.js';
export * from './hooks/useDatabaseHealth.js';
export { useSubmitCooldown, type UseSubmitCooldownResult } from './hooks/useSubmitCooldown.js';
export * from './analyticsEvents.js';
export * from './analyticsEmitterManifest.js';
export * from './analyticsPiiTags.js';
export * from './analyticsConsentTier2.js';
export * from './analyticsConsentAllowlist.js';
export * from './analytics/metadataBuilders.js';
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
export * from './clientLogRedaction.js';
export * from './catalogImageUrl.js';
export * from './catalogImageTelemetry.js';
export * from './buildKioskLineKey.js';
export * from './commerce/reservedSalesPointSlugs.js';
export * from './catalogMediaPatch.js';
export * from './checkout/sessionMetadataV3.js';
export * from './checkout/sessionMetadataV4.js';
export * from './catalogImagePresentation.js';
export * from './CatalogImagePlaceholder.js';
export * from './tenant/tenantPathResolution.js';
export { PERMISSION_DOMAIN_LABELS, PERMISSION_LEVEL_LABELS, getPermissionDomainLabel, getPermissionLevelLabel, } from './permissions/permissionLabels.js';
export { expandCapabilitiesForClientCheck, grantImpliesTarget, hasEffectiveCapability, hasAnyEffectiveCapability, ADMIN_USERS_MANAGE_BRIDGE_SOURCES, ADMIN_USERS_MANAGE_BRIDGE_TARGETS, BRIDGE_PARITY_FIXTURE_GRANTS, BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS, } from './permissions/effectiveCapabilities.js';
export type { PermissionLevel } from './permissions/permissionLabels.js';
export { TURNSTILE_PUBLIC_CONFIG_PATH, fetchTurnstileConfig, appendTurnstileToken, } from './auth/turnstileTypes.js';
export type { TurnstileConfigData, TurnstileAuthBodyFields, AdminLoginRequest, ExchangeSuperAdminInviteSessionRequest, CompleteSuperAdminInviteRequest, PickupStaffLoginRequest, CustomerAuthTurnstileBody, } from './auth/turnstileTypes.js';
export { isRateLimitError, getRetryAfterMs } from './http/rateLimitError.js';
export { computePollRetryDelayMs, isServerOverloadPollError, type PollRetryBackoffOptions, } from './http/pollRetryBackoff.js';
export { formatRateLimitMessage } from './errors/formatRateLimitMessage.js';
export { createCoalescedRefetchScheduler, type CoalescedRefetchScheduler, } from './catalog/createCoalescedRefetchScheduler.js';
export { resolvePickupHandoffModeForCheckout } from './checkout/resolvePickupHandoffModeForCheckout.js';
export * from './barcode/index.js';
export * from './tenant-entitlements/index.js';
export * from './screenState/types.js';
export { ProviderIcon, PROVIDER_ICON_ASSET_IDS, resolveProviderIconAssetId, type ProviderIconAssetId, type ProviderIconProps, type ProviderIconSize, } from './ui/ProviderIcon/index.js';
//# sourceMappingURL=index.d.ts.map