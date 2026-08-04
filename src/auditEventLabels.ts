import { AUDIT_EVENT_CODES, type AuditEventCode } from './auditEventCodes.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing audit event labels — every catalog code has distinct en + cs + sk. */
const AUDIT_LABEL_OVERRIDES: Record<AuditEventCode, LocalizedLabel> = {
  'auth.admin.login.success': {
    en: 'Admin login succeeded',
    cs: 'Přihlášení administrátora úspěšné',
    sk: 'Prihlásenie administrátora úspešné',
  },
  'auth.admin.login.failed': {
    en: 'Admin login failed',
    cs: 'Přihlášení administrátora selhalo',
    sk: 'Prihlásenie administrátora zlyhalo',
  },
  'auth.admin.logout': {
    en: 'Admin logout',
    cs: 'Odhlášení administrátora',
    sk: 'Odhlásenie administrátora',
  },
  'auth.admin.access.denied': {
    en: 'Access denied',
    cs: 'Přístup odepřen',
    sk: 'Prístup odopretý',
  },
  'auth.admin.password_reset.requested': {
    en: 'Admin password reset requested',
    cs: 'Požadavek na obnovení hesla správce',
    sk: 'Požiadavka na obnovenie hesla správcu',
  },
  'auth.admin.password_reset.completed': {
    en: 'Admin password reset completed',
    cs: 'Obnovení hesla správce dokončeno',
    sk: 'Obnovenie hesla správcu dokončené',
  },
  'auth.admin.password_reset.failed': {
    en: 'Admin password reset failed',
    cs: 'Obnovení hesla správce selhalo',
    sk: 'Obnovenie hesla správcu zlyhalo',
  },
  'auth.admin.mfa.enroll.success': {
    en: 'Admin MFA enroll succeeded',
    cs: 'Registrace MFA administrátora úspěšná',
    sk: 'Registrácia MFA administrátora úspešná',
  },
  'auth.admin.mfa.enroll.failed': {
    en: 'Admin MFA enroll failed',
    cs: 'Registrace MFA administrátora selhala',
    sk: 'Registrácia MFA administrátora zlyhala',
  },
  'auth.admin.mfa.disable.success': {
    en: 'Admin MFA disable succeeded',
    cs: 'Vypnutí MFA administrátora úspěšné',
    sk: 'Vypnutie MFA administrátora úspešné',
  },
  'auth.admin.mfa.disable.failed': {
    en: 'Admin MFA disable failed',
    cs: 'Vypnutí MFA administrátora selhalo',
    sk: 'Vypnutie MFA administrátora zlyhalo',
  },
  'auth.admin.mfa.challenge.success': {
    en: 'Admin MFA challenge succeeded',
    cs: 'MFA výzva administrátora úspěšná',
    sk: 'MFA výzva administrátora úspešná',
  },
  'auth.admin.mfa.challenge.failed': {
    en: 'Admin MFA challenge failed',
    cs: 'MFA výzva administrátora selhala',
    sk: 'MFA výzva administrátora zlyhala',
  },
  'auth.admin.step_up.success': {
    en: 'Admin step-up succeeded',
    cs: 'Dodatečné ověření správce úspěšné',
    sk: 'Dodatočné overenie správcu úspešné',
  },
  'auth.admin.step_up.failed': {
    en: 'Admin step-up failed',
    cs: 'Dodatečné ověření správce selhalo',
    sk: 'Dodatočné overenie správcu zlyhalo',
  },
  'auth.admin.break_glass.success': {
    en: 'Admin break-glass accepted',
    cs: 'Nouzové přepsání správce přijato',
    sk: 'Núdzové prepísanie správcu prijaté',
  },
  'auth.admin.break_glass.failed': {
    en: 'Admin break-glass rejected',
    cs: 'Nouzové přepsání správce odmítnuto',
    sk: 'Núdzové prepísanie správcu odmietnuté',
  },
  'auth.admin.oidc.login.success': {
    en: 'Admin OIDC login succeeded',
    cs: 'Přihlášení správce přes Google/Apple úspěšné',
    sk: 'Prihlásenie správcu cez Google/Apple úspešné',
  },
  'auth.admin.oidc.login.failed': {
    en: 'Admin OIDC login failed',
    cs: 'Přihlášení správce přes Google/Apple selhalo',
    sk: 'Prihlásenie správcu cez Google/Apple zlyhalo',
  },
  'auth.admin.oidc.invite.activated': {
    en: 'Admin invite activated via OIDC',
    cs: 'Pozvánka správce aktivována přes Google/Apple',
    sk: 'Pozvánka správcu aktivovaná cez Google/Apple',
  },
  'auth.admin.oidc.link.created': {
    en: 'Admin OIDC link created',
    cs: 'Propojeno přihlášení správce přes Google/Apple',
    sk: 'Prepojené prihlásenie správcu cez Google/Apple',
  },
  'auth.admin.oidc.link.removed': {
    en: 'Admin OIDC link removed',
    cs: 'Odpojeno přihlášení správce přes Google/Apple',
    sk: 'Odpojené prihlásenie správcu cez Google/Apple',
  },
  'auth.admin.oidc.link.remove_denied': {
    en: 'Admin OIDC unlink denied',
    cs: 'Odpojení Google/Apple přihlášení správce zamítnuto',
    sk: 'Odpojenie Google/Apple prihlásenia správcu zamietnuté',
  },
  'auth.admin.oidc.session.exchanged': {
    en: 'Admin OIDC session code exchanged',
    cs: 'Jednorázový přihlašovací kód správce vyměněn',
    sk: 'Jednorazový prihlasovací kód správcu vymenený',
  },
  'auth.admin.password.set': {
    en: 'Admin password set',
    cs: 'Heslo administrátora nastaveno',
    sk: 'Heslo administrátora nastavené',
  },
  'customer.oidc.login': {
    en: 'Customer OIDC login',
    cs: 'Přihlášení zákazníka přes Google/Apple',
    sk: 'Prihlásenie zákazníka cez Google/Apple',
  },
  'customer.oidc.email_merged': {
    en: 'Customer OIDC email merged',
    cs: 'E-mail zákazníka sloučen z Google/Apple',
    sk: 'E-mail zákazníka zlúčený z Google/Apple',
  },
  'admin.invite.created': {
    en: 'Admin invite created',
    cs: 'Pozvánka administrátora vytvořena',
    sk: 'Pozvánka administrátora vytvorená',
  },
  'admin.invite.resent': {
    en: 'Admin invite resent',
    cs: 'Pozvánka administrátora znovu odeslána',
    sk: 'Pozvánka administrátora znova odoslaná',
  },
  'admin.invite.activated': {
    en: 'Admin invite activated',
    cs: 'Pozvánka administrátora aktivována',
    sk: 'Pozvánka administrátora aktivovaná',
  },
  'admin.account.username_changed': {
    en: 'Admin username changed',
    cs: 'Změna přihlašovacího jména',
    sk: 'Zmena prihlasovacieho mena',
  },
  'admin.account.password_changed': {
    en: 'Admin password changed',
    cs: 'Změna hesla administrátora',
    sk: 'Zmena hesla administrátora',
  },
  'admin.credentials.provider_secret.set': {
    en: 'Payment provider secret set',
    cs: 'Nastavení klíče platebního poskytovatele',
    sk: 'Nastavenie kľúča platobného poskytovateľa',
  },
  'admin.credentials.provider_secret.rotated': {
    en: 'Payment provider secret rotated',
    cs: 'Výměna klíče platebního poskytovatele',
    sk: 'Výmena kľúča platobného poskytovateľa',
  },
  'admin.credentials.provider_secret.deleted': {
    en: 'Payment provider secret deleted',
    cs: 'Smazání klíče platebního poskytovatele',
    sk: 'Zmazanie kľúča platobného poskytovateľa',
  },
  'admin.credentials.bank_secret.set': {
    en: 'Bank transfer settings saved',
    cs: 'Uložení nastavení bankovního převodu',
    sk: 'Uloženie nastavení bankového prevodu',
  },
  'admin.credentials.bank_secret.rotated': {
    en: 'Bank transfer settings updated',
    cs: 'Aktualizace nastavení bankovního převodu',
    sk: 'Aktualizácia nastavení bankového prevodu',
  },
  'admin.settings.updated': {
    en: 'Settings updated',
    cs: 'Nastavení změněna',
    sk: 'Nastavenia zmenené',
  },
  'admin.user.created': {
    en: 'Admin user created',
    cs: 'Administrátor vytvořen',
    sk: 'Administrátor vytvorený',
  },
  'admin.user.deactivated': {
    en: 'Admin user deactivated',
    cs: 'Administrátor deaktivován',
    sk: 'Administrátor deaktivovaný',
  },
  'admin.user.reactivated': {
    en: 'Admin user reactivated',
    cs: 'Administrátor znovu aktivován',
    sk: 'Administrátor znova aktivovaný',
  },
  'admin.user.permanently_deleted': {
    en: 'Admin user permanently deleted',
    cs: 'Administrátor trvale smazán',
    sk: 'Administrátor trvalo zmazaný',
  },
  'admin.capability.granted': {
    en: 'Admin capability granted',
    cs: 'Oprávnění administrátora uděleno',
    sk: 'Oprávnenie administrátora udelené',
  },
  'admin.capability.revoked': {
    en: 'Admin capability revoked',
    cs: 'Oprávnění administrátora odebráno',
    sk: 'Oprávnenie administrátora odobraté',
  },
  'admin.capability.template_applied': {
    en: 'Admin capability template applied',
    cs: 'Šablona oprávnění administrátora aplikována',
    sk: 'Šablóna oprávnení administrátora aplikovaná',
  },
  'admin.exception_grant.requested': {
    en: 'Exception grant requested',
    cs: 'Výjimka oprávnění požádána',
    sk: 'Výnimka oprávnenia požiadaná',
  },
  'admin.exception_grant.approved': {
    en: 'Exception grant approved',
    cs: 'Výjimka oprávnění schválena',
    sk: 'Výnimka oprávnenia schválená',
  },
  'admin.exception_grant.rejected': {
    en: 'Exception grant rejected',
    cs: 'Výjimka oprávnění zamítnuta',
    sk: 'Výnimka oprávnenia zamietnutá',
  },
  'admin.exception_grant.executed': {
    en: 'Exception grant executed',
    cs: 'Výjimka oprávnění provedena',
    sk: 'Výnimka oprávnenia vykonaná',
  },
  'admin.product.created': {
    en: 'Product created',
    cs: 'Produkt vytvořen',
    sk: 'Produkt vytvorený',
  },
  'admin.product.deactivated': {
    en: 'Product deactivated',
    cs: 'Produkt deaktivován',
    sk: 'Produkt deaktivovaný',
  },
  'admin.product.reactivated': {
    en: 'Product reactivated',
    cs: 'Produkt znovu aktivován',
    sk: 'Produkt znova aktivovaný',
  },
  'admin.product.permanently_deleted': {
    en: 'Product permanently deleted',
    cs: 'Produkt trvale smazán',
    sk: 'Produkt trvalo zmazaný',
  },
  'admin.product.price_updated': {
    en: 'Product price updated',
    cs: 'Cena produktu změněna',
    sk: 'Cena produktu zmenená',
  },
  'admin.product.stock_adjusted': {
    en: 'Product stock adjusted',
    cs: 'Sklad produktu upraven',
    sk: 'Sklad produktu upravený',
  },
  'admin.category.deactivated': {
    en: 'Category deactivated',
    cs: 'Kategorie deaktivována',
    sk: 'Kategória deaktivovaná',
  },
  'admin.category.reactivated': {
    en: 'Category reactivated',
    cs: 'Kategorie znovu aktivována',
    sk: 'Kategória znova aktivovaná',
  },
  'admin.category.permanently_deleted': {
    en: 'Category permanently deleted',
    cs: 'Kategorie trvale smazána',
    sk: 'Kategória trvalo zmazaná',
  },
  'admin.variant.archived': {
    en: 'Variant archived',
    cs: 'Varianta archivována',
    sk: 'Varianta archivovaná',
  },
  'admin.variant.restored': {
    en: 'Variant restored',
    cs: 'Varianta obnovena',
    sk: 'Varianta obnovená',
  },
  'admin.variant.permanently_deleted': {
    en: 'Variant permanently deleted',
    cs: 'Varianta trvale smazána',
    sk: 'Varianta trvalo zmazaná',
  },
  'admin.pickupPoint.deactivated': {
    en: 'Pickup point deactivated',
    cs: 'Odběrné místo deaktivováno',
    sk: 'Odberné miesto deaktivované',
  },
  'admin.pickupPoint.reactivated': {
    en: 'Pickup point reactivated',
    cs: 'Odběrné místo znovu aktivováno',
    sk: 'Odberné miesto znova aktivované',
  },
  'admin.pickupPoint.permanently_deleted': {
    en: 'Pickup point permanently deleted',
    cs: 'Odběrné místo trvale smazáno',
    sk: 'Odberné miesto trvalo zmazané',
  },
  'admin.donationProject.deactivated': {
    en: 'Donation project deactivated',
    cs: 'Dárcovský projekt deaktivován',
    sk: 'Darovací projekt deaktivovaný',
  },
  'admin.donationProject.reactivated': {
    en: 'Donation project reactivated',
    cs: 'Dárcovský projekt znovu aktivován',
    sk: 'Darovací projekt znova aktivovaný',
  },
  'admin.donationProject.archived': {
    en: 'Donation project archived',
    cs: 'Dárcovský projekt archivován',
    sk: 'Darovací projekt archivovaný',
  },
  'admin.customerMembership.suspended': {
    en: 'Customer membership suspended',
    cs: 'Členství zákazníka pozastaveno',
    sk: 'Členstvo zákazníka pozastavené',
  },
  'admin.retention.policy_updated': {
    en: 'Retention policy updated',
    cs: 'Retenční politika upravena',
    sk: 'Retenčná politika upravená',
  },
  'admin.salesPoint.deactivated': {
    en: 'Sales point deactivated',
    cs: 'Platební místo deaktivováno',
    sk: 'Platobné miesto deaktivované',
  },
  'admin.salesPoint.reactivated': {
    en: 'Sales point reactivated',
    cs: 'Platební místo znovu aktivováno',
    sk: 'Platobné miesto znova aktivované',
  },
  'admin.salesPoint.permanently_deleted': {
    en: 'Sales point permanently deleted',
    cs: 'Platební místo trvale smazáno',
    sk: 'Platobné miesto trvalo zmazané',
  },
  'admin.tenant.deactivated': {
    en: 'Organization deactivated',
    cs: 'Organizace deaktivována',
    sk: 'Organizácia deaktivovaná',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Organization permanently deleted',
    cs: 'Organizace trvale smazána',
    sk: 'Organizácia trvalo zmazaná',
  },
  'admin.tenant.reactivated': {
    en: 'Organization reactivated',
    cs: 'Organizace znovu aktivována',
    sk: 'Organizácia znova aktivovaná',
  },
  'admin.tenant.legal_closure_completed': {
    en: 'Organization legal closure completed',
    cs: 'Právní uzavření organizace dokončeno',
    sk: 'Právne uzavretie organizácie dokončené',
  },
  'admin.tenant.physical_purge_started': {
    en: 'Organization physical purge started',
    cs: 'Fyzické mazání organizace zahájeno',
    sk: 'Fyzické mazanie organizácie začaté',
  },
  'admin.tenant.physical_purge_completed': {
    en: 'Organization physical purge completed',
    cs: 'Fyzické mazání organizace dokončeno',
    sk: 'Fyzické mazanie organizácie dokončené',
  },
  'admin.tenant.physical_purge_failed': {
    en: 'Organization physical purge failed',
    cs: 'Fyzické mazání organizace selhalo',
    sk: 'Fyzické mazanie organizácie zlyhalo',
  },
  'admin.tenant.physical_purge_blocked': {
    en: 'Organization physical purge blocked',
    cs: 'Fyzické mazání organizace zablokováno',
    sk: 'Fyzické mazanie organizácie zablokované',
  },
  'admin.tenant.physical_purge_scheduled': {
    en: 'Organization physical purge scheduled',
    cs: 'Fyzické mazání organizace naplánováno',
    sk: 'Fyzické mazanie organizácie naplánované',
  },
  'admin.tenant.physical_purge_cancelled': {
    en: 'Organization physical purge cancelled',
    cs: 'Fyzické mazání organizace zrušeno',
    sk: 'Fyzické mazanie organizácie zrušené',
  },
  'admin.tenant.contract_reopened': {
    en: 'Organization contract reopened',
    cs: 'Smlouva organizace znovu otevřena',
    sk: 'Zmluva organizácie znova otvorená',
  },
  'admin.tenant.access_cut': {
    en: 'Organization access cut',
    cs: 'Přístup organizace odříznut',
    sk: 'Prístup organizácie odrezaný',
  },
  'admin.tenant.logo_uploaded': {
    en: 'Organization logo uploaded',
    cs: 'Logo organizace nahráno',
    sk: 'Logo organizácie nahrané',
  },
  'admin.tenant.logo_replaced': {
    en: 'Organization logo replaced',
    cs: 'Logo organizace nahrazeno',
    sk: 'Logo organizácie nahradené',
  },
  'admin.tenant.logo_deleted': {
    en: 'Organization logo deleted',
    cs: 'Logo organizace smazáno',
    sk: 'Logo organizácie vymazané',
  },
  'admin.salesPoint.image_uploaded': {
    en: 'Sales point image uploaded',
    cs: 'Obrázek prodejního místa nahrán',
    sk: 'Obrázok predajného miesta nahraný',
  },
  'admin.salesPoint.image_replaced': {
    en: 'Sales point image replaced',
    cs: 'Obrázek prodejního místa nahrazen',
    sk: 'Obrázok predajného miesta nahradený',
  },
  'admin.salesPoint.image_deleted': {
    en: 'Sales point image deleted',
    cs: 'Obrázek prodejního místa smazán',
    sk: 'Obrázok predajného miesta vymazaný',
  },
  'admin.donation_template.created': {
    en: 'Donation amount template created',
    cs: 'Šablona částek daru vytvořena',
    sk: 'Šablóna čiastok daru vytvorená',
  },
  'admin.donation_template.updated': {
    en: 'Donation amount template updated',
    cs: 'Šablona částek daru upravena',
    sk: 'Šablóna čiastok daru upravená',
  },
  'admin.donation_template.default_set': {
    en: 'Default donation template set',
    cs: 'Výchozí šablona daru nastavena',
    sk: 'Predvolená šablóna daru nastavená',
  },
  'admin.salesPoint.donation_projects.updated': {
    en: 'Sales point donation projects updated',
    cs: 'Projekty daru na platebním místě upraveny',
    sk: 'Projekty daru na platobnom mieste upravené',
  },
  'admin.salesPoint.donation_amounts.updated': {
    en: 'Sales point donation amounts updated',
    cs: 'Částky daru na platebním místě upraveny',
    sk: 'Čiastky daru na platobnom mieste upravené',
  },
  'admin.product.media_saved': {
    en: 'Product gallery saved',
    cs: 'Galerie produktu uložena',
    sk: 'Galéria produktu uložená',
  },
  'admin.product.media_deleted': {
    en: 'Product gallery images removed',
    cs: 'Obrázky galerie produktu odstraněny',
    sk: 'Obrázky galérie produktu odstránené',
  },
  'admin.product.primary_image_changed': {
    en: 'Primary product image changed',
    cs: 'Změněn hlavní obrázek produktu',
    sk: 'Zmenený hlavný obrázok produktu',
  },
  'admin.loyalty.physical_card_issued': {
    en: 'Physical loyalty card issued',
    cs: 'Vydána fyzická věrnostní karta',
    sk: 'Vydaná fyzická vernostná karta',
  },
  'admin.loyalty.physical_card_revoked': {
    en: 'Physical loyalty card revoked',
    cs: 'Zneplatněna fyzická věrnostní karta',
    sk: 'Zneplatnená fyzická vernostná karta',
  },
  'admin.promo.event.created': {
    en: 'Promo event created',
    cs: 'Akce vytvořena',
    sk: 'Akcia vytvorená',
  },
  'admin.promo.event.paused': {
    en: 'Promo event paused',
    cs: 'Akce pozastavena',
    sk: 'Akcia pozastavená',
  },
  'admin.promo.reward.issued': {
    en: 'Promo reward issued',
    cs: 'Propagační odměna vydána',
    sk: 'Propagačná odmena vydaná',
  },
  'admin.promo.reward.revoked': {
    en: 'Promo reward revoked',
    cs: 'Propagační odměna zrušena',
    sk: 'Propagačná odmena zrušená',
  },
  'admin.promo.enrollment.revoked': {
    en: 'Promo enrollment revoked',
    cs: 'Registrace k akci zrušena',
    sk: 'Registrácia k akcii zrušená',
  },
  'commerce.promo.reward.activated': {
    en: 'Promo reward activated',
    cs: 'Propagační odměna aktivována',
    sk: 'Propagačná odmena aktivovaná',
  },
  'commerce.promo.reward.redeemed': {
    en: 'Promo reward redeemed',
    cs: 'Propagační odměna uplatněna',
    sk: 'Propagačná odmena uplatnená',
  },
  'commerce.promo.reward.rolled_back': {
    en: 'Promo reward rolled back',
    cs: 'Propagační odměna vrácena zpět',
    sk: 'Propagačná odmena vrátená späť',
  },
  'commerce.promo.progress.updated': {
    en: 'Promo progress updated',
    cs: 'Průběh akce aktualizován',
    sk: 'Priebeh akcie aktualizovaný',
  },
  'commerce.promo.enrollment.created': {
    en: 'Promo enrollment created',
    cs: 'Registrace k akci vytvořena',
    sk: 'Registrácia k akcii vytvorená',
  },
  'admin.product.barcode_assigned': {
    en: 'Product barcode assigned',
    cs: 'Přiřazen čárový kód produktu',
    sk: 'Priradený čiarový kód produktu',
  },
  'admin.product.barcode_cleared': {
    en: 'Product barcode cleared',
    cs: 'Odstraněn čárový kód produktu',
    sk: 'Odstránený čiarový kód produktu',
  },
  'admin.product.barcode_alt_added': {
    en: 'Alternate product barcode added',
    cs: 'Přidán alternativní čárový kód',
    sk: 'Pridaný alternatívny čiarový kód',
  },
  'admin.product.barcode_alt_removed': {
    en: 'Alternate product barcode removed',
    cs: 'Odebrán alternativní čárový kód',
    sk: 'Odobratý alternatívny čiarový kód',
  },
  'admin.product.barcode_alt_promoted': {
    en: 'Alternate barcode promoted to primary',
    cs: 'Alternativní kód povýšen na primární',
    sk: 'Alternatívny kód povýšený na primárny',
  },
  'pickup.device.paired': {
    en: 'Pickup device paired',
    cs: 'Zařízení pro vyzvednutí spárováno',
    sk: 'Zariadenie na vyzdvihnutie spárované',
  },
  'pickup.device.pairing.failed': {
    en: 'Pickup device pairing failed',
    cs: 'Spárování zařízení pro vyzvednutí selhalo',
    sk: 'Spárovanie zariadenia na vyzdvihnutie zlyhalo',
  },
  'pickup.fulfillment.claim.acquired': {
    en: 'Fulfillment claim acquired',
    cs: 'Převzetí objednávky k vyzvednutí získáno',
    sk: 'Prevzatie objednávky na vyzdvihnutie získané',
  },
  'pickup.fulfillment.claim.released': {
    en: 'Fulfillment claim released',
    cs: 'Převzetí objednávky k vyzvednutí uvolněno',
    sk: 'Prevzatie objednávky na vyzdvihnutie uvoľnené',
  },
  'dev.tenant.created': {
    en: 'Organization created (platform)',
    cs: 'Organizace založena (platforma)',
    sk: 'Organizácia založená (platforma)',
  },
  'dev.tenant.updated': {
    en: 'Organization updated (platform)',
    cs: 'Organizace upravena (platforma)',
    sk: 'Organizácia upravená (platforma)',
  },
  'dev.tenant.provider.updated': {
    en: 'Organization provider updated (platform)',
    cs: 'Poskytovatel organizace upraven (platforma)',
    sk: 'Poskytovateľ organizácie upravený (platforma)',
  },
  'dev.tenant.entitlement_policy.changed': {
    en: 'Organization feature policy changed (platform)',
    cs: 'Změna politiky funkcí organizace (platforma)',
    sk: 'Zmena politiky funkcií organizácie (platforma)',
  },
  'payment.transaction.state_changed': {
    en: 'Payment status changed',
    cs: 'Změna stavu platby',
    sk: 'Zmena stavu platby',
  },
  'payment.admin_manual_complete': {
    en: 'Order marked paid (admin)',
    cs: 'Objednávka označena jako zaplacená (správce)',
    sk: 'Objednávka označená ako zaplatená (správca)',
  },
  'webhook_skipped_tenant_inactive': {
    en: 'Webhook skipped (inactive tenant)',
    cs: 'Webhook přeskočen (neaktivní organizace)',
    sk: 'Webhook preskočený (neaktívna organizácia)',
  },
  'payment.customer.refund.requested': {
    en: 'Customer refund requested',
    cs: 'Zákazník požádal o vrácení platby',
    sk: 'Zákazník požiadal o vrátenie platby',
  },
  'reconciliation.transaction.refund_candidate.marked': {
    en: 'Refund check marked',
    cs: 'Označeno ke kontrole vrácení',
    sk: 'Označené na kontrolu vrátenia',
  },
  'reconciliation.transaction.refund_candidate.unmarked': {
    en: 'Refund check cleared',
    cs: 'Zrušeno označení vrácení',
    sk: 'Zrušené označenie vrátenia',
  },
  'reconciliation.bank_inbound.matched': {
    en: 'Inbound bank payment matched',
    cs: 'Příchozí bankovní platba spárována',
    sk: 'Prichádzajúca banková platba spárovaná',
  },
  'reconciliation.bank_inbound.attribute': {
    en: 'Inbound bank payment attributed',
    cs: 'Příchozí bankovní platba přiřazena',
    sk: 'Prichádzajúca banková platba priradená',
  },
  'reconciliation.payment_claim.submitted': {
    en: 'Payment claim submitted',
    cs: 'Nahlášení platby odesláno',
    sk: 'Nahlásenie platby odoslané',
  },
  'reconciliation.payment_claim.approved': {
    en: 'Payment claim approved',
    cs: 'Nahlášení platby schváleno',
    sk: 'Nahlásenie platby schválené',
  },
  'reconciliation.payment_claim.rejected': {
    en: 'Payment claim rejected',
    cs: 'Nahlášení platby zamítnuto',
    sk: 'Nahlásenie platby zamietnuté',
  },
  'reconciliation.recurring_payment.missed': {
    en: 'Recurring donation payment missed',
    cs: 'Chybějící platba pravidelného daru',
    sk: 'Chýbajúca platba pravidelného daru',
  },
  'reconciliation.recurring_payment.received': {
    en: 'Recurring donation payment received',
    cs: 'Přijata platba pravidelného daru',
    sk: 'Prijatá platba pravidelného daru',
  },
  'reconciliation.bank_account.mode_changed': {
    en: 'Bank account reconciliation mode changed',
    cs: 'Změna režimu bankovního účtu',
    sk: 'Zmena režimu bankového účtu',
  },
  'payment.provider_wiring.verified': {
    en: 'Payment provider wiring verified',
    cs: 'Ověření napojení platebního poskytovatele',
    sk: 'Overenie napojenia platobného poskytovateľa',
  },
  'payment.provider_wiring.verify_failed': {
    en: 'Payment provider wiring verification failed',
    cs: 'Ověření napojení platebního poskytovatele selhalo',
    sk: 'Overenie napojenia platobného poskytovateľa zlyhalo',
  },
  'payment.provider_wiring.invalidated': {
    en: 'Payment provider wiring invalidated',
    cs: 'Napojení platebního poskytovatele zneplatněno',
    sk: 'Napojenie platobného poskytovateľa zneplatnené',
  },
  'payment.cash_provider.risk_ack': {
    en: 'Cash provider risk acknowledged',
    cs: 'Potvrzení rizika hotovostní platby',
    sk: 'Potvrdenie rizika hotovostnej platby',
  },
  'payment.cash_checkout.self_confirm': {
    en: 'sales point cash checkout self-confirmed',
    cs: 'Hotovostní platba u platebního místa potvrzena zákazníkem',
    sk: 'Hotovostná platba pri platobnom mieste potvrdená zákazníkom',
  },
  'payment.cash_shift.opened': {
    en: 'Cash shift opened',
    cs: 'Hotovostní směna otevřena',
    sk: 'Hotovostná zmena otvorená',
  },
  'payment.cash_shift.closed': {
    en: 'Cash shift closed',
    cs: 'Hotovostní směna uzavřena',
    sk: 'Hotovostná zmena uzavretá',
  },
  'payment.cash_drawer.open_signal': {
    en: 'Cash drawer open signal',
    cs: 'Signál otevření pokladní zásuvky',
    sk: 'Signál otvorenia pokladničnej zásuvky',
  },
  'export.analytics.explore.exported': {
    en: 'Customer behavior export',
    cs: 'Export chování zákazníků',
    sk: 'Export správania zákazníkov',
  },
  'export.analytics.dev.views': {
    en: 'Dev analytics views export',
    cs: 'Export vývojářských analytických pohledů',
    sk: 'Export vývojárskych analytických pohľadov',
  },
  'export.analytics.mission_control.exported': {
    en: 'Mission Control tenant export',
    cs: 'Export organizací z Mission Control',
    sk: 'Export organizácií z Mission Control',
  },
  'analytics.mission_control.cross_tenant.read': {
    en: 'Mission Control cross-tenant read',
    cs: 'Čtení napříč organizacemi v Mission Control',
    sk: 'Čítanie naprieč organizáciami v Mission Control',
  },
  'export.analytics.rollups.materialized': {
    en: 'Analytics rollups materialized',
    cs: 'Analytické agregace připraveny',
    sk: 'Analytické agregácie pripravené',
  },
  'export.transactions.exported': {
    en: 'Transactions export',
    cs: 'Export transakcí',
    sk: 'Export transakcií',
  },
  'export.fulfillment.exported': {
    en: 'Fulfillment export',
    cs: 'Export vyzvednutí',
    sk: 'Export vyzdvihnutí',
  },
  'export.compliance.audit_events.exported': {
    en: 'Compliance audit events export',
    cs: 'Export compliance auditních událostí',
    sk: 'Export compliance auditných udalostí',
  },
  'export.consent.grantees': {
    en: 'Consent grantees export',
    cs: 'Export příjemců souhlasů',
    sk: 'Export príjemcov súhlasov',
  },
  'customer_pickup_ack_informational': {
    en: 'Customer informational pickup ack',
    cs: 'Informativní potvrzení vyzvednutí zákazníkem',
    sk: 'Informatívne potvrdenie vyzdvihnutia zákazníkom',
  },
  'customer.receipt.downloaded': {
    en: 'Customer receipt downloaded',
    cs: 'Účtenka stažena zákazníkem',
    sk: 'Účtenka stiahnutá zákazníkom',
  },
  'gdpr.erasure.completed': {
    en: 'GDPR erasure completed',
    cs: 'GDPR výmaz dokončen',
    sk: 'GDPR výmaz dokončený',
  },
  'gdpr.erasure.side_effects_pending': {
    en: 'GDPR erasure side-effects pending',
    cs: 'GDPR výmaz — čekají související úkony',
    sk: 'GDPR výmaz — čakajú súvisiace úkony',
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
