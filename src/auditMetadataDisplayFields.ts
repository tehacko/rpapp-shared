import type { AuditEventCode } from './auditEventCodes.js';

export interface AuditMetadataDisplayField {
  readonly key: string;
  readonly labelKey: string;
}

/** Drawer highlight fields per event code (AUTH + GDPR minimum for Phase 2). */
export const AUDIT_METADATA_DISPLAY_FIELDS: Partial<
  Record<AuditEventCode, readonly AuditMetadataDisplayField[]>
> = {
  'auth.admin.login.success': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.login.failed': [
    { key: 'attemptedUsername', labelKey: 'compliance.audit.metadata.attemptedUsername' },
  ],
  'auth.admin.logout': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.access.denied': [
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
    { key: 'route', labelKey: 'compliance.audit.metadata.route' },
  ],
  'auth.admin.password_reset.requested': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.password_reset.completed': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.password_reset.failed': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.mfa.enroll.success': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.mfa.enroll.failed': [
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.mfa.disable.success': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.mfa.disable.failed': [
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.mfa.challenge.success': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'auth.admin.mfa.challenge.failed': [
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.step_up.success': [
    { key: 'stepUpUntil', labelKey: 'compliance.audit.metadata.stepUpUntil' },
  ],
  'auth.admin.step_up.failed': [
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.break_glass.success': [
    { key: 'incidentId', labelKey: 'compliance.audit.metadata.incidentId' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.break_glass.failed': [
    { key: 'failureReason', labelKey: 'compliance.audit.metadata.failureReason' },
  ],
  'auth.admin.oidc.login.success': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
    { key: 'surface', labelKey: 'compliance.audit.metadata.surface' },
  ],
  'auth.admin.oidc.login.failed': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.oidc.invite.activated': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
    { key: 'adminUserId', labelKey: 'compliance.audit.metadata.adminUserId' },
  ],
  'auth.admin.oidc.link.created': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
  ],
  'auth.admin.oidc.link.removed': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
  ],
  'auth.admin.oidc.link.remove_denied': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'auth.admin.oidc.session.exchanged': [
    { key: 'surface', labelKey: 'compliance.audit.metadata.surface' },
    { key: 'purpose', labelKey: 'compliance.audit.metadata.purpose' },
  ],
  'auth.admin.password.set': [
    { key: 'authChannel', labelKey: 'compliance.audit.metadata.authChannel' },
  ],
  'customer.oidc.login': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
  ],
  'customer.oidc.email_merged': [
    { key: 'provider', labelKey: 'compliance.audit.metadata.provider' },
  ],
  'admin.capability.granted': [
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'admin.capability.revoked': [
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
  ],
  'admin.capability.template_applied': [
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'templateId', labelKey: 'compliance.audit.metadata.templateId' },
    { key: 'capabilityCount', labelKey: 'compliance.audit.metadata.capabilityCount' },
  ],
  'admin.exception_grant.requested': [
    { key: 'approvalRequestId', labelKey: 'compliance.audit.metadata.approvalRequestId' },
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
  ],
  'admin.exception_grant.approved': [
    { key: 'approvalRequestId', labelKey: 'compliance.audit.metadata.approvalRequestId' },
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
  ],
  'admin.exception_grant.rejected': [
    { key: 'approvalRequestId', labelKey: 'compliance.audit.metadata.approvalRequestId' },
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
  ],
  'admin.exception_grant.executed': [
    { key: 'approvalRequestId', labelKey: 'compliance.audit.metadata.approvalRequestId' },
    { key: 'targetUserId', labelKey: 'compliance.audit.metadata.targetUserId' },
    { key: 'capability', labelKey: 'compliance.audit.metadata.capability' },
  ],
  'gdpr.erasure.completed': [
    { key: 'dataSubjectRequestId', labelKey: 'compliance.audit.metadata.dataSubjectRequestId' },
    { key: 'customersAnonymized', labelKey: 'compliance.audit.metadata.customersAnonymized' },
  ],
  'gdpr.erasure.side_effects_pending': [
    { key: 'dataSubjectRequestId', labelKey: 'compliance.audit.metadata.dataSubjectRequestId' },
    { key: 'customerId', labelKey: 'compliance.audit.metadata.customerId' },
  ],
  'admin.category.deactivated': [{ key: 'categoryId', labelKey: 'compliance.audit.metadata.categoryId' }],
  'admin.category.reactivated': [{ key: 'categoryId', labelKey: 'compliance.audit.metadata.categoryId' }],
  'admin.category.permanently_deleted': [{ key: 'categoryId', labelKey: 'compliance.audit.metadata.categoryId' }],
  'admin.variant.archived': [{ key: 'variantId', labelKey: 'compliance.audit.metadata.variantId' }],
  'admin.variant.restored': [{ key: 'variantId', labelKey: 'compliance.audit.metadata.variantId' }],
  'admin.variant.permanently_deleted': [{ key: 'variantId', labelKey: 'compliance.audit.metadata.variantId' }],
  'admin.pickupPoint.deactivated': [{ key: 'pickupPointId', labelKey: 'compliance.audit.metadata.pickupPointId' }],
  'admin.pickupPoint.reactivated': [{ key: 'pickupPointId', labelKey: 'compliance.audit.metadata.pickupPointId' }],
  'admin.pickupPoint.permanently_deleted': [{ key: 'pickupPointId', labelKey: 'compliance.audit.metadata.pickupPointId' }],
  'admin.donationProject.deactivated': [
    { key: 'donationProjectId', labelKey: 'compliance.audit.metadata.donationProjectId' },
  ],
  'admin.donationProject.reactivated': [
    { key: 'donationProjectId', labelKey: 'compliance.audit.metadata.donationProjectId' },
  ],
  'admin.donationProject.archived': [
    { key: 'donationProjectId', labelKey: 'compliance.audit.metadata.donationProjectId' },
  ],
  'admin.customerMembership.suspended': [
    { key: 'customerMembershipId', labelKey: 'compliance.audit.metadata.customerMembershipId' },
  ],
  'admin.retention.policy_updated': [
    { key: 'changedPlanIds', labelKey: 'compliance.audit.metadata.changedPlanIds' },
    { key: 'dryRun', labelKey: 'compliance.audit.metadata.dryRun' },
  ],
  'payment.provider_wiring.verified': [
    { key: 'providerSlotId', labelKey: 'compliance.audit.metadata.providerSlotId' },
    { key: 'bankAccountId', labelKey: 'compliance.audit.metadata.bankAccountId' },
  ],
  'payment.provider_wiring.verify_failed': [
    { key: 'providerSlotId', labelKey: 'compliance.audit.metadata.providerSlotId' },
    { key: 'summary', labelKey: 'compliance.audit.metadata.summary' },
  ],
  'payment.provider_wiring.invalidated': [
    { key: 'providerSlotId', labelKey: 'compliance.audit.metadata.providerSlotId' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'admin.product.created': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
  ],
  'admin.product.price_updated': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'changeKind', labelKey: 'compliance.audit.metadata.changeKind' },
    { key: 'price', labelKey: 'compliance.audit.metadata.price' },
    { key: 'previousPrice', labelKey: 'compliance.audit.metadata.previousPrice' },
  ],
  'admin.product.stock_adjusted': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'salesPointId', labelKey: 'compliance.audit.metadata.salesPointId' },
    { key: 'quantity', labelKey: 'compliance.audit.metadata.quantity' },
  ],
  'admin.product.barcode_assigned': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'barcode', labelKey: 'compliance.audit.metadata.barcode' },
    { key: 'source', labelKey: 'compliance.audit.metadata.source' },
    { key: 'salesPointId', labelKey: 'compliance.audit.metadata.salesPointId' },
  ],
  'admin.product.barcode_cleared': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'source', labelKey: 'compliance.audit.metadata.source' },
    { key: 'salesPointId', labelKey: 'compliance.audit.metadata.salesPointId' },
  ],
  'admin.product.barcode_alt_added': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'barcode', labelKey: 'compliance.audit.metadata.barcode' },
    { key: 'source', labelKey: 'compliance.audit.metadata.source' },
  ],
  'admin.product.barcode_alt_removed': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'barcode', labelKey: 'compliance.audit.metadata.barcode' },
    { key: 'source', labelKey: 'compliance.audit.metadata.source' },
  ],
  'admin.product.barcode_alt_promoted': [
    { key: 'productId', labelKey: 'compliance.audit.metadata.productId' },
    { key: 'barcode', labelKey: 'compliance.audit.metadata.barcode' },
    { key: 'source', labelKey: 'compliance.audit.metadata.source' },
  ],
  'pickup.device.paired': [
    { key: 'deviceLabel', labelKey: 'compliance.audit.metadata.deviceLabel' },
    { key: 'deviceCode', labelKey: 'compliance.audit.metadata.deviceCode' },
    { key: 'salesPointId', labelKey: 'compliance.audit.metadata.salesPointId' },
  ],
  'pickup.device.pairing.failed': [
    { key: 'salesPointId', labelKey: 'compliance.audit.metadata.salesPointId' },
    { key: 'reason', labelKey: 'compliance.audit.metadata.reason' },
  ],
  'pickup.fulfillment.claim.acquired': [
    { key: 'fulfillmentId', labelKey: 'compliance.audit.metadata.fulfillmentId' },
    { key: 'deviceLabel', labelKey: 'compliance.audit.metadata.deviceLabel' },
    { key: 'claimExpiresAt', labelKey: 'compliance.audit.metadata.claimExpiresAt' },
  ],
  'pickup.fulfillment.claim.released': [
    { key: 'fulfillmentId', labelKey: 'compliance.audit.metadata.fulfillmentId' },
    { key: 'deviceLabel', labelKey: 'compliance.audit.metadata.deviceLabel' },
    { key: 'version', labelKey: 'compliance.audit.metadata.version' },
  ],
  'admin.loyalty.physical_card_issued': [
    { key: 'cardId', labelKey: 'compliance.audit.metadata.cardId' },
    { key: 'displayHint', labelKey: 'compliance.audit.metadata.displayHint' },
  ],
  'admin.loyalty.physical_card_revoked': [
    { key: 'cardId', labelKey: 'compliance.audit.metadata.cardId' },
  ],
};

export function getAuditMetadataDisplayFields(
  eventCode: string,
): readonly AuditMetadataDisplayField[] {
  return AUDIT_METADATA_DISPLAY_FIELDS[eventCode as AuditEventCode] ?? [];
}
