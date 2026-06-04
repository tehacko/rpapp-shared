import { AUDIT_EVENT_CODES, type AuditEventCode } from './auditEventCodes.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing audit event labels — every catalog code has distinct cs + en. */
const AUDIT_LABEL_OVERRIDES: Record<AuditEventCode, LocalizedLabel> = {
  'auth.admin.login.success': {
    en: 'Admin login succeeded',
    cs: 'Přihlášení administrátora úspěšné',
  },
  'auth.admin.login.failed': {
    en: 'Admin login failed',
    cs: 'Přihlášení administrátora selhalo',
  },
  'auth.admin.logout': {
    en: 'Admin logout',
    cs: 'Odhlášení administrátora',
  },
  'auth.admin.access.denied': {
    en: 'Access denied',
    cs: 'Přístup odepřen',
  },
  'admin.invite.created': {
    en: 'Admin invite created',
    cs: 'Pozvánka administrátora vytvořena',
  },
  'admin.invite.resent': {
    en: 'Admin invite resent',
    cs: 'Pozvánka administrátora znovu odeslána',
  },
  'admin.invite.activated': {
    en: 'Admin invite activated',
    cs: 'Pozvánka administrátora aktivována',
  },
  'admin.account.username_changed': {
    en: 'Admin username changed',
    cs: 'Změna přihlašovacího jména',
  },
  'admin.account.password_changed': {
    en: 'Admin password changed',
    cs: 'Změna hesla administrátora',
  },
  'admin.credentials.provider_secret.set': {
    en: 'Payment provider secret set',
    cs: 'Nastavení klíče platebního poskytovatele',
  },
  'admin.credentials.provider_secret.rotated': {
    en: 'Payment provider secret rotated',
    cs: 'Výměna klíče platebního poskytovatele',
  },
  'admin.credentials.provider_secret.deleted': {
    en: 'Payment provider secret deleted',
    cs: 'Smazání klíče platebního poskytovatele',
  },
  'admin.credentials.bank_secret.set': {
    en: 'Bank transfer settings saved',
    cs: 'Uložení nastavení bankovního převodu',
  },
  'admin.credentials.bank_secret.rotated': {
    en: 'Bank transfer settings updated',
    cs: 'Aktualizace nastavení bankovního převodu',
  },
  'admin.settings.updated': {
    en: 'Settings updated',
    cs: 'Nastavení změněna',
  },
  'admin.user.created': {
    en: 'Admin user created',
    cs: 'Administrátor vytvořen',
  },
  'admin.user.deactivated': {
    en: 'Admin user deactivated',
    cs: 'Administrátor deaktivován',
  },
  'admin.user.reactivated': {
    en: 'Admin user reactivated',
    cs: 'Administrátor znovu aktivován',
  },
  'admin.user.permanently_deleted': {
    en: 'Admin user permanently deleted',
    cs: 'Administrátor trvale smazán',
  },
  'admin.product.deactivated': {
    en: 'Product deactivated',
    cs: 'Produkt deaktivován',
  },
  'admin.product.reactivated': {
    en: 'Product reactivated',
    cs: 'Produkt znovu aktivován',
  },
  'admin.product.permanently_deleted': {
    en: 'Product permanently deleted',
    cs: 'Produkt trvale smazán',
  },
  'admin.kiosk.deactivated': {
    en: 'Kiosk deactivated',
    cs: 'Kiosk deaktivován',
  },
  'admin.kiosk.reactivated': {
    en: 'Kiosk reactivated',
    cs: 'Kiosk znovu aktivován',
  },
  'admin.kiosk.permanently_deleted': {
    en: 'Kiosk permanently deleted',
    cs: 'Kiosk trvale smazán',
  },
  'admin.tenant.deactivated': {
    en: 'Organization deactivated',
    cs: 'Organizace deaktivována',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Organization permanently deleted',
    cs: 'Organizace trvale smazána',
  },
  'admin.tenant.reactivated': {
    en: 'Organization reactivated',
    cs: 'Organizace znovu aktivována',
  },
  'admin.donation_template.created': {
    en: 'Donation amount template created',
    cs: 'Šablona částek daru vytvořena',
  },
  'admin.donation_template.updated': {
    en: 'Donation amount template updated',
    cs: 'Šablona částek daru upravena',
  },
  'admin.donation_template.default_set': {
    en: 'Default donation template set',
    cs: 'Výchozí šablona daru nastavena',
  },
  'admin.kiosk.donation_projects.updated': {
    en: 'Kiosk donation projects updated',
    cs: 'Projekty daru na kiosku upraveny',
  },
  'admin.kiosk.donation_amounts.updated': {
    en: 'Kiosk donation amounts updated',
    cs: 'Částky daru na kiosku upraveny',
  },
  'dev.tenant.created': {
    en: 'Organization created (platform)',
    cs: 'Organizace založena (platforma)',
  },
  'dev.tenant.updated': {
    en: 'Organization updated (platform)',
    cs: 'Organizace upravena (platforma)',
  },
  'dev.tenant.provider.updated': {
    en: 'Organization provider updated (platform)',
    cs: 'Poskytovatel organizace upraven (platforma)',
  },
  'payment.transaction.state_changed': {
    en: 'Payment status changed',
    cs: 'Změna stavu platby',
  },
  'payment.admin_manual_complete': {
    en: 'Order marked paid (admin)',
    cs: 'Objednávka označena jako zaplacená (admin)',
  },
  'payment.customer.refund.requested': {
    en: 'Customer refund requested',
    cs: 'Zákazník požádal o vrácení',
  },
  'reconciliation.transaction.refund_candidate.marked': {
    en: 'Refund check marked',
    cs: 'Označeno ke kontrole vrácení',
  },
  'reconciliation.transaction.refund_candidate.unmarked': {
    en: 'Refund check cleared',
    cs: 'Zrušeno označení vrácení',
  },
  'export.analytics.explore.exported': {
    en: 'Customer behavior export',
    cs: 'Export chování zákazníků',
  },
  'export.analytics.rollups.materialized': {
    en: 'Analytics rollups materialized',
    cs: 'Analytické agregace materializovány',
  },
  'gdpr.erasure.completed': {
    en: 'GDPR erasure completed',
    cs: 'GDPR výmaz dokončen',
  },
};

function buildAuditLabels(): Record<AuditEventCode, LocalizedLabel> {
  const labels = {} as Record<AuditEventCode, LocalizedLabel>;
  for (const code of AUDIT_EVENT_CODES) {
    labels[code] = AUDIT_LABEL_OVERRIDES[code];
  }
  return labels;
}

export const AUDIT_EVENT_LABELS: Record<AuditEventCode, LocalizedLabel> = buildAuditLabels();
