import { isAuditEventCode, type AuditEventCode } from './auditEventCodes.js';
import { AUDIT_EVENT_DESCRIPTIONS } from './auditEventDescriptions.js';
import type { LabelAudience, LabelLocale } from './labels/localizedLabel.js';

export function getAuditEventDescription(
  code: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAuditEventCode(code)) {
    return '';
  }
  return AUDIT_EVENT_DESCRIPTIONS[code as AuditEventCode][locale];
}
