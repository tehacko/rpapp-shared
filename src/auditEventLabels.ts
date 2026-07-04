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
  'admin.category.deactivated': {
    en: 'Category deactivated',
    cs: 'Kategorie deaktivována',
  },
  'admin.category.reactivated': {
    en: 'Category reactivated',
    cs: 'Kategorie znovu aktivována',
  },
  'admin.category.permanently_deleted': {
    en: 'Category permanently deleted',
    cs: 'Kategorie trvale smazána',
  },
  'admin.variant.archived': {
    en: 'Variant archived',
    cs: 'Varianta archivována',
  },
  'admin.variant.restored': {
    en: 'Variant restored',
    cs: 'Varianta obnovena',
  },
  'admin.variant.permanently_deleted': {
    en: 'Variant permanently deleted',
    cs: 'Varianta trvale smazána',
  },
  'admin.pickupPoint.deactivated': {
    en: 'Pickup point deactivated',
    cs: 'Odběrné místo deaktivováno',
  },
  'admin.pickupPoint.reactivated': {
    en: 'Pickup point reactivated',
    cs: 'Odběrné místo znovu aktivováno',
  },
  'admin.pickupPoint.permanently_deleted': {
    en: 'Pickup point permanently deleted',
    cs: 'Odběrné místo trvale smazáno',
  },
  'admin.donationProject.deactivated': {
    en: 'Donation project deactivated',
    cs: 'Dárcovský projekt deaktivován',
  },
  'admin.donationProject.reactivated': {
    en: 'Donation project reactivated',
    cs: 'Dárcovský projekt znovu aktivován',
  },
  'admin.donationProject.archived': {
    en: 'Donation project archived',
    cs: 'Dárcovský projekt archivován',
  },
  'admin.customerMembership.suspended': {
    en: 'Customer membership suspended',
    cs: 'Členství zákazníka pozastaveno',
  },
  'admin.retention.policy_updated': {
    en: 'Retention policy updated',
    cs: 'Retenční politika upravena',
  },
  'admin.salesPoint.deactivated': {
    en: 'Sales point deactivated',
    cs: 'Platební místo deaktivováno',
  },
  'admin.salesPoint.reactivated': {
    en: 'Sales point reactivated',
    cs: 'Platební místo znovu aktivováno',
  },
  'admin.salesPoint.permanently_deleted': {
    en: 'Sales point permanently deleted',
    cs: 'Platební místo trvale smazáno',
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
  'admin.salesPoint.donation_projects.updated': {
    en: 'Sales point donation projects updated',
    cs: 'Projekty daru na platebním místě upraveny',
  },
  'admin.salesPoint.donation_amounts.updated': {
    en: 'Sales point donation amounts updated',
    cs: 'Částky daru na platebním místě upraveny',
  },
  'admin.product.media_saved': {
    en: 'Product gallery saved',
    cs: 'Galerie produktu uložena',
  },
  'admin.product.media_deleted': {
    en: 'Product gallery images removed',
    cs: 'Obrázky galerie produktu odstraněny',
  },
  'admin.product.primary_image_changed': {
    en: 'Primary product image changed',
    cs: 'Změněn hlavní obrázek produktu',
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
  'dev.tenant.entitlement_policy.changed': {
    en: 'Organization feature policy changed (platform)',
    cs: 'Změna politiky funkcí organizace (platforma)',
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
  'reconciliation.bank_inbound.matched': {
    en: 'Inbound bank payment matched',
    cs: 'Příchozí bankovní platba spárována',
  },
  'reconciliation.bank_inbound.attribute': {
    en: 'Inbound bank payment attributed',
    cs: 'Příchozí bankovní platba přiřazena',
  },
  'reconciliation.payment_claim.submitted': {
    en: 'Payment claim submitted',
    cs: 'Nahlášení platby odesláno',
  },
  'reconciliation.payment_claim.approved': {
    en: 'Payment claim approved',
    cs: 'Nahlášení platby schváleno',
  },
  'reconciliation.payment_claim.rejected': {
    en: 'Payment claim rejected',
    cs: 'Nahlášení platby zamítnuto',
  },
  'reconciliation.recurring_payment.missed': {
    en: 'Recurring donation payment missed',
    cs: 'Chybějící platba pravidelného daru',
  },
  'reconciliation.bank_account.mode_changed': {
    en: 'Bank account reconciliation mode changed',
    cs: 'Změna režimu bankovního účtu',
  },
  'payment.provider_wiring.verified': {
    en: 'Payment provider wiring verified',
    cs: 'Ověření napojení platebního poskytovatele',
  },
  'payment.provider_wiring.verify_failed': {
    en: 'Payment provider wiring verification failed',
    cs: 'Ověření napojení platebního poskytovatele selhalo',
  },
  'payment.provider_wiring.invalidated': {
    en: 'Payment provider wiring invalidated',
    cs: 'Napojení platebního poskytovatele zneplatněno',
  },
  'payment.cash_provider.risk_ack': {
    en: 'Cash provider risk acknowledged',
    cs: 'Potvrzení rizika hotovostní platby',
  },
  'payment.cash_checkout.self_confirm': {
    en: 'Kiosk cash checkout self-confirmed',
    cs: 'Hotovostní platba u platebního místa potvrzena zákazníkem',
  },
  'export.analytics.explore.exported': {
    en: 'Customer behavior export',
    cs: 'Export chování zákazníků',
  },
  'export.analytics.rollups.materialized': {
    en: 'Analytics rollups materialized',
    cs: 'Analytické agregace materializovány',
  },
  'customer_pickup_ack_informational': {
    en: 'Customer informational pickup ack',
    cs: 'Informativní potvrzení vyzvednutí zákazníkem',
  },
  'gdpr.erasure.completed': {
    en: 'GDPR erasure completed',
    cs: 'GDPR výmaz dokončen',
  },
  'gdpr.erasure.side_effects_pending': {
    en: 'GDPR erasure side-effects pending',
    cs: 'GDPR výmaz — čekají vedlejší účinky',
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
