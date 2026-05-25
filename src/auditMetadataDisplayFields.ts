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
};

export function getAuditMetadataDisplayFields(
  eventCode: string,
): readonly AuditMetadataDisplayField[] {
  return AUDIT_METADATA_DISPLAY_FIELDS[eventCode as AuditEventCode] ?? [];
}
