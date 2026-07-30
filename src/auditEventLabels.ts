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
  'auth.admin.password_reset.requested': {
    en: 'Admin password reset requested',
    cs: 'Požadavek na reset hesla administrátora',
  },
  'auth.admin.password_reset.completed': {
    en: 'Admin password reset completed',
    cs: 'Reset hesla administrátora dokončen',
  },
  'auth.admin.password_reset.failed': {
    en: 'Admin password reset failed',
    cs: 'Reset hesla administrátora selhal',
  },
  'auth.admin.mfa.enroll.success': {
    en: 'Admin MFA enroll succeeded',
    cs: 'Registrace MFA administrátora úspěšná',
  },
  'auth.admin.mfa.enroll.failed': {
    en: 'Admin MFA enroll failed',
    cs: 'Registrace MFA administrátora selhala',
  },
  'auth.admin.mfa.disable.success': {
    en: 'Admin MFA disable succeeded',
    cs: 'Vypnutí MFA administrátora úspěšné',
  },
  'auth.admin.mfa.disable.failed': {
    en: 'Admin MFA disable failed',
    cs: 'Vypnutí MFA administrátora selhalo',
  },
  'auth.admin.mfa.challenge.success': {
    en: 'Admin MFA challenge succeeded',
    cs: 'MFA výzva administrátora úspěšná',
  },
  'auth.admin.mfa.challenge.failed': {
    en: 'Admin MFA challenge failed',
    cs: 'MFA výzva administrátora selhala',
  },
  'auth.admin.step_up.success': {
    en: 'Admin step-up succeeded',
    cs: 'Step-up ověření administrátora úspěšné',
  },
  'auth.admin.step_up.failed': {
    en: 'Admin step-up failed',
    cs: 'Step-up ověření administrátora selhalo',
  },
  'auth.admin.break_glass.success': {
    en: 'Admin break-glass accepted',
    cs: 'Break-glass administrátora přijat',
  },
  'auth.admin.break_glass.failed': {
    en: 'Admin break-glass rejected',
    cs: 'Break-glass administrátora odmítnut',
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
  'admin.capability.granted': {
    en: 'Admin capability granted',
    cs: 'Oprávnění administrátora uděleno',
  },
  'admin.capability.revoked': {
    en: 'Admin capability revoked',
    cs: 'Oprávnění administrátora odebráno',
  },
  'admin.capability.template_applied': {
    en: 'Admin capability template applied',
    cs: 'Šablona oprávnění administrátora aplikována',
  },
  'admin.exception_grant.requested': {
    en: 'Exception grant requested',
    cs: 'Výjimka oprávnění požádána',
  },
  'admin.exception_grant.approved': {
    en: 'Exception grant approved',
    cs: 'Výjimka oprávnění schválena',
  },
  'admin.exception_grant.rejected': {
    en: 'Exception grant rejected',
    cs: 'Výjimka oprávnění zamítnuta',
  },
  'admin.exception_grant.executed': {
    en: 'Exception grant executed',
    cs: 'Výjimka oprávnění provedena',
  },
  'admin.product.created': {
    en: 'Product created',
    cs: 'Produkt vytvořen',
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
  'admin.product.price_updated': {
    en: 'Product price updated',
    cs: 'Cena produktu změněna',
  },
  'admin.product.stock_adjusted': {
    en: 'Product stock adjusted',
    cs: 'Sklad produktu upraven',
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
  'admin.tenant.legal_closure_completed': {
    en: 'Organization legal closure completed',
    cs: 'Právní uzavření organizace dokončeno',
  },
  'admin.tenant.physical_purge_started': {
    en: 'Organization physical purge started',
    cs: 'Fyzické mazání organizace zahájeno',
  },
  'admin.tenant.physical_purge_completed': {
    en: 'Organization physical purge completed',
    cs: 'Fyzické mazání organizace dokončeno',
  },
  'admin.tenant.physical_purge_failed': {
    en: 'Organization physical purge failed',
    cs: 'Fyzické mazání organizace selhalo',
  },
  'admin.tenant.physical_purge_blocked': {
    en: 'Organization physical purge blocked',
    cs: 'Fyzické mazání organizace zablokováno',
  },
  'admin.tenant.physical_purge_scheduled': {
    en: 'Organization physical purge scheduled',
    cs: 'Fyzické mazání organizace naplánováno',
  },
  'admin.tenant.physical_purge_cancelled': {
    en: 'Organization physical purge cancelled',
    cs: 'Fyzické mazání organizace zrušeno',
  },
  'admin.tenant.contract_reopened': {
    en: 'Organization contract reopened',
    cs: 'Smlouva organizace znovu otevřena',
  },
  'admin.tenant.access_cut': {
    en: 'Organization access cut',
    cs: 'Přístup organizace odříznut',
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
  'admin.loyalty.physical_card_issued': {
    en: 'Physical loyalty card issued',
    cs: 'Vydána fyzická věrnostní karta',
  },
  'admin.loyalty.physical_card_revoked': {
    en: 'Physical loyalty card revoked',
    cs: 'Zneplatněna fyzická věrnostní karta',
  },
  'admin.promo.event.created': {
    en: 'Promo event created',
    cs: 'Promo akce vytvořena',
  },
  'admin.promo.event.paused': {
    en: 'Promo event paused',
    cs: 'Promo akce pozastavena',
  },
  'admin.promo.reward.issued': {
    en: 'Promo reward issued',
    cs: 'Promo odměna vydána',
  },
  'admin.promo.reward.revoked': {
    en: 'Promo reward revoked',
    cs: 'Promo odměna zrušena',
  },
  'admin.promo.enrollment.revoked': {
    en: 'Promo enrollment revoked',
    cs: 'Promo registrace zrušena',
  },
  'commerce.promo.reward.activated': {
    en: 'Promo reward activated',
    cs: 'Promo odměna aktivována',
  },
  'commerce.promo.reward.redeemed': {
    en: 'Promo reward redeemed',
    cs: 'Promo odměna uplatněna',
  },
  'commerce.promo.reward.rolled_back': {
    en: 'Promo reward rolled back',
    cs: 'Promo odměna vrácena zpět',
  },
  'commerce.promo.progress.updated': {
    en: 'Promo progress updated',
    cs: 'Promo průběh aktualizován',
  },
  'commerce.promo.enrollment.created': {
    en: 'Promo enrollment created',
    cs: 'Promo registrace vytvořena',
  },
  'admin.product.barcode_assigned': {
    en: 'Product barcode assigned',
    cs: 'Přiřazen čárový kód produktu',
  },
  'admin.product.barcode_cleared': {
    en: 'Product barcode cleared',
    cs: 'Odstraněn čárový kód produktu',
  },
  'admin.product.barcode_alt_added': {
    en: 'Alternate product barcode added',
    cs: 'Přidán alternativní čárový kód',
  },
  'admin.product.barcode_alt_removed': {
    en: 'Alternate product barcode removed',
    cs: 'Odebrán alternativní čárový kód',
  },
  'admin.product.barcode_alt_promoted': {
    en: 'Alternate barcode promoted to primary',
    cs: 'Alternativní kód povýšen na primární',
  },
  'pickup.device.paired': {
    en: 'Pickup device paired',
    cs: 'Pickup zařízení spárováno',
  },
  'pickup.device.pairing.failed': {
    en: 'Pickup device pairing failed',
    cs: 'Spárování pickup zařízení selhalo',
  },
  'pickup.fulfillment.claim.acquired': {
    en: 'Fulfillment claim acquired',
    cs: 'Soft claim na vyzvednutí získán',
  },
  'pickup.fulfillment.claim.released': {
    en: 'Fulfillment claim released',
    cs: 'Soft claim na vyzvednutí uvolněn',
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
  'webhook_skipped_tenant_inactive': {
    en: 'Webhook skipped (inactive tenant)',
    cs: 'Webhook přeskočen (neaktivní tenant)',
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
  'reconciliation.recurring_payment.received': {
    en: 'Recurring donation payment received',
    cs: 'Přijata platba pravidelného daru',
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
    en: 'sales point cash checkout self-confirmed',
    cs: 'Hotovostní platba u platebního místa potvrzena zákazníkem',
  },
  'payment.cash_shift.opened': {
    en: 'Cash shift opened',
    cs: 'Hotovostní směna otevřena',
  },
  'payment.cash_shift.closed': {
    en: 'Cash shift closed',
    cs: 'Hotovostní směna uzavřena',
  },
  'payment.cash_drawer.open_signal': {
    en: 'Cash drawer open signal',
    cs: 'Signál otevření pokladní zásuvky',
  },
  'export.analytics.explore.exported': {
    en: 'Customer behavior export',
    cs: 'Export chování zákazníků',
  },
  'export.analytics.dev.views': {
    en: 'Dev analytics views export',
    cs: 'Export vývojářských analytických pohledů',
  },
  'export.analytics.mission_control.exported': {
    en: 'Mission Control tenant export',
    cs: 'Export tenantů Mission Control',
  },
  'analytics.mission_control.cross_tenant.read': {
    en: 'Mission Control cross-tenant read',
    cs: 'Cross-tenant čtení Mission Control',
  },
  'export.analytics.rollups.materialized': {
    en: 'Analytics rollups materialized',
    cs: 'Analytické agregace materializovány',
  },
  'export.transactions.exported': {
    en: 'Transactions export',
    cs: 'Export transakcí',
  },
  'export.fulfillment.exported': {
    en: 'Fulfillment export',
    cs: 'Export vyzvednutí',
  },
  'export.compliance.audit_events.exported': {
    en: 'Compliance audit events export',
    cs: 'Export compliance audit událostí',
  },
  'export.consent.grantees': {
    en: 'Consent grantees export',
    cs: 'Export příjemců souhlasů',
  },
  'customer_pickup_ack_informational': {
    en: 'Customer informational pickup ack',
    cs: 'Informativní potvrzení vyzvednutí zákazníkem',
  },
  'customer.receipt.downloaded': {
    en: 'Customer receipt downloaded',
    cs: 'Účtenka stažena zákazníkem',
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
