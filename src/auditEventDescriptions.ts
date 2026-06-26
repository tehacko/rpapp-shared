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
  'admin.product.deactivated': {
    en: 'Recorded when a product is hidden and cannot be sold on kiosks until turned back on. One line per product. The product file is not erased.',
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
    cs: 'Zapíše se, když je výdejní místo deaktivováno a už není dostupné pro předání zákazníkovi. Jeden řádek za výdejní místo.',
  },
  'admin.pickupPoint.reactivated': {
    en: 'Recorded when a deactivated pickup point is reactivated and offered again. One line per pickup point.',
    cs: 'Zapíše se, když je deaktivované výdejní místo znovu aktivováno a opět nabízeno. Jeden řádek za výdejní místo.',
  },
  'admin.pickupPoint.permanently_deleted': {
    en: 'Recorded when a pickup point is permanently removed from configuration. One line per pickup point. Past audit and payment traces stay.',
    cs: 'Zapíše se, když je výdejní místo trvale odstraněno z konfigurace. Jeden řádek za výdejní místo. Staré auditní a platební stopy zůstávají.',
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
    cs: 'Zapíše se, když je prodejní místo vypnuté pro zákazníky. Jeden řádek za prodejní místo. Platby už rozjeté se řeší zvlášť.',
  },
  'admin.salesPoint.reactivated': {
    en: 'Recorded when a turned-off sales point is enabled again. One line per sales point.',
    cs: 'Zapíše se, když je vypnuté prodejní místo znovu zapnuté. Jeden řádek za prodejní místo.',
  },
  'admin.salesPoint.permanently_deleted': {
    en: 'Recorded when a sales point is removed from the system for good. One line per sales point. Old payment and audit records stay for compliance.',
    cs: 'Zapíše se, když je prodejní místo trvale odstraněno ze systému. Jeden řádek za prodejní místo. Staré platby a audit zůstávají kvůli evidenci.',
  },
  'admin.tenant.deactivated': {
    en: 'Recorded when an entire customer organization (tenant) is closed or suspended. One line per closure. Customer personal data is not copied into this line.',
    cs: 'Zapíše se, když je celá zákaznická organizace (tenant) uzavřena nebo pozastavena. Jeden řádek za uzavření. Osobní údaje zákazníků se do řádku nekopírují.',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Recorded when an organization is fully deleted from the system. One line per delete run. Summary counts may appear, not full customer lists.',
    cs: 'Zapíše se, když je organizace kompletně smazána ze systému. Jeden řádek za běh mazání. Mohou být souhrnná čísla, ne celé seznamy zákazníků.',
  },
  'admin.tenant.reactivated': {
    en: 'Recorded when a closed organization is opened again. One line per reactivation.',
    cs: 'Zapíše se, když je uzavřená organizace znovu otevřena. Jeden řádek za obnovení.',
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
    cs: 'Zapíše se při uložení toho, které dárkové projekty se na prodejním místě zobrazují. Jeden řádek za uložení. Názvy všech projektů nejsou v řádku auditu.',
  },
  'admin.salesPoint.donation_amounts.updated': {
    en: 'Recorded when donation amount presets linked to a sales point are updated. One line per save.',
    cs: 'Zapíše se při aktualizaci přednastavených částek daru navázaných na prodejní místo. Jeden řádek za uložení.',
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
  'payment.transaction.state_changed': {
    en: 'Recorded automatically when a payment moves to a new status (paid, cancelled, etc.). One line per status change. If writing the line fails, the payment still changes.',
    cs: 'Zapíše se automaticky, když platba přejde do nového stavu (zaplaceno, zrušeno atd.). Jeden řádek za změnu stavu. Když se zápis nepovede, platba se stejně změní.',
  },
  'payment.admin_manual_complete': {
    en: 'Recorded when an admin marks a pending bank-transfer order as paid at the counter. One line per successful mark (idempotent replays reuse the same line).',
    cs: 'Zapíše se, když administrátor označí čekající bankovní objednávku jako zaplacenou u pokladny. Jeden řádek za úspěšné označení (idempotentní opakování používá stejný řádek).',
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
    en: 'Recorded when a customer self-confirms kiosk cash checkout (ADR-PICKUP-CASH).',
    cs: 'Zapíše se po vlastním potvrzení hotovostní platby zákazníkem na kiosku (ADR-PICKUP-CASH).',
  },
  'export.analytics.explore.exported': {
    en: 'Recorded when someone downloads a spreadsheet export from customer behavior analytics. One line per successful export. The spreadsheet contents are not copied into the audit line.',
    cs: 'Zapíše se, když někdo stáhne export tabulky z analýzy chování zákazníků. Jeden řádek za úspěšný export. Obsah tabulky se do řádku auditu nekopíruje.',
  },
  'export.analytics.rollups.materialized': {
    en: 'Recorded when scheduled analytics rollup snapshots are materialized for reporting. One line per materialization run.',
    cs: 'Zapíše se při materializaci plánovaných analytických agregací pro reporty. Jeden řádek za běh materializace.',
  },
  'customer_pickup_ack_informational': {
    en: 'Recorded when a customer taps “I picked up my order” on a prepay order detail (informational self-report only). One line per transaction. Does not change fulfillment state.',
    cs: 'Zapíše se, když zákazník na detailu prepaid objednávky potvrdí „Vyzvedl jsem objednávku“ (pouze informativní). Jeden řádek za transakci. Nemění stav vyzvednutí.',
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
