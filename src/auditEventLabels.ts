import { AUDIT_EVENT_CODES, type AuditEventCode } from './auditEventCodes.js';
import { dotNotationToLabel, type LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing audit event labels (cs + en). */
const AUDIT_LABEL_OVERRIDES: Partial<Record<AuditEventCode, LocalizedLabel>> = {
  'auth.admin.login.success': { en: 'Admin login succeeded', cs: 'Přihlášení administrátora úspěšné' },
  'auth.admin.login.failed': { en: 'Admin login failed', cs: 'Přihlášení administrátora selhalo' },
  'auth.admin.logout': { en: 'Admin logout', cs: 'Odhlášení administrátora' },
  'auth.admin.access.denied': { en: 'Access denied', cs: 'Přístup odepřen' },
  'gdpr.erasure.completed': { en: 'GDPR erasure completed', cs: 'GDPR výmaz dokončen' },
  'export.analytics.explore.exported': {
    en: 'Analytics explore export',
    cs: 'Export průzkumu analytiky',
  },
  'payment.transaction.state_changed': {
    en: 'Payment transaction state changed',
    cs: 'Změna stavu platební transakce',
  },
};

function buildAuditLabels(): Record<AuditEventCode, LocalizedLabel> {
  const labels = {} as Record<AuditEventCode, LocalizedLabel>;
  for (const code of AUDIT_EVENT_CODES) {
    labels[code] = AUDIT_LABEL_OVERRIDES[code] ?? dotNotationToLabel(code);
  }
  return labels;
}

export const AUDIT_EVENT_LABELS: Record<AuditEventCode, LocalizedLabel> = buildAuditLabels();
