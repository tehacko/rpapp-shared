import { type AuditEventCode } from './auditEventCodes.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing audit event descriptions (cs + en): when the row is written, scope, and exclusions. */
export const AUDIT_EVENT_DESCRIPTIONS: Record<AuditEventCode, LocalizedLabel> = {
  'auth.admin.login.success': {
    en: 'Written immediately after a successful admin-panel login. One row per login attempt that passes authentication; the actor is the signed-in admin user. Captures request IP, user agent, and auth channel only — passwords, tokens, and email addresses are never stored in metadata.',
    cs: 'Zapisuje se ihned po úspěšném přihlášení do administračního panelu. Jeden řádek na každý pokus o přihlášení, který projde autentizací; aktorem je přihlášený administrátor. Ukládá se IP adresa, user agent a kanál přihlášení — hesla, tokeny ani e-mailové adresy se v metadatech neukládají.',
  },
  'auth.admin.login.failed': {
    en: 'Written after a failed admin-panel login attempt. The actor is null and outcome is FAILURE. Only the attempted username (trimmed) is recorded — no password, email, or lockout counters.',
    cs: 'Zapisuje se po neúspěšném pokusu o přihlášení do administračního panelu. Actor je null a výsledek je FAILURE. Ukládá se pouze zadané uživatelské jméno (ořezané) — ne heslo, e-mail ani počítadla blokování.',
  },
  'auth.admin.logout': {
    en: 'Written when an authenticated admin explicitly logs out of the admin panel. One row per logout action for the signing-out admin user.',
    cs: 'Zapisuje se, když se přihlášený administrátor explicitně odhlásí z administračního panelu. Jeden řádek na každé odhlášení daného administrátora.',
  },
  'auth.admin.access.denied': {
    en: 'Written when an authenticated admin hits a route protected by RBAC and lacks the required capability. Outcome is DENIED; metadata records the missing capability name and requested route. Does not log request body or query parameters.',
    cs: 'Zapisuje se, když přihlášený administrátor narazí na routu chráněnou RBAC a nemá požadovanou capability. Výsledek je DENIED; metadata obsahuje název chybějící capability a požadovanou routu. Tělo požadavku ani query parametry se nelogují.',
  },
  'admin.invite.created': {
    en: 'Written when a pending super-admin invite is created for a tenant — either from delegated user creation or during dev tenant provisioning with an invite email. Records the pending admin user id; invite delivery is tracked separately via the outbox.',
    cs: 'Zapisuje se při vytvoření pending pozvánky super-admina pro tenanta — buď z delegovaného vytvoření uživatele, nebo při dev provisioning tenanta s invite e-mailem. Ukládá se id pending administrátora; doručení pozvánky se sleduje zvlášť přes outbox.',
  },
  'admin.invite.resent': {
    en: 'Written when a super-admin invite email is resent to a pending admin user. One row per resend action; does not include the raw invite token or recipient email.',
    cs: 'Zapisuje se při opětovném odeslání invite e-mailu pending administrátorovi. Jeden řádek na každé opětovné odeslání; neobsahuje raw invite token ani e-mail příjemce.',
  },
  'admin.invite.activated': {
    en: 'Written when a pending super-admin completes invite activation (sets password and becomes active). Links to the pending or newly active admin user id; credentials are never stored in metadata.',
    cs: 'Zapisuje se, když pending super-admin dokončí aktivaci pozvánky (nastaví heslo a stane se aktivním). Vazba na id pending nebo nově aktivního administrátora; přihlašovací údaje se v metadatech neukládají.',
  },
  'admin.account.username_changed': {
    en: 'Written after an admin successfully changes their own login username. Metadata holds the new username only; the previous username is not recorded.',
    cs: 'Zapisuje se po úspěšné změně vlastního přihlašovacího jména administrátorem. Metadata obsahují pouze nové uživatelské jméno; předchozí jméno se neukládá.',
  },
  'admin.account.password_changed': {
    en: 'Written after an admin successfully changes their own password. Metadata is empty by design — no password, hash, or reset token is ever logged.',
    cs: 'Zapisuje se po úspěšné změně vlastního hesla administrátorem. Metadata jsou záměrně prázdná — heslo, hash ani reset token se nikdy nelogují.',
  },
  'admin.credentials.provider_secret.set': {
    en: 'Written when a payment-provider API secret is first stored or replaced for a tenant. Records provider kind and id only; the secret value itself is never written to the audit row.',
    cs: 'Zapisuje se při prvním uložení nebo nahrazení API secretu platebního providera pro tenanta. Ukládá se pouze druh a id providera; samotná hodnota secretu se do auditního řádku nikdy nezapisuje.',
  },
  'admin.credentials.provider_secret.rotated': {
    en: 'Written when an existing tenant payment-provider secret is rotated in place. One row per rotated provider reference; secret material is excluded from metadata.',
    cs: 'Zapisuje se při rotaci existujícího secretu platebního providera tenanta. Jeden řádek na každou rotovanou referenci providera; secret se z metadat vylučuje.',
  },
  'admin.credentials.provider_secret.deleted': {
    en: 'Written when a tenant payment-provider credential is removed. Records which provider was deleted; does not archive the former secret.',
    cs: 'Zapisuje se při odstranění credentialu platebního providera tenanta. Ukládá se, který provider byl smazán; bývalý secret se nearchivuje.',
  },
  'admin.credentials.bank_secret.set': {
    en: 'Written when tenant bank-transfer payment configuration (account number and bank code) is saved or updated via the credentials screen. Only the provider id is logged — account numbers and bank codes are not duplicated in metadata.',
    cs: 'Zapisuje se při uložení nebo aktualizaci konfigurace bankovního převodu tenanta (číslo účtu a kód banky) přes obrazovku credentialů. Loguje se pouze id providera — čísla účtů a kódy bank se v metadatech neopakují.',
  },
  'admin.credentials.bank_secret.rotated': {
    en: 'Reserved for when an existing bank-transfer credential is rotated without a full delete-and-set cycle. When emitted, records the provider id only; no account numbers or secrets appear in metadata.',
    cs: 'Vyhrazeno pro rotaci existujícího bankovního credentialu bez cyklu smazat-a-nastavit. Při emitování se ukládá pouze id providera; v metadatech se neobjevují čísla účtů ani secrety.',
  },
  'admin.settings.updated': {
    en: 'Catalog event for tenant or admin settings mutations. When a writer exists, one row is appended per successful settings save; optional scope metadata identifies which settings group changed. Setting values and secrets are not logged.',
    cs: 'Katalogová událost pro mutace nastavení tenanta nebo administrace. Po přidání writeru se při každém úspěšném uložení zapíše jeden řádek; volitelné metadata scope identifikují změněnou skupinu nastavení. Hodnoty nastavení a secrety se nelogují.',
  },
  'admin.user.created': {
    en: 'Written when a delegated admin user is created for the tenant (non-invite path). Records the new user id; role and email are resolved at read time via joins, not stored in metadata.',
    cs: 'Zapisuje se při vytvoření delegovaného admin uživatele pro tenanta (cesta bez invite). Ukládá se id nového uživatele; role a e-mail se při čtení řeší joiny, ne ukládají do metadat.',
  },
  'admin.user.deactivated': {
    en: 'Written when an admin user is soft-deactivated and can no longer sign in. One row per deactivation; active sessions are not individually enumerated.',
    cs: 'Zapisuje se při soft-deaktivaci admin uživatele, který se už nemůže přihlásit. Jeden řádek na deaktivaci; aktivní session se nevyjmenovávají jednotlivě.',
  },
  'admin.user.reactivated': {
    en: 'Written when a previously deactivated admin user is restored to active status. One row per reactivation for the affected user id.',
    cs: 'Zapisuje se při obnovení dříve deaktivovaného admin uživatele do aktivního stavu. Jeden řádek na reaktivaci pro dané user id.',
  },
  'admin.user.permanently_deleted': {
    en: 'Written when an admin user row is permanently removed from the tenant. Irreversible deletion is counted once; related audit history for other resources is retained.',
    cs: 'Zapisuje se při trvalém odstranění řádku admin uživatele z tenanta. Nezvratné smazání se počítá jednou; související auditní historie ostatních zdrojů zůstává.',
  },
  'admin.product.deactivated': {
    en: 'Written when a product is deactivated and hidden from kiosk sale. The product row remains; only availability changes.',
    cs: 'Zapisuje se při deaktivaci produktu a skrytí z prodeje na kiosku. Řádek produktu zůstává; mění se pouze dostupnost.',
  },
  'admin.product.reactivated': {
    en: 'Written when a deactivated product is made available again on kiosks. One row per reactivation.',
    cs: 'Zapisuje se, když je deaktivovaný produkt znovu zpřístupněn na kioscích. Jeden řádek na reaktivaci.',
  },
  'admin.product.permanently_deleted': {
    en: 'Written when a product is permanently deleted and cannot be reactivated. Counted once per product id; historical transactions referencing the product are not rewritten.',
    cs: 'Zapisuje se při trvalém smazání produktu, který už nelze reaktivovat. Počítá se jednou na product id; historické transakce odkazující na produkt se nepřepisují.',
  },
  'admin.kiosk.deactivated': {
    en: 'Written when a kiosk is deactivated and stops accepting new sessions. Existing in-flight payments are out of scope for this event.',
    cs: 'Zapisuje se při deaktivaci kiosku, který přestane přijímat nové session. Probíhající platby jsou mimo rozsah této události.',
  },
  'admin.kiosk.reactivated': {
    en: 'Written when a deactivated kiosk is returned to active service. One row per kiosk reactivation.',
    cs: 'Zapisuje se při obnovení deaktivovaného kiosku do aktivního provozu. Jeden řádek na reaktivaci kiosku.',
  },
  'admin.kiosk.permanently_deleted': {
    en: 'Written when a kiosk is permanently removed. Counted once; past transaction and audit rows for the kiosk id are retained for compliance.',
    cs: 'Zapisuje se při trvalém odstranění kiosku. Počítá se jednou; minulé transakční a auditní řádky pro dané kiosk id zůstávají kvůli compliance.',
  },
  'admin.tenant.deactivated': {
    en: 'Written when a tenant contract is closed or soft-deleted (legal hold, dev delete without physical wipe, etc.). Metadata may include mode, trigger, and reason; customer PII is not copied into the audit row.',
    cs: 'Zapisuje se při ukončení smlouvy tenanta nebo soft smazání (legal hold, dev delete bez fyzického vymazání atd.). Metadata mohou obsahovat mode, trigger a důvod; PII zákazníků se do auditního řádku nekopíruje.',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Written when a tenant undergoes physical deletion orchestration. Emitted once per delete run; metadata may include offboarding evidence references and deleted-customer counts, not raw customer records.',
    cs: 'Zapisuje se při fyzickém smazání tenanta orchestrací. Emituje se jednou na běh smazání; metadata mohou obsahovat reference offboarding evidence a počty smazaných zákazníků, ne raw záznamy zákazníků.',
  },
  'admin.tenant.reactivated': {
    en: 'Written when a deactivated tenant is reactivated via dev or lifecycle tooling. Records tenant code/id; does not replay prior deactivation metadata.',
    cs: 'Zapisuje se při reaktivaci deaktivovaného tenanta přes dev nebo lifecycle nástroje. Ukládá se code/id tenanta; dřívější metadata deaktivace se neopakují.',
  },
  'admin.donation_template.created': {
    en: 'Written when a new donation amount template is created for the tenant. Metadata may include template id, name, currency, item count, and idempotency key — not individual amount labels beyond counts.',
    cs: 'Zapisuje se při vytvoření nové šablony donation částek pro tenanta. Metadata mohou obsahovat id šablony, název, měnu, počet položek a idempotency key — ne jednotlivé popisky částek nad rámec počtů.',
  },
  'admin.donation_template.updated': {
    en: 'Written when an existing donation amount template is edited. One row per successful update; template field values are summarized in metadata, not full JSON snapshots.',
    cs: 'Zapisuje se při úpravě existující šablony donation částek. Jeden řádek na úspěšnou aktualizaci; hodnoty polí šablony jsou v metadatech shrnuty, ne jako plné JSON snapshoty.',
  },
  'admin.donation_template.default_set': {
    en: 'Written when a donation template is marked as the tenant default. Previous default assignment is not logged as a separate row.',
    cs: 'Zapisuje se, když je donation šablona označena jako výchozí pro tenanta. Předchozí výchozí přiřazení se neloguje jako samostatný řádek.',
  },
  'admin.kiosk.donation_projects.updated': {
    en: 'Written when donation project assignments for a kiosk are saved. Metadata includes kiosk id and optional project count; project names and external ids are not bulk-exported into metadata.',
    cs: 'Zapisuje se při uložení přiřazení donation projektů pro kiosk. Metadata obsahují kiosk id a volitelný počet projektů; názvy projektů a externí id se hromadně neexportují do metadat.',
  },
  'admin.kiosk.donation_amounts.updated': {
    en: 'Written when donation amount templates linked to a kiosk are updated. Records kiosk id and optional template count; amount values themselves stay in configuration tables.',
    cs: 'Zapisuje se při aktualizaci donation amount šablon navázaných na kiosk. Ukládá se kiosk id a volitelný počet šablon; samotné částky zůstávají v konfiguračních tabulkách.',
  },
  'dev.tenant.created': {
    en: 'Written by the DEV tenant provisioning API after a new tenant row and payment bootstrap succeed. Scoped to SUPER_DEV tooling — visible in compliance UI via the dev.* prefix filter. Metadata records tenant code, display name, and whether a super-admin invite was queued; no invite tokens or credentials are stored.',
    cs: 'Zapisuje nástroj DEV tenant provisioning API po úspěšném vytvoření řádku tenanta a payment bootstrapu. Patří do SUPER_DEV nástrojů — v compliance UI viditelné přes filtr prefixu dev.*. Metadata obsahují code tenanta, zobrazované jméno a zda byla zařazena super-admin pozvánka; invite tokeny ani credentialy se neukládají.',
  },
  'dev.tenant.updated': {
    en: 'Written when DEV provisioning updates an existing tenant’s code or display name. One row per successful update; payment configuration changes use separate credential audit codes.',
    cs: 'Zapisuje se, když DEV provisioning aktualizuje code nebo zobrazované jméno existujícího tenanta. Jeden řádek na úspěšnou aktualizaci; změny payment konfigurace mají samostatné audit kódy credentialů.',
  },
  'payment.transaction.state_changed': {
    en: 'Written by the system actor when a payment transaction’s status changes (e.g. completion, cancellation, gateway notify). One row per transition with fromStatus and toStatus; IP and user agent are omitted. Failed audit writes do not roll back the payment.',
    cs: 'Zapisuje system actor při změně stavu platební transakce (např. dokončení, zrušení, gateway notify). Jeden řádek na přechod s fromStatus a toStatus; IP a user agent se neukládají. Selhání audit zápisu nevrátí platbu zpět.',
  },
  'reconciliation.transaction.refund_candidate.marked': {
    en: 'Written when an admin marks a transaction as an active refund candidate for bank-transfer reconciliation. Captures previous and next note/resolved-at flags; idempotent replays do not create duplicate rows.',
    cs: 'Zapisuje se, když administrátor označí transakci jako aktivní refund kandidáta pro bankovní reconciliaci. Zachytí předchozí a nové poznámky/resolved-at příznaky; idempotentní replay nevytváří duplicitní řádky.',
  },
  'reconciliation.transaction.refund_candidate.unmarked': {
    en: 'Written when an admin clears the refund-candidate flag on a transaction. Records the prior active state and note snapshot; does not perform the financial refund itself.',
    cs: 'Zapisuje se, když administrátor zruší příznak refund kandidáta u transakce. Ukládá předchozí aktivní stav a snapshot poznámky; samotný finanční refund neprovádí.',
  },
  'export.analytics.explore.exported': {
    en: 'Written after a successful Analytics Explore CSV export is generated for download. Metadata includes row count and optional date range; exported cell values are not duplicated into the audit row.',
    cs: 'Zapisuje se po úspěšném vygenerování CSV exportu z Analytics Explore ke stažení. Metadata obsahují počet řádků a volitelný rozsah dat; exportované hodnoty buněk se do auditního řádku nekopírují.',
  },
  'gdpr.erasure.completed': {
    en: 'Written in the same database transaction when a verified Art. 17 erasure request finishes successfully. System actor; metadata counts anonymized customers and deleted marketing/analytics consents for the tenant — never the subject’s raw email. Linked to the data-subject request id for compliance drill-down.',
    cs: 'Zapisuje se ve stejné DB transakci po úspěšném dokončení ověřené žádosti o výmaz dle čl. 17 GDPR. System actor; metadata počítají anonymizované zákazníky a smazané marketing/analytics souhlasy pro tenanta — nikdy raw e-mail subjektu. Propojeno s id žádosti subjektu údajů pro compliance drill-down.',
  },
};
