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
export * from './api.js';
export * from './errors.js';
export * from './components/DatabaseUnavailable.js';
export * from './hooks/useDatabaseHealth.js';
export * from './analyticsEvents.js';
export * from './analyticsExploreCaps.js';
export * from './analyticsApiTypes.js';
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
export { PERMISSION_DOMAIN_LABELS, PERMISSION_LEVEL_LABELS, getPermissionDomainLabel, getPermissionLevelLabel, } from './permissions/permissionLabels.js';
export { expandCapabilitiesForClientCheck, grantImpliesTarget, hasEffectiveCapability, hasAnyEffectiveCapability, ADMIN_USERS_MANAGE_BRIDGE_SOURCES, ADMIN_USERS_MANAGE_BRIDGE_TARGETS, BRIDGE_PARITY_FIXTURE_GRANTS, BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS, } from './permissions/effectiveCapabilities.js';
export type { PermissionLevel } from './permissions/permissionLabels.js';
//# sourceMappingURL=index.d.ts.map