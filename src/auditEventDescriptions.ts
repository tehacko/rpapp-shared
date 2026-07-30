import { type AuditEventCode } from './auditEventCodes.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Plain-language audit descriptions for operators (cs + en), 1–3 short sentences. */
export const AUDIT_EVENT_DESCRIPTIONS: Record<AuditEventCode, LocalizedLabel> = {
  'auth.admin.login.success': {
    en: 'Recorded when an administrator signs in successfully. One line per successful login. Passwords and full personal details are never stored in this log.',
    cs: 'Zapíše se, když se administrátor úspěšně přihlásí. Jeden řádek za každé úspěšné přihlášení. Hesla ani plné osobní údaje se v tomto záznamu neukládají.',
  },
  'auth.admin.login.failed': {
    en: 'Recorded when a login attempt fails (wrong password or unknown user). One line per failed try. Only the username typed in is kept — not the password.',
    cs: 'Zapíše se, když přihlášení nevyjde (špatné heslo nebo neznámý účet). Jeden řádek za neúspěšný pokus. Ukládá se jen zadané jméno — ne heslo.',
  },
  'auth.admin.logout': {
    en: 'Recorded when an administrator clicks sign out. One line per logout.',
    cs: 'Zapíše se, když administrátor klikne na odhlášení. Jeden řádek za odhlášení.',
  },
  'auth.admin.access.denied': {
    en: 'Recorded when a signed-in administrator tries to open a page or action they are not allowed to use. One line per blocked attempt. Does not save what they typed in forms.',
    cs: 'Zapíše se, když přihlášený administrátor zkusí otevřít stránku nebo akci, na kterou nemá právo. Jeden řádek za zamítnutý pokus. Neukládá to, co psal do formulářů.',
  },
  'auth.admin.password_reset.requested': {
    en: 'Recorded when an administrator requests a password reset email. One line per request. The reset link itself is not stored here.',
    cs: 'Zapíše se, když administrátor požádá o e-mail pro reset hesla. Jeden řádek za požadavek. Odkaz pro reset se sem neukládá.',
  },
  'auth.admin.password_reset.completed': {
    en: 'Recorded when an administrator completes a password reset using a valid token. One line per successful reset. Passwords are never stored in this log.',
    cs: 'Zapíše se, když administrátor dokončí reset hesla platným tokenem. Jeden řádek za úspěšný reset. Hesla se v tomto záznamu neukládají.',
  },
  'auth.admin.password_reset.failed': {
    en: 'Recorded when a password reset attempt fails (invalid or expired token). One line per failed attempt. Passwords are never stored in this log.',
    cs: 'Zapíše se, když reset hesla nevyjde (neplatný nebo expirovaný token). Jeden řádek za neúspěšný pokus. Hesla se v tomto záznamu neukládají.',
  },
  'auth.admin.mfa.enroll.success': {
    en: 'Recorded when an administrator finishes MFA enrollment. One line per successful enroll. Secrets and recovery codes are never stored here.',
    cs: 'Zapíše se, když administrátor dokončí registraci MFA. Jeden řádek za úspěšnou registraci. Tajné klíče ani recovery kódy se sem neukládají.',
  },
  'auth.admin.mfa.enroll.failed': {
    en: 'Recorded when MFA enrollment fails (invalid TOTP or validation error). One line per failed attempt.',
    cs: 'Zapíše se, když registrace MFA selže (neplatný TOTP nebo chyba validace). Jeden řádek za neúspěšný pokus.',
  },
  'auth.admin.mfa.disable.success': {
    en: 'Recorded when an administrator successfully disables MFA on their account. One line per successful disable. Secrets are never stored here.',
    cs: 'Zapíše se, když administrátor úspěšně vypne MFA na svém účtu. Jeden řádek za úspěšné vypnutí. Tajné klíče se sem neukládají.',
  },
  'auth.admin.mfa.disable.failed': {
    en: 'Recorded when an MFA disable attempt fails (invalid confirmation or validation error). One line per failed attempt.',
    cs: 'Zapíše se, když vypnutí MFA selže (neplatné potvrzení nebo chyba validace). Jeden řádek za neúspěšný pokus.',
  },
  'auth.admin.mfa.challenge.success': {
    en: 'Recorded when an MFA login challenge succeeds. One line per successful challenge.',
    cs: 'Zapíše se, když MFA výzva při přihlášení uspěje. Jeden řádek za úspěšnou výzvu.',
  },
  'auth.admin.mfa.challenge.failed': {
    en: 'Recorded when an MFA login challenge fails. One line per failed attempt.',
    cs: 'Zapíše se, když MFA výzva při přihlášení selže. Jeden řádek za neúspěšný pokus.',
  },
  'auth.admin.step_up.success': {
    en: 'Recorded when admin step-up verification succeeds and a stepUpUntil claim is issued. One line per success.',
    cs: 'Zapíše se, když admin step-up ověření uspěje a je vydán nárok stepUpUntil. Jeden řádek za úspěch.',
  },
  'auth.admin.step_up.failed': {
    en: 'Recorded when admin step-up verification fails. One line per failed attempt.',
    cs: 'Zapíše se, když admin step-up ověření selže. Jeden řádek za neúspěšný pokus.',
  },
  'auth.admin.break_glass.success': {
    en: 'Recorded when a ticketed break-glass override is accepted (incident id + reason). The env token itself is never stored.',
    cs: 'Zapíše se, když je přijato ticketované break-glass přepsání (incident + důvod). Samotný env token se neukládá.',
  },
  'auth.admin.break_glass.failed': {
    en: 'Recorded when a break-glass override is rejected (invalid token, staging pattern in prod, or missing ticket fields).',
    cs: 'Zapíše se, když je break-glass přepsání odmítnuto (neplatný token, staging vzor v prod, nebo chybějící ticket pole).',
  },
  'admin.invite.created': {
    en: 'Recorded when a new administrator is invited by email and must set a password. One line per new invitation. The invitation link itself is not stored here.',
    cs: 'Zapíše se, když se pozve nový administrátor e-mailem a musí si nastavit heslo. Jeden řádek za novou pozvánku. Odkaz z pozvánky se sem neukládá.',
  },
  'admin.invite.resent': {
    en: 'Recorded when the invitation email is sent again to someone who has not finished signing up. One line per resend.',
    cs: 'Zapíše se, když se znovu pošle pozvánka tomu, kdo se ještě nedokončil zaregistrovat. Jeden řádek za opětovné odeslání.',
  },
  'admin.invite.activated': {
    en: 'Recorded when the invited person finishes setup and can sign in. One line per completed activation. Passwords are never stored.',
    cs: 'Zapíše se, když pozvaný dokončí nastavení a může se přihlásit. Jeden řádek za dokončenou aktivaci. Hesla se neukládají.',
  },
  'admin.account.username_changed': {
    en: 'Recorded when an administrator changes their own sign-in name. One line per change. The old name is not kept in this log.',
    cs: 'Zapíše se, když administrátor změní své přihlašovací jméno. Jeden řádek za změnu. Staré jméno se v záznamu neuchovává.',
  },
  'admin.account.password_changed': {
    en: 'Recorded when an administrator changes their own password successfully. One line per change. The password itself is never stored.',
    cs: 'Zapíše se, když administrátor úspěšně změní své heslo. Jeden řádek za změnu. Samotné heslo se nikdy neukládá.',
  },
  'admin.credentials.provider_secret.set': {
    en: 'Recorded when payment provider connection details are first saved for your organization. One line per save. Secret keys are not copied into the audit text.',
    cs: 'Zapíše se při prvním uložení připojení k platebnímu poskytovateli pro vaši organizaci. Jeden řádek za uložení. Tajné klíče se do textu auditu nekopírují.',
  },
  'admin.credentials.provider_secret.rotated': {
    en: 'Recorded when an existing payment provider secret is replaced with a new one. One line per replacement. The actual secret value is not shown.',
    cs: 'Zapíše se, když se existující tajný klíč poskytovatele nahradí novým. Jeden řádek za výměnu. Skutečná hodnota klíče se nezobrazuje.',
  },
  'admin.credentials.provider_secret.deleted': {
    en: 'Recorded when payment provider connection details are removed. One line per removal.',
    cs: 'Zapíše se, když se odstraní připojení k platebnímu poskytovateli. Jeden řádek za odstranění.',
  },
  'admin.credentials.bank_secret.set': {
    en: 'Recorded when bank transfer settings (account for incoming payments) are saved or updated. One line per save. Full account numbers are not repeated in the audit line.',
    cs: 'Zapíše se při uložení nebo úpravě nastavení bankovního převodu (účet pro příchozí platby). Jeden řádek za uložení. Celá čísla účtů se v řádku auditu neopakují.',
  },
  'admin.credentials.bank_secret.rotated': {
    en: 'Recorded when bank payment settings are updated in a “rotation” step without deleting them first. One line when this happens. Account numbers stay private.',
    cs: 'Zapíše se při aktualizaci bankovního nastavení ve kroku „rotace“ bez předchozího smazání. Jeden řádek při této akci. Čísla účtů zůstávají soukromá.',
  },
  'admin.settings.updated': {
    en: 'Recorded when important organization or admin settings are saved. One line per successful save when the system writes this event. Exact setting values are not listed in the audit text.',
    cs: 'Zapíše se při uložení důležitých nastavení organizace nebo administrace. Jeden řádek za úspěšné uložení, pokud systém tuto událost zapisuje. Konkrétní hodnoty nastavení nejsou v textu auditu.',
  },
  'admin.user.created': {
    en: 'Recorded when a new administrator account is created for your organization (without email invite). One line per new user.',
    cs: 'Zapíše se při vytvoření nového účtu administrátora pro vaši organizaci (bez e-mailové pozvánky). Jeden řádek za nového uživatele.',
  },
  'admin.user.deactivated': {
    en: 'Recorded when an administrator is blocked from signing in but their history is kept. One line per deactivation.',
    cs: 'Zapíše se, když se administrátorovi zablokuje přihlášení, ale historie zůstane. Jeden řádek za deaktivaci.',
  },
  'admin.user.reactivated': {
    en: 'Recorded when a blocked administrator is allowed to sign in again. One line per reactivation.',
    cs: 'Zapíše se, když se zablokovanému administrátorovi znovu povolí přihlášení. Jeden řádek za obnovení.',
  },
  'admin.user.permanently_deleted': {
    en: 'Recorded when an administrator account is deleted for good. One line per deletion. Other audit history stays.',
    cs: 'Zapíše se, když je účet administrátora trvale smazán. Jeden řádek za smazání. Ostatní auditní historie zůstává.',
  },
  'admin.capability.granted': {
    en: 'Recorded when a capability is granted to an administrator (direct grant or exception path). One line per grant. Shows target user and capability; passwords are never stored.',
    cs: 'Zapíše se, když je administrátorovi uděleno oprávnění (přímé udělení nebo výjimka). Jeden řádek za udělení. Ukazuje cílového uživatele a oprávnění; hesla se neukládají.',
  },
  'admin.capability.revoked': {
    en: 'Recorded when a capability is revoked from an administrator. One line per revoke. Shows target user and capability.',
    cs: 'Zapíše se, když je administrátorovi odebráno oprávnění. Jeden řádek za odebrání. Ukazuje cílového uživatele a oprávnění.',
  },
  'admin.capability.template_applied': {
    en: 'Recorded when a capability template is applied to an administrator. One line per apply. Shows target user and template id.',
    cs: 'Zapíše se, když je na administrátora aplikována šablona oprávnění. Jeden řádek za aplikaci. Ukazuje cílového uživatele a ID šablony.',
  },
  'admin.exception_grant.requested': {
    en: 'Recorded when an exception (SoD dual-control) grant is requested for a capability. One line per request. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požádáno o výjimku oprávnění (SoD dual-control). Jeden řádek za požadavek. Ukazuje ID schválení, cílového uživatele a oprávnění.',
  },
  'admin.exception_grant.approved': {
    en: 'Recorded when an exception grant request is approved. One line per approval. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požadavek na výjimku oprávnění schválen. Jeden řádek za schválení. Ukazuje ID schválení, cílového uživatele a oprávnění.',
  },
  'admin.exception_grant.rejected': {
    en: 'Recorded when an exception grant request is rejected. One line per rejection. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požadavek na výjimku oprávnění zamítnut. Jeden řádek za zamítnutí. Ukazuje ID schválení, cílového uživatele a oprávnění.',
  },
  'admin.exception_grant.executed': {
    en: 'Recorded when an approved exception grant is executed and the capability is applied. One line per execution. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je schválená výjimka oprávnění provedena a oprávnění aplikováno. Jeden řádek za provedení. Ukazuje ID schválení, cílového uživatele a oprávnění.',
  },
  'admin.product.created': {
    en: 'Recorded when an administrator creates a new product in the catalog. One line per product.',
    cs: 'Zapíše se, když administrátor vytvoří nový produkt v katalogu. Jeden řádek za produkt.',
  },
  'admin.product.deactivated': {
    en: 'Recorded when a product is hidden and cannot be sold on sales points until turned back on. One line per product. The product file is not erased.',
    cs: 'Zapíše se, když je produkt skrytý a na kioscích se neprodává, dokud se znovu nezapne. Jeden řádek za produkt. Produkt se ze systému nesmaže.',
  },
  'admin.product.reactivated': {
    en: 'Recorded when a hidden product is made available for sale again. One line per product.',
    cs: 'Zapíše se, když je skrytý produkt znovu zpřístupněn k prodeji. Jeden řádek za produkt.',
  },
  'admin.product.permanently_deleted': {
    en: 'Recorded when a product is deleted permanently and cannot be brought back. One line per product. Past sales records stay.',
    cs: 'Zapíše se, když je produkt trvale smazán a nelze ho obnovit. Jeden řádek za produkt. Minulé prodeje zůstávají.',
  },
  'admin.product.price_updated': {
    en: 'Recorded when a product base price, channel price, variant price, or VAT rate changes. One line per change for the product activity timeline.',
    cs: 'Zapíše se při změně základní ceny, kanálové ceny, ceny varianty nebo sazby DPH. Jeden řádek za změnu v historii produktu.',
  },
  'admin.product.stock_adjusted': {
    en: 'Recorded when inventory quantity for a product (or variant) is set at a sales point. One line per stock adjustment.',
    cs: 'Zapíše se, když se na prodejním místě nastaví skladové množství produktu (nebo varianty). Jeden řádek za úpravu skladu.',
  },
  'admin.category.deactivated': {
    en: 'Recorded when a category is switched off so its grouping is no longer active in operational lists. One line per category.',
    cs: 'Zapíše se, když je kategorie vypnuta, takže její seskupení už není aktivní v provozních seznamech. Jeden řádek za kategorii.',
  },
  'admin.category.reactivated': {
    en: 'Recorded when a previously deactivated category is enabled again. One line per category.',
    cs: 'Zapíše se, když je dříve deaktivovaná kategorie znovu zapnuta. Jeden řádek za kategorii.',
  },
  'admin.category.permanently_deleted': {
    en: 'Recorded when a category is removed permanently from the catalog setup. One line per category. Historical records remain for compliance.',
    cs: 'Zapíše se, když je kategorie trvale odstraněna z katalogu. Jeden řádek za kategorii. Historické záznamy zůstávají kvůli evidenci.',
  },
  'admin.variant.archived': {
    en: 'Recorded when a product variant is archived and removed from active offer management. One line per variant.',
    cs: 'Zapíše se, když je varianta produktu archivována a odstraněna z aktivní nabídky. Jeden řádek za variantu.',
  },
  'admin.variant.restored': {
    en: 'Recorded when an archived product variant is restored back to active management. One line per variant.',
    cs: 'Zapíše se, když je archivovaná varianta produktu obnovena do aktivní správy. Jeden řádek za variantu.',
  },
  'admin.variant.permanently_deleted': {
    en: 'Recorded when a product variant is permanently deleted and cannot be restored. One line per variant.',
    cs: 'Zapíše se, když je varianta produktu trvale smazána a nelze ji obnovit. Jeden řádek za variantu.',
  },
  'admin.pickupPoint.deactivated': {
    en: 'Recorded when a pickup point is deactivated and no longer available for customer handoff. One line per pickup point.',
    cs: 'Zapíše se, když je odběrné místo deaktivováno a už není dostupné pro předání zákazníkovi. Jeden řádek za odběrné místo.',
  },
  'admin.pickupPoint.reactivated': {
    en: 'Recorded when a deactivated pickup point is reactivated and offered again. One line per pickup point.',
    cs: 'Zapíše se, když je deaktivované odběrné místo znovu aktivováno a opět nabízeno. Jeden řádek za odběrné místo.',
  },
  'admin.pickupPoint.permanently_deleted': {
    en: 'Recorded when a pickup point is permanently removed from configuration. One line per pickup point. Past audit and payment traces stay.',
    cs: 'Zapíše se, když je odběrné místo trvale odstraněno z konfigurace. Jeden řádek za odběrné místo. Staré auditní a platební stopy zůstávají.',
  },
  'admin.donationProject.deactivated': {
    en: 'Recorded when a donation project is deactivated and hidden from active assignment. One line per project.',
    cs: 'Zapíše se, když je dárcovský projekt deaktivován a skryt z aktivního přiřazení. Jeden řádek za projekt.',
  },
  'admin.donationProject.reactivated': {
    en: 'Recorded when a deactivated donation project becomes active again. One line per project.',
    cs: 'Zapíše se, když se deaktivovaný dárcovský projekt znovu aktivuje. Jeden řádek za projekt.',
  },
  'admin.donationProject.archived': {
    en: 'Recorded when a donation project is archived for retention and no longer used in current flows. One line per project.',
    cs: 'Zapíše se, když je dárcovský projekt archivován pro evidenci a už se nepoužívá v aktuálních tocích. Jeden řádek za projekt.',
  },
  'admin.customerMembership.suspended': {
    en: 'Recorded when a customer membership is suspended by an administrator. One line per suspension.',
    cs: 'Zapíše se, když administrátor pozastaví členství zákazníka. Jeden řádek za pozastavení.',
  },
  'admin.retention.policy_updated': {
    en: 'Recorded when retention policy settings are updated by an administrator. One line per successful policy save.',
    cs: 'Zapíše se při úpravě nastavení retenční politiky administrátorem. Jeden řádek za úspěšné uložení politiky.',
  },
  'admin.salesPoint.deactivated': {
    en: 'Recorded when a sales point is turned off for customers. One line per sales point. Payments already in progress are handled separately.',
    cs: 'Zapíše se, když je platební místo vypnuté pro zákazníky. Jeden řádek za platební místo. Platby už rozjeté se řeší zvlášť.',
  },
  'admin.salesPoint.reactivated': {
    en: 'Recorded when a turned-off sales point is enabled again. One line per sales point.',
    cs: 'Zapíše se, když je vypnuté platební místo znovu zapnuté. Jeden řádek za platební místo.',
  },
  'admin.salesPoint.permanently_deleted': {
    en: 'Recorded when a sales point is removed from the system for good. One line per sales point. Old payment and audit records stay for compliance.',
    cs: 'Zapíše se, když je platební místo trvale odstraněno ze systému. Jeden řádek za platební místo. Staré platby a audit zůstávají kvůli evidenci.',
  },
  'admin.tenant.deactivated': {
    en: 'Recorded when an entire customer organization (tenant) is soft-deactivated without legal closure. One line per soft deactivate. Customer personal data is not copied into this line.',
    cs: 'Zapíše se, když je zákaznická organizace (tenant) soft-deaktivována bez právního uzavření. Jeden řádek za soft deaktivaci. Osobní údaje zákazníků se do řádku nekopírují.',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Recorded when an organization is fully deleted from the system. One line per delete run. Summary counts may appear, not full customer lists.',
    cs: 'Zapíše se, když je organizace kompletně smazána ze systému. Jeden řádek za běh mazání. Mohou být souhrnná čísla, ne celé seznamy zákazníků.',
  },
  'admin.tenant.reactivated': {
    en: 'Recorded when a closed organization is opened again. One line per reactivation.',
    cs: 'Zapíše se, když je uzavřená organizace znovu otevřena. Jeden řádek za obnovení.',
  },
  'admin.tenant.legal_closure_completed': {
    en: 'Recorded when Mode A legal closure finishes for an organization, including when it was already deactivated. One line per successful Mode A completion. Distinct from soft deactivate.',
    cs: 'Zapíše se, když Mode A právní uzavření organizace doběhne, i když už byla deaktivovaná. Jeden řádek za úspěšné Mode A. Oddělené od soft deaktivace.',
  },
  'admin.tenant.physical_purge_started': {
    en: 'Recorded when a physical purge (Mode B or grace worker) starts for an organization. One line per purge attempt start.',
    cs: 'Zapíše se, když začne fyzické mazání (Mode B nebo grace worker) organizace. Jeden řádek za zahájení pokusu.',
  },
  'admin.tenant.physical_purge_completed': {
    en: 'Recorded when a physical purge finishes successfully (Gone or runtime-only outcome). One line per successful completion.',
    cs: 'Zapíše se, když fyzické mazání úspěšně skončí (Gone nebo jen runtime). Jeden řádek za úspěšné dokončení.',
  },
  'admin.tenant.physical_purge_failed': {
    en: 'Recorded when a physical purge fails or cannot finish safely. One line per failure. Does not include full customer lists.',
    cs: 'Zapíše se, když fyzické mazání selže nebo nelze bezpečně dokončit. Jeden řádek za selhání. Neobsahuje celé seznamy zákazníků.',
  },
  'admin.tenant.physical_purge_blocked': {
    en: 'Recorded when a physical purge is refused because preflight blockers remain. One line per blocked attempt.',
    cs: 'Zapíše se, když je fyzické mazání odmítnuto kvůli blokátorům v preflightu. Jeden řádek za zablokovaný pokus.',
  },
  'admin.tenant.physical_purge_scheduled': {
    en: 'Recorded when a physical purge is scheduled after legal closure or by operator request. One line per schedule action.',
    cs: 'Zapíše se, když je fyzické mazání naplánováno po právním uzavření nebo na žádost operátora. Jeden řádek za naplánování.',
  },
  'admin.tenant.physical_purge_cancelled': {
    en: 'Recorded when a scheduled physical purge is cancelled before it runs. One line per cancel action.',
    cs: 'Zapíše se, když je naplánované fyzické mazání zrušeno dříve, než proběhne. Jeden řádek za zrušení.',
  },
  'admin.tenant.contract_reopened': {
    en: 'Recorded when a legally closed organization contract is reopened by SUPER_DEV. One line per reopen. Historical evidence stays immutable.',
    cs: 'Zapíše se, když SUPER_DEV znovu otevře právně uzavřenou smlouvu organizace. Jeden řádek za reopen. Historická evidence zůstává neměnná.',
  },
  'admin.tenant.access_cut': {
    en: 'Recorded when access cut revokes sessions, credentials, and related live access for an organization. One line per access-cut run.',
    cs: 'Zapíše se, když access cut odvolá session, credentials a související živý přístup organizace. Jeden řádek za běh access cut.',
  },
  'admin.donation_template.created': {
    en: 'Recorded when a new preset list of donation amounts is created. One line per new template.',
    cs: 'Zapíše se při vytvoření nového seznamu přednastavených částek daru. Jeden řádek za novou šablonu.',
  },
  'admin.donation_template.updated': {
    en: 'Recorded when an existing donation amount list is edited. One line per saved change.',
    cs: 'Zapíše se při úpravě existujícího seznamu částek daru. Jeden řádek za uloženou změnu.',
  },
  'admin.donation_template.default_set': {
    en: 'Recorded when one donation amount list is marked as the default for the organization. One line when the default changes.',
    cs: 'Zapíše se, když je jeden seznam částek daru označen jako výchozí pro organizaci. Jeden řádek při změně výchozího.',
  },
  'admin.salesPoint.donation_projects.updated': {
    en: 'Recorded when which charity projects appear on a sales point is saved. One line per save. Project names are not all listed in the audit line.',
    cs: 'Zapíše se při uložení toho, které dárkové projekty se na platebním místě zobrazují. Jeden řádek za uložení. Názvy všech projektů nejsou v řádku auditu.',
  },
  'admin.salesPoint.donation_amounts.updated': {
    en: 'Recorded when donation amount presets linked to a sales point are updated. One line per save.',
    cs: 'Zapíše se při aktualizaci přednastavených částek daru navázaných na platební místo. Jeden řádek za uložení.',
  },
  'admin.product.media_saved': {
    en: 'Recorded when an admin saves a product or variant image gallery. One line per successful gallery PUT.',
    cs: 'Zapíše se, když administrátor uloží galerii obrázků produktu nebo varianty. Jeden řádek za úspěšné uložení galerie.',
  },
  'admin.product.media_deleted': {
    en: 'Recorded when images are removed from a product gallery during save. One line per save that deletes images.',
    cs: 'Zapíše se, když jsou při ukládání galerie odstraněny obrázky produktu. Jeden řádek za uložení s odstraněním.',
  },
  'admin.product.primary_image_changed': {
    en: 'Recorded when the primary catalog image flag changes in a gallery save. One line when primary changes.',
    cs: 'Zapíše se, když se při ukládání galerie změní hlavní obrázek v katalogu. Jeden řádek při změně primárního obrázku.',
  },
  'admin.loyalty.physical_card_issued': {
    en: 'Recorded when an administrator issues a new physical loyalty card for sales point scanning. The full card payload is never stored in this log.',
    cs: 'Zapíše se, když administrátor vydá novou fyzickou věrnostní kartu pro skenování na platebním místě. Plná hodnota karty se v záznamu neukládá.',
  },
  'admin.loyalty.physical_card_revoked': {
    en: 'Recorded when a physical loyalty card is revoked and can no longer be used at a sales point. One line per revoked card.',
    cs: 'Zapíše se, když je fyzická věrnostní karta zneplatněna a nelze ji již použít na platebním místě. Jeden řádek za zneplatněnou kartu.',
  },
  'admin.promo.event.created': {
    en: 'Recorded when an operator creates a new promo event in draft state. One line per created event.',
    cs: 'Zapíše se, když operátor vytvoří novou promo akci ve stavu konceptu. Jeden řádek za vytvořenou akci.',
  },
  'admin.promo.event.paused': {
    en: 'Recorded when an operator pauses an active promo event. One line per pause action.',
    cs: 'Zapíše se, když operátor pozastaví aktivní promo akci. Jeden řádek za každé pozastavení.',
  },
  'admin.promo.reward.issued': {
    en: 'Recorded when an operator manually issues a promo reward to a customer. One line per issued reward.',
    cs: 'Zapíše se, když operátor ručně vydá promo odměnu zákazníkovi. Jeden řádek za vydanou odměnu.',
  },
  'admin.promo.reward.revoked': {
    en: 'Recorded when an operator revokes an unused or active promo reward. One line per revoked reward.',
    cs: 'Zapíše se, když operátor zruší nepoužitou nebo aktivní promo odměnu. Jeden řádek za zrušenou odměnu.',
  },
  'admin.promo.enrollment.revoked': {
    en: 'Recorded when an operator revokes a customer enrollment from a promo event. One line per revoked enrollment.',
    cs: 'Zapíše se, když operátor zruší registraci zákazníka k promo akci. Jeden řádek za zrušenou registraci.',
  },
  'commerce.promo.reward.activated': {
    en: 'Recorded when a customer activates an earned promo reward during checkout or account flow. One line per activation.',
    cs: 'Zapíše se, když zákazník aktivuje získanou promo odměnu při checkoutu nebo v účtu. Jeden řádek za aktivaci.',
  },
  'commerce.promo.reward.redeemed': {
    en: 'Recorded when an activated promo reward is applied to a completed purchase. One line per redemption.',
    cs: 'Zapíše se, když je aktivovaná promo odměna uplatněna u dokončeného nákupu. Jeden řádek za uplatnění.',
  },
  'commerce.promo.reward.rolled_back': {
    en: 'Recorded when a promo reward redemption is reversed after payment failure or order cancellation. One line per rollback.',
    cs: 'Zapíše se, když je uplatnění promo odměny vráceno po selhání platby nebo zrušení objednávky. Jeden řádek za vrácení.',
  },
  'commerce.promo.progress.updated': {
    en: 'Recorded when a customer promo progress counter changes toward a threshold reward. One line per progress update.',
    cs: 'Zapíše se, když se u zákazníka změní průběh promo akce směrem k prahové odměně. Jeden řádek za aktualizaci průběhu.',
  },
  'commerce.promo.enrollment.created': {
    en: 'Recorded when a customer enrolls in a promo event that requires enrollment. One line per enrollment.',
    cs: 'Zapíše se, když se zákazník zaregistruje k promo akci vyžadující registraci. Jeden řádek za registraci.',
  },
  'admin.product.barcode_assigned': {
    en: 'Recorded when a primary product or variant barcode is created or updated, including confirmed overwrite moves.',
    cs: 'Zapíše se při vytvoření nebo změně primárního čárového kódu produktu či varianty, včetně potvrzeného přesunu z jiného držitele.',
  },
  'admin.product.barcode_cleared': {
    en: 'Recorded when the primary barcode is removed from a product or variant.',
    cs: 'Zapíše se při odstranění primárního čárového kódu z produktu nebo varianty.',
  },
  'admin.product.barcode_alt_added': {
    en: 'Recorded when an alternate lookup barcode alias is added to a product or variant.',
    cs: 'Zapíše se při přidání alternativního aliasu čárového kódu k produktu nebo variantě.',
  },
  'admin.product.barcode_alt_removed': {
    en: 'Recorded when an alternate barcode alias is removed from a product or variant.',
    cs: 'Zapíše se při odebrání alternativního aliasu čárového kódu z produktu nebo varianty.',
  },
  'admin.product.barcode_alt_promoted': {
    en: 'Recorded when an alternate barcode is promoted to become the primary barcode.',
    cs: 'Zapíše se, když je alternativní čárový kód povýšen na primární.',
  },
  'pickup.device.paired': {
    en: 'Recorded when pickup staff successfully pair a counter tablet using an admin-issued pairing code.',
    cs: 'Zapíše se po úspěšném spárování pickup zařízení pomocí párovacího kódu z administrace.',
  },
  'pickup.device.pairing.failed': {
    en: 'Recorded when pickup device pairing is rejected (invalid code, inactive device, etc.).',
    cs: 'Zapíše se při zamítnutí spárování pickup zařízení (neplatný kód, neaktivní zařízení atd.).',
  },
  'pickup.fulfillment.claim.acquired': {
    en: 'Recorded when pickup staff acquire a soft claim on an order fulfillment (counter tablet lease).',
    cs: 'Zapíše se, když pickup personál získá soft claim na vyzvednutí objednávky (lease tabletu).',
  },
  'pickup.fulfillment.claim.released': {
    en: 'Recorded when pickup staff release their soft claim on an order fulfillment.',
    cs: 'Zapíše se, když pickup personál uvolní soft claim na vyzvednutí objednávky.',
  },
  'dev.tenant.created': {
    en: 'Recorded when platform staff create a brand-new organization in the dev tools. One line per new organization. Invitation links and passwords are not stored here.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích založí novou organizaci. Jeden řádek za novou organizaci. Odkazy z pozvánek a hesla se sem neukládají.',
  },
  'dev.tenant.updated': {
    en: 'Recorded when platform staff change an organization’s code or display name. One line per successful update.',
    cs: 'Zapíše se, když pracovníci platformy změní kód nebo zobrazované jméno organizace. Jeden řádek za úspěšnou změnu.',
  },
  'dev.tenant.provider.updated': {
    en: 'Recorded when platform staff change payment provider settings for an organization in dev tools. One line per successful update.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích změní nastavení platebního poskytovatele organizace. Jeden řádek za úspěšnou změnu.',
  },
  'dev.tenant.entitlement_policy.changed': {
    en: 'Recorded when platform staff change tenant feature-policy entitlement rows in dev tools. One line per successful save with revision metadata.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích změní řádky politiky funkcí (entitlement). Jeden řádek za úspěšné uložení s metadaty revize.',
  },
  'payment.transaction.state_changed': {
    en: 'Recorded automatically when a payment moves to a new status (paid, cancelled, etc.). One line per status change. If writing the line fails, the payment still changes.',
    cs: 'Zapíše se automaticky, když platba přejde do nového stavu (zaplaceno, zrušeno atd.). Jeden řádek za změnu stavu. Když se zápis nepovede, platba se stejně změní.',
  },
  'payment.admin_manual_complete': {
    en: 'Recorded when an admin marks a pending bank-transfer order as paid at the counter. One line per successful mark (idempotent replays reuse the same line).',
    cs: 'Zapíše se, když administrátor označí čekající bankovní objednávku jako zaplacenou u pokladny. Jeden řádek za úspěšné označení (idempotentní opakování používá stejný řádek).',
  },
  'webhook_skipped_tenant_inactive': {
    en: 'Recorded when a payment webhook is acknowledged without money mutation because the tenant is deactivated, deleted, or legally closed.',
    cs: 'Zapíše se, když je platební webhook potvrzen bez peněžní mutace, protože tenant je deaktivovaný, smazaný nebo právně uzavřený.',
  },
  'payment.customer.refund.requested': {
    en: 'Recorded when a customer submits a refund request from the PWA after a failed or timed-out payment. One line per request (duplicate submissions are idempotent).',
    cs: 'Zapíše se, když zákazník odešle žádost o vrácení z PWA po neúspěšné nebo expirované platbě. Jeden řádek za žádost (opakované odeslání je idempotentní).',
  },
  'reconciliation.transaction.refund_candidate.marked': {
    en: 'Recorded when staff mark a bank payment as needing a possible refund check. One line per mark. Does not send money back by itself.',
    cs: 'Zapíše se, když pracovník označí bankovní platbu k možné kontrole vrácení peněz. Jeden řádek za označení. Samo o sobě peníze nevrací.',
  },
  'reconciliation.transaction.refund_candidate.unmarked': {
    en: 'Recorded when staff remove the “needs refund check” flag from a payment. One line per removal.',
    cs: 'Zapíše se, když pracovník zruší příznak „kontrola vrácení“ u platby. Jeden řádek za zrušení.',
  },
  'reconciliation.bank_inbound.matched': {
    en: 'Recorded when an inbound bank movement is automatically matched to an open order or donation obligation.',
    cs: 'Zapíše se, když je příchozí bankovní pohyb automaticky spárován s otevřenou objednávkou nebo závazkem daru.',
  },
  'reconciliation.bank_inbound.attribute': {
    en: 'Recorded when staff manually attribute an inbound bank movement to a transaction.',
    cs: 'Zapíše se, když pracovník ručně přiřadí příchozí bankovní pohyb k transakci.',
  },
  'reconciliation.payment_claim.submitted': {
    en: 'Recorded when a customer submits a payment claim for an orphan inbound transfer.',
    cs: 'Zapíše se, když zákazník nahlásí platbu za nespárovaný příchozí převod.',
  },
  'reconciliation.payment_claim.approved': {
    en: 'Recorded when a payment claim is approved and linked to a transaction.',
    cs: 'Zapíše se, když je nahlášení platby schváleno a propojeno s transakcí.',
  },
  'reconciliation.payment_claim.rejected': {
    en: 'Recorded when a payment claim is rejected by staff review.',
    cs: 'Zapíše se, když pracovník zamítne nahlášení platby.',
  },
  'reconciliation.recurring_payment.missed': {
    en: 'Recorded when an expected recurring donation payment was not received by the due date.',
    cs: 'Zapíše se, když očekávaná platba pravidelného daru nedorazila do termínu splatnosti.',
  },
  'reconciliation.recurring_payment.received': {
    en: 'Recorded when an inbound bank match advances a recurring donation schedule.',
    cs: 'Zapíše se, když příchozí bankovní párování posune plán pravidelného daru.',
  },
  'reconciliation.bank_account.mode_changed': {
    en: 'Recorded when bank account reconciliation or customer claim mode is changed.',
    cs: 'Zapíše se při změně režimu párování nebo nahlášení plateb u bankovního účtu.',
  },
  'payment.provider_wiring.verified': {
    en: 'Recorded when a tenant payment provider wiring probe succeeds.',
    cs: 'Zapíše se po úspěšném ověření napojení platebního poskytovatele tenanta.',
  },
  'payment.provider_wiring.verify_failed': {
    en: 'Recorded when a tenant payment provider wiring probe fails.',
    cs: 'Zapíše se po neúspěšném ověření napojení platebního poskytovatele tenanta.',
  },
  'payment.provider_wiring.invalidated': {
    en: 'Recorded when provider wiring is invalidated (e.g. Connect onboarding regression).',
    cs: 'Zapíše se při zneplatnění napojení poskytovatele (např. regrese Stripe Connect).',
  },
  'payment.cash_provider.risk_ack': {
    en: 'Recorded when an operator acknowledges cash payment risk on the cash provider policy.',
    cs: 'Zapíše se po potvrzení rizika hotovostní platby u politiky cash poskytovatele.',
  },
  'payment.cash_checkout.self_confirm': {
    en: 'Recorded when a customer self-confirms sales point cash checkout (ADR-PICKUP-CASH).',
    cs: 'Zapíše se po vlastním potvrzení hotovostní platby zákazníkem u platebního místa (ADR-PICKUP-CASH).',
  },
  'payment.cash_shift.opened': {
    en: 'Recorded when a cash drawer shift is opened at a sales point.',
    cs: 'Zapíše se při otevření hotovostní směny u platebního místa.',
  },
  'payment.cash_shift.closed': {
    en: 'Recorded when a cash drawer shift is closed with a counted closing balance.',
    cs: 'Zapíše se při uzavření hotovostní směny se spočítanou závěrečnou hotovostí.',
  },
  'payment.cash_drawer.open_signal': {
    en: 'Recorded when the sales point signals a physical drawer open after cash payment completion.',
    cs: 'Zapíše se, když platební místo po dokončení hotovostní platby signalizuje otevření zásuvky.',
  },
  'export.analytics.explore.exported': {
    en: 'Recorded when someone downloads a spreadsheet export from customer behavior analytics. One line per successful export. The spreadsheet contents are not copied into the audit line.',
    cs: 'Zapíše se, když někdo stáhne export tabulky z analýzy chování zákazníků. Jeden řádek za úspěšný export. Obsah tabulky se do řádku auditu nekopíruje.',
  },
  'export.analytics.dev.views': {
    en: 'Recorded when a developer exports analytics views from the Dev analytics surface. One line per export.',
    cs: 'Zapíše se, když vývojář exportuje analytické pohledy z Dev analytics. Jeden řádek za export.',
  },
  'export.analytics.mission_control.exported': {
    en: 'Recorded when someone downloads a Mission Control tenant breakdown CSV export. One line per successful export.',
    cs: 'Zapíše se, když někdo stáhne CSV export tenantů z Mission Control. Jeden řádek za úspěšný export.',
  },
  'analytics.mission_control.cross_tenant.read': {
    en: 'Recorded when an elevated operator reads Mission Control metrics across multiple tenants.',
    cs: 'Zapíše se, když oprávněný operátor čte metriky Mission Control napříč tenanty.',
  },
  'export.analytics.rollups.materialized': {
    en: 'Recorded when scheduled analytics rollup snapshots are materialized for reporting. One line per materialization run.',
    cs: 'Zapíše se při materializaci plánovaných analytických agregací pro reporty. Jeden řádek za běh materializace.',
  },
  'export.transactions.exported': {
    en: 'Recorded when an operator exports transaction rows to CSV.',
    cs: 'Zapíše se, když operátor exportuje transakce do CSV.',
  },
  'export.fulfillment.exported': {
    en: 'Recorded when an operator exports fulfillment rows to CSV.',
    cs: 'Zapíše se, když operátor exportuje vyzvednutí do CSV.',
  },
  'export.compliance.audit_events.exported': {
    en: 'Recorded when an operator exports compliance audit events to CSV.',
    cs: 'Zapíše se, když operátor exportuje compliance audit události do CSV.',
  },
  'export.consent.grantees': {
    en: 'Recorded when an operator exports active consent grantees for GDPR processing. One line per successful export. Personal data from the export file is not copied into the audit row.',
    cs: 'Zapíše se, když operátor exportuje aktivní příjemce souhlasů pro zpracování podle GDPR. Jeden řádek za úspěšný export. Osobní údaje ze souboru exportu se do řádku auditu nekopírují.',
  },
  'customer_pickup_ack_informational': {
    en: 'Recorded when a customer taps “I picked up my order” on a prepay order detail (informational self-report only). One line per transaction. Does not change fulfillment state.',
    cs: 'Zapíše se, když zákazník na detailu prepaid objednávky potvrdí „Vyzvedl jsem objednávku“ (pouze informativní). Jeden řádek za transakci. Nemění stav vyzvednutí.',
  },
  'customer.receipt.downloaded': {
    en: 'Recorded when a customer downloads a receipt PDF from their account. One line per download. PDF bytes are not stored in the audit row.',
    cs: 'Zapíše se, když zákazník stáhne PDF účtenku ze svého účtu. Jeden řádek za stažení. Obsah PDF se v řádku auditu neukládá.',
  },
  'gdpr.erasure.completed': {
    en: 'Recorded when a confirmed GDPR erasure request is finished and personal data is removed or anonymized as required. One line per completed request. The person’s email is not stored in this line.',
    cs: 'Zapíše se po dokončení potvrzené žádosti o výmaz podle GDPR a odstranění nebo anonymizaci údajů. Jeden řádek za dokončenou žádost. E-mail dotčené osoby se v řádku neukládá.',
  },
  'gdpr.erasure.side_effects_pending': {
    en: 'Recorded when a GDPR erasure request completed in the database but follow-up side-effects (sessions, analytics, auth artifacts) failed and need operator retry.',
    cs: 'Zapíše se, když žádost o výmaz byla v databázi dokončena, ale následné vedlejší účinky (relace, analytika, autentizační artefakty) selhaly a vyžadují ruční opakování.',
  },
};
