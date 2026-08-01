import { isAuditEventCode, type AuditEventCode } from './auditEventCodes.js';
import { AUDIT_EVENT_LABELS } from './auditEventLabels.js';
import {
  resolveLocalizedLabel,
  type LabelAudience,
  type LabelLocale,
} from './labels/localizedLabel.js';

export function getAuditEventLabel(
  code: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAuditEventCode(code)) {
    return code;
  }
  return resolveLocalizedLabel(AUDIT_EVENT_LABELS[code as AuditEventCode], locale);
}
