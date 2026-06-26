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
};

export function getAuditMetadataDisplayFields(
  eventCode: string,
): readonly AuditMetadataDisplayField[] {
  return AUDIT_METADATA_DISPLAY_FIELDS[eventCode as AuditEventCode] ?? [];
}
