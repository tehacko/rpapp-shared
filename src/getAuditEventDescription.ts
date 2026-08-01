import { isAuditEventCode, type AuditEventCode } from './auditEventCodes.js';
import { AUDIT_EVENT_DESCRIPTIONS } from './auditEventDescriptions.js';
import {
  resolveLocalizedLabel,
  type LabelAudience,
  type LabelLocale,
} from './labels/localizedLabel.js';

export function getAuditEventDescription(
  code: string,
  locale: LabelLocale,
  _audience: LabelAudience = 'operator',
): string {
  if (!isAuditEventCode(code)) {
    return '';
  }
  return resolveLocalizedLabel(AUDIT_EVENT_DESCRIPTIONS[code as AuditEventCode], locale);
}
