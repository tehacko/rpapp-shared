/**
 * Shared SSOT capability / canonical permission ID constants (permission SSOT).
 * Keep in sync with up-backend CapabilityMap + CanonicalPermissionPolicy.
 */

/** Admin SSE subscribe + backfill (ADM-TKT-0210). Capability-only AuthZ. */
export const TENANT_ADMIN_EVENTS_SUBSCRIBE = 'tenant.adminEvents.subscribe' as const;

/** Tenant users list/read — aliases users:view:read. FORBIDDEN: invent users:admins:read. */
export const TENANT_ADMIN_USERS_VIEW = 'tenant.adminUsers.view' as const;

/** Tenant users manage — aliases users:admins:create + users:view:manage. */
export const TENANT_ADMIN_USERS_MANAGE = 'tenant.adminUsers.manage' as const;

/** Payments hub chrome interim (ADV-HUB-PERM-001; TARGET tenant.paymentsHub.read). */
export const TENANT_RECONCILIATION_READ = 'tenant.reconciliation.read' as const;

export const TENANT_BANK_INBOX_MANAGE = 'tenant.bankInbox.manage' as const;

export const TENANT_PAYMENT_CLAIMS_APPROVE = 'tenant.paymentClaims.approve' as const;
