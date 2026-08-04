import { type AuditEventCode } from './auditEventCodes.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Plain-language audit descriptions for operators (cs + en + sk), 1–3 short sentences. */
export const AUDIT_EVENT_DESCRIPTIONS: Record<AuditEventCode, LocalizedLabel> = {
  'auth.admin.login.success': {
    en: 'Recorded when an administrator signs in successfully. One line per successful login. Passwords and full personal details are never stored in this log.',
    cs: 'Zapíše se, když se administrátor úspěšně přihlásí. Jeden řádek za každé úspěšné přihlášení. Hesla ani plné osobní údaje se v tomto záznamu neukládají.',
    sk: 'Zapíše sa, keď sa administrátor úspešne prihlási. Jeden riadok za každé úspešné prihlásenie. Heslá ani plné osobné údaje sa v tomto zázname neukladajú.',
  },
  'auth.admin.login.failed': {
    en: 'Recorded when a login attempt fails (wrong password or unknown user). One line per failed try. Only the username typed in is kept — not the password.',
    cs: 'Zapíše se, když přihlášení nevyjde (špatné heslo nebo neznámý účet). Jeden řádek za neúspěšný pokus. Ukládá se jen zadané jméno — ne heslo.',
    sk: 'Zapíše sa, keď prihlásenie nevyjde (nesprávne heslo alebo neznámy účet). Jeden riadok za neúspešný pokus. Ukladá sa len zadané meno — nie heslo.',
  },
  'auth.admin.logout': {
    en: 'Recorded when an administrator clicks sign out. One line per logout.',
    cs: 'Zapíše se, když administrátor klikne na odhlášení. Jeden řádek za odhlášení.',
    sk: 'Zapíše sa, keď administrátor klikne na odhlásenie. Jeden riadok za odhlásenie.',
  },
  'auth.admin.access.denied': {
    en: 'Recorded when a signed-in administrator tries to open a page or action they are not allowed to use. One line per blocked attempt. Does not save what they typed in forms.',
    cs: 'Zapíše se, když přihlášený administrátor zkusí otevřít stránku nebo akci, na kterou nemá právo. Jeden řádek za zamítnutý pokus. Neukládá to, co psal do formulářů.',
    sk: 'Zapíše sa, keď prihlásený administrátor skúsi otvoriť stránku alebo akciu, na ktorú nemá právo. Jeden riadok za zamietnutý pokus. Neukladá to, čo písal do formulárov.',
  },
  'auth.admin.password_reset.requested': {
    en: 'Recorded when an administrator requests a password reset email. One line per request. The reset link itself is not stored here.',
    cs: 'Zapíše se, když administrátor požádá o e-mail pro obnovení hesla. Jeden řádek za požadavek. Odkaz pro obnovení se sem neukládá.',
    sk: 'Zapíše sa, keď administrátor požiada o e-mail na obnovenie hesla. Jeden riadok za požiadavku. Odkaz na obnovenie sa sem neukladá.',
  },
  'auth.admin.password_reset.completed': {
    en: 'Recorded when an administrator completes a password reset using a valid token. One line per successful reset. Passwords are never stored in this log.',
    cs: 'Zapíše se, když administrátor dokončí obnovení hesla platným odkazem. Jeden řádek za úspěšné obnovení. Hesla se v tomto záznamu neukládají.',
    sk: 'Zapíše sa, keď administrátor dokončí obnovenie hesla platným odkazom. Jeden riadok za úspešné obnovenie. Heslá sa v tomto zázname neukladajú.',
  },
  'auth.admin.password_reset.failed': {
    en: 'Recorded when a password reset attempt fails (invalid or expired token). One line per failed attempt. Passwords are never stored in this log.',
    cs: 'Zapíše se, když obnovení hesla nevyjde (neplatný nebo vypršelý odkaz). Jeden řádek za neúspěšný pokus. Hesla se v tomto záznamu neukládají.',
    sk: 'Zapíše sa, keď obnovenie hesla nevyjde (neplatný alebo expirovaný odkaz). Jeden riadok za neúspešný pokus. Heslá sa v tomto zázname neukladajú.',
  },
  'auth.admin.mfa.enroll.success': {
    en: 'Recorded when an administrator finishes MFA enrollment. One line per successful enroll. Secrets and recovery codes are never stored here.',
    cs: 'Zapíše se, když administrátor dokončí registraci MFA. Jeden řádek za úspěšnou registraci. Tajné klíče ani záložní kódy se sem neukládají.',
    sk: 'Zapíše sa, keď administrátor dokončí registráciu MFA. Jeden riadok za úspešnú registráciu. Tajné kľúče ani záložné kódy sa sem neukladajú.',
  },
  'auth.admin.mfa.enroll.failed': {
    en: 'Recorded when MFA enrollment fails (invalid TOTP or validation error). One line per failed attempt.',
    cs: 'Zapíše se, když registrace MFA selže (neplatný TOTP nebo chyba validace). Jeden řádek za neúspěšný pokus.',
    sk: 'Zapíše sa, keď registrácia MFA zlyhá (neplatný TOTP alebo chyba validácie). Jeden riadok za neúspešný pokus.',
  },
  'auth.admin.mfa.disable.success': {
    en: 'Recorded when an administrator successfully disables MFA on their account. One line per successful disable. Secrets are never stored here.',
    cs: 'Zapíše se, když administrátor úspěšně vypne MFA na svém účtu. Jeden řádek za úspěšné vypnutí. Tajné klíče se sem neukládají.',
    sk: 'Zapíše sa, keď administrátor úspešne vypne MFA na svojom účte. Jeden riadok za úspešné vypnutie. Tajné kľúče sa sem neukladajú.',
  },
  'auth.admin.mfa.disable.failed': {
    en: 'Recorded when an MFA disable attempt fails (invalid confirmation or validation error). One line per failed attempt.',
    cs: 'Zapíše se, když vypnutí MFA selže (neplatné potvrzení nebo chyba validace). Jeden řádek za neúspěšný pokus.',
    sk: 'Zapíše sa, keď vypnutie MFA zlyhá (neplatné potvrdenie alebo chyba validácie). Jeden riadok za neúspešný pokus.',
  },
  'auth.admin.mfa.challenge.success': {
    en: 'Recorded when an MFA login challenge succeeds. One line per successful challenge.',
    cs: 'Zapíše se, když MFA výzva při přihlášení uspěje. Jeden řádek za úspěšnou výzvu.',
    sk: 'Zapíše sa, keď MFA výzva pri prihlásení uspeje. Jeden riadok za úspešnú výzvu.',
  },
  'auth.admin.mfa.challenge.failed': {
    en: 'Recorded when an MFA login challenge fails. One line per failed attempt.',
    cs: 'Zapíše se, když MFA výzva při přihlášení selže. Jeden řádek za neúspěšný pokus.',
    sk: 'Zapíše sa, keď MFA výzva pri prihlásení zlyhá. Jeden riadok za neúspešný pokus.',
  },
  'auth.admin.step_up.success': {
    en: 'Recorded when admin step-up verification succeeds and a stepUpUntil claim is issued. One line per success.',
    cs: 'Zapíše se, když dodatečné ověření správce uspěje a je vydán časový nárok na citlivé akce. Jeden řádek za úspěch.',
    sk: 'Zapíše sa, keď dodatočné overenie správcu uspeje a je vydaný časový nárok na citlivé akcie. Jeden riadok za úspech.',
  },
  'auth.admin.step_up.failed': {
    en: 'Recorded when admin step-up verification fails. One line per failed attempt.',
    cs: 'Zapíše se, když dodatečné ověření správce selže. Jeden řádek za neúspěšný pokus.',
    sk: 'Zapíše sa, keď dodatočné overenie správcu zlyhá. Jeden riadok za neúspešný pokus.',
  },
  'auth.admin.break_glass.success': {
    en: 'Recorded when a ticketed break-glass override is accepted (incident id + reason). The env token itself is never stored.',
    cs: 'Zapíše se, když je přijato nouzové přepsání s evidovaným incidentem a důvodem. Samotný přístupový kód z prostředí se neukládá.',
    sk: 'Zapíše sa, keď je prijaté núdzové prepísanie s evidovaným incidentom a dôvodom. Samotný prístupový kód z prostredia sa neukladá.',
  },
  'auth.admin.break_glass.failed': {
    en: 'Recorded when a break-glass override is rejected (invalid token, staging pattern in prod, or missing ticket fields).',
    cs: 'Zapíše se, když je nouzové přepsání odmítnuto (neplatný kód, stagingový vzor v produkci, nebo chybějící údaje o incidentu).',
    sk: 'Zapíše sa, keď je núdzové prepísanie odmietnuté (neplatný kód, stagingový vzor v produkcii alebo chýbajúce údaje o incidente).',
  },
  'auth.admin.oidc.login.success': {
    en: 'Recorded when an administrator signs in successfully via Google or Apple OIDC. One line per successful federated login. Tokens are never stored here.',
    cs: 'Zapíše se, když se administrátor úspěšně přihlásí přes Google nebo Apple. Jeden řádek za úspěšné federované přihlášení. Tokeny se sem neukládají.',
    sk: 'Zapíše sa, keď sa administrátor úspešne prihlási cez Google alebo Apple. Jeden riadok za úspešné federované prihlásenie. Tokeny sa sem neukladajú.',
  },
  'auth.admin.oidc.login.failed': {
    en: 'Recorded when an admin/dev OIDC login fails (unknown subject, email mismatch, or IdP error). One line per failed attempt.',
    cs: 'Zapíše se, když admin/dev přihlášení přes Google nebo Apple selže (neznámý účet u poskytovatele, neshoda e-mailu nebo chyba identity). Jeden řádek za neúspěšný pokus.',
    sk: 'Zapíše sa, keď admin/dev prihlásenie cez Google alebo Apple zlyhá (neznámy účet u poskytovateľa, nezhoda e-mailu alebo chyba identity). Jeden riadok za neúspešný pokus.',
  },
  'auth.admin.oidc.invite.activated': {
    en: 'Recorded when an invited administrator completes activation via OIDC (PENDING → ACTIVE). One line per activation.',
    cs: 'Zapíše se, když pozvaný administrátor dokončí aktivaci přes OIDC (PENDING → ACTIVE). Jeden řádek za aktivaci.',
    sk: 'Zapíše sa, keď pozvaný administrátor dokončí aktiváciu cez OIDC (PENDING → ACTIVE). Jeden riadok za aktiváciu.',
  },
  'auth.admin.oidc.link.created': {
    en: 'Recorded when an authenticated administrator links Google or Apple as their first IdP. One line per link.',
    cs: 'Zapíše se, když přihlášený administrátor propojí Google nebo Apple jako první přihlašovací metodu. Jeden řádek za vazbu.',
    sk: 'Zapíše sa, keď prihlásený administrátor prepojí Google alebo Apple ako prvú prihlasovaciu metódu. Jeden riadok za väzbu.',
  },
  'auth.admin.oidc.link.removed': {
    en: 'Recorded when an administrator unlinks a federated IdP. One line per successful unlink.',
    cs: 'Zapíše se, když administrátor odpojí federované přihlášení (Google/Apple). Jeden řádek za úspěšné odpojení.',
    sk: 'Zapíše sa, keď administrátor odpojí federované prihlásenie (Google/Apple). Jeden riadok za úspešné odpojenie.',
  },
  'auth.admin.oidc.link.remove_denied': {
    en: 'Recorded when an OIDC unlink is denied (for example last-link forbid without a password). One line per denial.',
    cs: 'Zapíše se, když je odpojení OIDC zamítnuto (např. zákaz poslední vazby bez hesla). Jeden řádek za zamítnutí.',
    sk: 'Zapíše sa, keď je odpojenie OIDC zamietnuté (napr. zákaz poslednej väzby bez hesla). Jeden riadok za zamietnutie.',
  },
  'auth.admin.oidc.session.exchanged': {
    en: 'Recorded when a one-time OIDC session code is exchanged for a JWT or MFA-pending token. Codes and tokens are never stored here.',
    cs: 'Zapíše se, když je jednorázový kód relace OIDC vyměněn za přihlašovací token nebo token čekající na MFA. Kódy ani tokeny se sem neukládají.',
    sk: 'Zapíše sa, keď je jednorazový kód relácie OIDC vymenený za prihlasovací token alebo token čakajúci na MFA. Kódy ani tokeny sa sem neukladajú.',
  },
  'auth.admin.password.set': {
    en: 'Recorded when an OIDC-only administrator sets a backup password for the first time. Passwords are never stored in this log.',
    cs: 'Zapíše se, když administrátor pouze s OIDC nastaví poprvé záložní heslo. Hesla se v tomto záznamu neukládají.',
    sk: 'Zapíše sa, keď administrátor iba s OIDC nastaví po prvý raz záložné heslo. Heslá sa v tomto zázname neukladajú.',
  },
  'customer.oidc.login': {
    en: 'Recorded when a customer signs in via Google or Apple OIDC. One line per successful federation. Aligns customer-auth OIDC_LOGIN.',
    cs: 'Zapíše se, když se zákazník přihlásí přes Google nebo Apple. Jeden řádek za úspěšné federované přihlášení.',
    sk: 'Zapíše sa, keď sa zákazník prihlási cez Google alebo Apple. Jeden riadok za úspešné federované prihlásenie.',
  },
  'customer.oidc.email_merged': {
    en: 'Recorded when a verified IdP email silently merges onto an existing customer account. One line per merge. Tokens are never stored.',
    cs: 'Zapíše se, když ověřený e-mail z Google/Apple tiše sloučí existující zákaznický účet. Jeden řádek za sloučení. Tokeny se neukládají.',
    sk: 'Zapíše sa, keď overený e-mail z Google/Apple potichu zlúči existujúci zákaznícky účet. Jeden riadok za zlúčenie. Tokeny sa neukladajú.',
  },
  'admin.invite.created': {
    en: 'Recorded when a new administrator is invited by email and must set a password. One line per new invitation. The invitation link itself is not stored here.',
    cs: 'Zapíše se, když se pozve nový administrátor e-mailem a musí si nastavit heslo. Jeden řádek za novou pozvánku. Odkaz z pozvánky se sem neukládá.',
    sk: 'Zapíše sa, keď sa pozve nový administrátor e-mailom a musí si nastaviť heslo. Jeden riadok za novú pozvánku. Odkaz z pozvánky sa sem neukladá.',
  },
  'admin.invite.resent': {
    en: 'Recorded when the invitation email is sent again to someone who has not finished signing up. One line per resend.',
    cs: 'Zapíše se, když se znovu pošle pozvánka tomu, kdo se ještě nedokončil zaregistrovat. Jeden řádek za opětovné odeslání.',
    sk: 'Zapíše sa, keď sa znova pošle pozvánka tomu, kto sa ešte nedokončil zaregistrovať. Jeden riadok za opätovné odoslanie.',
  },
  'admin.invite.activated': {
    en: 'Recorded when the invited person finishes setup and can sign in. One line per completed activation. Passwords are never stored.',
    cs: 'Zapíše se, když pozvaný dokončí nastavení a může se přihlásit. Jeden řádek za dokončenou aktivaci. Hesla se neukládají.',
    sk: 'Zapíše sa, keď pozvaný dokončí nastavenie a môže sa prihlásiť. Jeden riadok za dokončenú aktiváciu. Heslá sa neukladajú.',
  },
  'admin.account.username_changed': {
    en: 'Recorded when an administrator changes their own sign-in name. One line per change. The old name is not kept in this log.',
    cs: 'Zapíše se, když administrátor změní své přihlašovací jméno. Jeden řádek za změnu. Staré jméno se v záznamu neuchovává.',
    sk: 'Zapíše sa, keď administrátor zmení svoje prihlasovacie meno. Jeden riadok za zmenu. Staré meno sa v zázname neuchováva.',
  },
  'admin.account.password_changed': {
    en: 'Recorded when an administrator changes their own password successfully. One line per change. The password itself is never stored.',
    cs: 'Zapíše se, když administrátor úspěšně změní své heslo. Jeden řádek za změnu. Samotné heslo se nikdy neukládá.',
    sk: 'Zapíše sa, keď administrátor úspešne zmení svoje heslo. Jeden riadok za zmenu. Samotné heslo sa nikdy neukladá.',
  },
  'admin.credentials.provider_secret.set': {
    en: 'Recorded when payment provider connection details are first saved for your organization. One line per save. Secret keys are not copied into the audit text.',
    cs: 'Zapíše se při prvním uložení připojení k platebnímu poskytovateli pro vaši organizaci. Jeden řádek za uložení. Tajné klíče se do textu auditu nekopírují.',
    sk: 'Zapíše sa pri prvom uložení pripojenia k platobnému poskytovateľovi pre vašu organizáciu. Jeden riadok za uloženie. Tajné kľúče sa do textu auditu nekopírujú.',
  },
  'admin.credentials.provider_secret.rotated': {
    en: 'Recorded when an existing payment provider secret is replaced with a new one. One line per replacement. The actual secret value is not shown.',
    cs: 'Zapíše se, když se existující tajný klíč poskytovatele nahradí novým. Jeden řádek za výměnu. Skutečná hodnota klíče se nezobrazuje.',
    sk: 'Zapíše sa, keď sa existujúci tajný kľúč poskytovateľa nahradí novým. Jeden riadok za výmenu. Skutočná hodnota kľúča sa nezobrazuje.',
  },
  'admin.credentials.provider_secret.deleted': {
    en: 'Recorded when payment provider connection details are removed. One line per removal.',
    cs: 'Zapíše se, když se odstraní připojení k platebnímu poskytovateli. Jeden řádek za odstranění.',
    sk: 'Zapíše sa, keď sa odstráni pripojenie k platobnému poskytovateľovi. Jeden riadok za odstránenie.',
  },
  'admin.credentials.bank_secret.set': {
    en: 'Recorded when bank transfer settings (account for incoming payments) are saved or updated. One line per save. Full account numbers are not repeated in the audit line.',
    cs: 'Zapíše se při uložení nebo úpravě nastavení bankovního převodu (účet pro příchozí platby). Jeden řádek za uložení. Celá čísla účtů se v řádku auditu neopakují.',
    sk: 'Zapíše sa pri uložení alebo úprave nastavenia bankového prevodu (účet pre prichádzajúce platby). Jeden riadok za uloženie. Celé čísla účtov sa v riadku auditu neopakujú.',
  },
  'admin.credentials.bank_secret.rotated': {
    en: 'Recorded when bank payment settings are updated in a “rotation” step without deleting them first. One line when this happens. Account numbers stay private.',
    cs: 'Zapíše se při aktualizaci bankovního nastavení výměnou údajů bez předchozího smazání. Jeden řádek při této akci. Čísla účtů zůstávají soukromá.',
    sk: 'Zapíše sa pri aktualizácii bankového nastavenia výmenou údajov bez predchádzajúceho zmazania. Jeden riadok pri tejto akcii. Čísla účtov zostávajú súkromné.',
  },
  'admin.settings.updated': {
    en: 'Recorded when important organization or admin settings are saved. One line per successful save when the system writes this event. Exact setting values are not listed in the audit text.',
    cs: 'Zapíše se při uložení důležitých nastavení organizace nebo administrace. Jeden řádek za úspěšné uložení, pokud systém tuto událost zapisuje. Konkrétní hodnoty nastavení nejsou v textu auditu.',
    sk: 'Zapíše sa pri uložení dôležitých nastavení organizácie alebo administrácie. Jeden riadok za úspešné uloženie, ak systém túto udalosť zapisuje. Konkrétne hodnoty nastavení nie sú v texte auditu.',
  },
  'admin.user.created': {
    en: 'Recorded when a new administrator account is created for your organization (without email invite). One line per new user.',
    cs: 'Zapíše se při vytvoření nového účtu administrátora pro vaši organizaci (bez e-mailové pozvánky). Jeden řádek za nového uživatele.',
    sk: 'Zapíše sa pri vytvorení nového účtu administrátora pre vašu organizáciu (bez e-mailovej pozvánky). Jeden riadok za nového používateľa.',
  },
  'admin.user.deactivated': {
    en: 'Recorded when an administrator is blocked from signing in but their history is kept. One line per deactivation.',
    cs: 'Zapíše se, když se administrátorovi zablokuje přihlášení, ale historie zůstane. Jeden řádek za deaktivaci.',
    sk: 'Zapíše sa, keď sa administrátorovi zablokuje prihlásenie, ale história zostane. Jeden riadok za deaktiváciu.',
  },
  'admin.user.reactivated': {
    en: 'Recorded when a blocked administrator is allowed to sign in again. One line per reactivation.',
    cs: 'Zapíše se, když se zablokovanému administrátorovi znovu povolí přihlášení. Jeden řádek za obnovení.',
    sk: 'Zapíše sa, keď sa zablokovanému administrátorovi znova povolí prihlásenie. Jeden riadok za obnovenie.',
  },
  'admin.user.permanently_deleted': {
    en: 'Recorded when an administrator account is deleted for good. One line per deletion. Other audit history stays.',
    cs: 'Zapíše se, když je účet administrátora trvale smazán. Jeden řádek za smazání. Ostatní auditní historie zůstává.',
    sk: 'Zapíše sa, keď je účet administrátora trvale zmazaný. Jeden riadok za zmazanie. Ostatná auditná história zostáva.',
  },
  'admin.capability.granted': {
    en: 'Recorded when a capability is granted to an administrator (direct grant or exception path). One line per grant. Shows target user and capability; passwords are never stored.',
    cs: 'Zapíše se, když je administrátorovi uděleno oprávnění (přímé udělení nebo výjimka). Jeden řádek za udělení. Ukazuje cílového uživatele a oprávnění; hesla se neukládají.',
    sk: 'Zapíše sa, keď je administrátorovi udelené oprávnenie (priame udelenie alebo výnimka). Jeden riadok za udelenie. Ukazuje cieľového používateľa a oprávnenie; heslá sa neukladajú.',
  },
  'admin.capability.revoked': {
    en: 'Recorded when a capability is revoked from an administrator. One line per revoke. Shows target user and capability.',
    cs: 'Zapíše se, když je administrátorovi odebráno oprávnění. Jeden řádek za odebrání. Ukazuje cílového uživatele a oprávnění.',
    sk: 'Zapíše sa, keď je administrátorovi odobraté oprávnenie. Jeden riadok za odobratie. Ukazuje cieľového používateľa a oprávnenie.',
  },
  'admin.capability.template_applied': {
    en: 'Recorded when a capability template is applied to an administrator. One line per apply. Shows target user and template id.',
    cs: 'Zapíše se, když je na administrátora aplikována šablona oprávnění. Jeden řádek za aplikaci. Ukazuje cílového uživatele a ID šablony.',
    sk: 'Zapíše sa, keď je na administrátora aplikovaná šablóna oprávnení. Jeden riadok za aplikáciu. Ukazuje cieľového používateľa a ID šablóny.',
  },
  'admin.exception_grant.requested': {
    en: 'Recorded when an exception (SoD dual-control) grant is requested for a capability. One line per request. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požádáno o výjimku oprávnění (SoD dual-control). Jeden řádek za požadavek. Ukazuje ID schválení, cílového uživatele a oprávnění.',
    sk: 'Zapíše sa, keď je požiadané o výnimku oprávnenia (SoD dual-control). Jeden riadok za požiadavku. Ukazuje ID schválenia, cieľového používateľa a oprávnenie.',
  },
  'admin.exception_grant.approved': {
    en: 'Recorded when an exception grant request is approved. One line per approval. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požadavek na výjimku oprávnění schválen. Jeden řádek za schválení. Ukazuje ID schválení, cílového uživatele a oprávnění.',
    sk: 'Zapíše sa, keď je požiadavka na výnimku oprávnenia schválená. Jeden riadok za schválenie. Ukazuje ID schválenia, cieľového používateľa a oprávnenie.',
  },
  'admin.exception_grant.rejected': {
    en: 'Recorded when an exception grant request is rejected. One line per rejection. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je požadavek na výjimku oprávnění zamítnut. Jeden řádek za zamítnutí. Ukazuje ID schválení, cílového uživatele a oprávnění.',
    sk: 'Zapíše sa, keď je požiadavka na výnimku oprávnenia zamietnutá. Jeden riadok za zamietnutie. Ukazuje ID schválenia, cieľového používateľa a oprávnenie.',
  },
  'admin.exception_grant.executed': {
    en: 'Recorded when an approved exception grant is executed and the capability is applied. One line per execution. Shows approval request id, target user, and capability.',
    cs: 'Zapíše se, když je schválená výjimka oprávnění provedena a oprávnění aplikováno. Jeden řádek za provedení. Ukazuje ID schválení, cílového uživatele a oprávnění.',
    sk: 'Zapíše sa, keď je schválená výnimka oprávnenia vykonaná a oprávnenie aplikované. Jeden riadok za vykonanie. Ukazuje ID schválenia, cieľového používateľa a oprávnenie.',
  },
  'admin.product.created': {
    en: 'Recorded when an administrator creates a new product in the catalog. One line per product.',
    cs: 'Zapíše se, když administrátor vytvoří nový produkt v katalogu. Jeden řádek za produkt.',
    sk: 'Zapíše sa, keď administrátor vytvorí nový produkt v katalógu. Jeden riadok za produkt.',
  },
  'admin.product.deactivated': {
    en: 'Recorded when a product is hidden and cannot be sold on sales points until turned back on. One line per product. The product file is not erased.',
    cs: 'Zapíše se, když je produkt skrytý a na kioscích se neprodává, dokud se znovu nezapne. Jeden řádek za produkt. Produkt se ze systému nesmaže.',
    sk: 'Zapíše sa, keď je produkt skrytý a na kioskoch sa nepredáva, kým sa znova nezapne. Jeden riadok za produkt. Produkt sa zo systému nezmaže.',
  },
  'admin.product.reactivated': {
    en: 'Recorded when a hidden product is made available for sale again. One line per product.',
    cs: 'Zapíše se, když je skrytý produkt znovu zpřístupněn k prodeji. Jeden řádek za produkt.',
    sk: 'Zapíše sa, keď je skrytý produkt znova sprístupnený na predaj. Jeden riadok za produkt.',
  },
  'admin.product.permanently_deleted': {
    en: 'Recorded when a product is deleted permanently and cannot be brought back. One line per product. Past sales records stay.',
    cs: 'Zapíše se, když je produkt trvale smazán a nelze ho obnovit. Jeden řádek za produkt. Minulé prodeje zůstávají.',
    sk: 'Zapíše sa, keď je produkt trvale zmazaný a nie je možné ho obnoviť. Jeden riadok za produkt. Minulé predaje zostávajú.',
  },
  'admin.product.price_updated': {
    en: 'Recorded when a product base price, channel price, variant price, or VAT rate changes. One line per change for the product activity timeline.',
    cs: 'Zapíše se při změně základní ceny, kanálové ceny, ceny varianty nebo sazby DPH. Jeden řádek za změnu v historii produktu.',
    sk: 'Zapíše sa pri zmene základnej ceny, kanálovej ceny, ceny variantu alebo sadzby DPH. Jeden riadok za zmenu v histórii produktu.',
  },
  'admin.product.stock_adjusted': {
    en: 'Recorded when inventory quantity for a product (or variant) is set at a sales point. One line per stock adjustment.',
    cs: 'Zapíše se, když se na prodejním místě nastaví skladové množství produktu (nebo varianty). Jeden řádek za úpravu skladu.',
    sk: 'Zapíše sa, keď sa na predajnom mieste nastaví skladové množstvo produktu (alebo variantu). Jeden riadok za úpravu skladu.',
  },
  'admin.category.deactivated': {
    en: 'Recorded when a category is switched off so its grouping is no longer active in operational lists. One line per category.',
    cs: 'Zapíše se, když je kategorie vypnuta, takže její seskupení už není aktivní v provozních seznamech. Jeden řádek za kategorii.',
    sk: 'Zapíše sa, keď je kategória vypnutá, takže jej zoskupenie už nie je aktívne v prevádzkových zoznamoch. Jeden riadok za kategóriu.',
  },
  'admin.category.reactivated': {
    en: 'Recorded when a previously deactivated category is enabled again. One line per category.',
    cs: 'Zapíše se, když je dříve deaktivovaná kategorie znovu zapnuta. Jeden řádek za kategorii.',
    sk: 'Zapíše sa, keď je skôr deaktivovaná kategória znova zapnutá. Jeden riadok za kategóriu.',
  },
  'admin.category.permanently_deleted': {
    en: 'Recorded when a category is removed permanently from the catalog setup. One line per category. Historical records remain for compliance.',
    cs: 'Zapíše se, když je kategorie trvale odstraněna z katalogu. Jeden řádek za kategorii. Historické záznamy zůstávají kvůli evidenci.',
    sk: 'Zapíše sa, keď je kategória trvale odstránená z katalógu. Jeden riadok za kategóriu. Historické záznamy zostávajú kvôli evidencii.',
  },
  'admin.variant.archived': {
    en: 'Recorded when a product variant is archived and removed from active offer management. One line per variant.',
    cs: 'Zapíše se, když je varianta produktu archivována a odstraněna z aktivní nabídky. Jeden řádek za variantu.',
    sk: 'Zapíše sa, keď je varianta produktu archivovaná a odstránená z aktívnej ponuky. Jeden riadok za variantu.',
  },
  'admin.variant.restored': {
    en: 'Recorded when an archived product variant is restored back to active management. One line per variant.',
    cs: 'Zapíše se, když je archivovaná varianta produktu obnovena do aktivní správy. Jeden řádek za variantu.',
    sk: 'Zapíše sa, keď je archivovaná varianta produktu obnovená do aktívnej správy. Jeden riadok za variantu.',
  },
  'admin.variant.permanently_deleted': {
    en: 'Recorded when a product variant is permanently deleted and cannot be restored. One line per variant.',
    cs: 'Zapíše se, když je varianta produktu trvale smazána a nelze ji obnovit. Jeden řádek za variantu.',
    sk: 'Zapíše sa, keď je varianta produktu trvale zmazaná a nie je možné ju obnoviť. Jeden riadok za variantu.',
  },
  'admin.pickupPoint.deactivated': {
    en: 'Recorded when a pickup point is deactivated and no longer available for customer handoff. One line per pickup point.',
    cs: 'Zapíše se, když je odběrné místo deaktivováno a už není dostupné pro předání zákazníkovi. Jeden řádek za odběrné místo.',
    sk: 'Zapíše sa, keď je odberné miesto deaktivované a už nie je dostupné na odovzdanie zákazníkovi. Jeden riadok za odberné miesto.',
  },
  'admin.pickupPoint.reactivated': {
    en: 'Recorded when a deactivated pickup point is reactivated and offered again. One line per pickup point.',
    cs: 'Zapíše se, když je deaktivované odběrné místo znovu aktivováno a opět nabízeno. Jeden řádek za odběrné místo.',
    sk: 'Zapíše sa, keď je deaktivované odberné miesto znova aktivované a opäť ponúkané. Jeden riadok za odberné miesto.',
  },
  'admin.pickupPoint.permanently_deleted': {
    en: 'Recorded when a pickup point is permanently removed from configuration. One line per pickup point. Past audit and payment traces stay.',
    cs: 'Zapíše se, když je odběrné místo trvale odstraněno z konfigurace. Jeden řádek za odběrné místo. Staré auditní a platební stopy zůstávají.',
    sk: 'Zapíše sa, keď je odberné miesto trvale odstránené z konfigurácie. Jeden riadok za odberné miesto. Staré auditné a platobné stopy zostávajú.',
  },
  'admin.donationProject.deactivated': {
    en: 'Recorded when a donation project is deactivated and hidden from active assignment. One line per project.',
    cs: 'Zapíše se, když je dárcovský projekt deaktivován a skryt z aktivního přiřazení. Jeden řádek za projekt.',
    sk: 'Zapíše sa, keď je darcovský projekt deaktivovaný a skrytý z aktívneho priradenia. Jeden riadok za projekt.',
  },
  'admin.donationProject.reactivated': {
    en: 'Recorded when a deactivated donation project becomes active again. One line per project.',
    cs: 'Zapíše se, když se deaktivovaný dárcovský projekt znovu aktivuje. Jeden řádek za projekt.',
    sk: 'Zapíše sa, keď sa deaktivovaný darcovský projekt znova aktivuje. Jeden riadok za projekt.',
  },
  'admin.donationProject.archived': {
    en: 'Recorded when a donation project is archived for retention and no longer used in current flows. One line per project.',
    cs: 'Zapíše se, když je dárcovský projekt archivován pro evidenci a už se nepoužívá v aktuálních tocích. Jeden řádek za projekt.',
    sk: 'Zapíše sa, keď je darcovský projekt archivovaný pre evidenciu a už sa nepoužíva v aktuálnych tokoch. Jeden riadok za projekt.',
  },
  'admin.customerMembership.suspended': {
    en: 'Recorded when a customer membership is suspended by an administrator. One line per suspension.',
    cs: 'Zapíše se, když administrátor pozastaví členství zákazníka. Jeden řádek za pozastavení.',
    sk: 'Zapíše sa, keď administrátor pozastaví členstvo zákazníka. Jeden riadok za pozastavenie.',
  },
  'admin.retention.policy_updated': {
    en: 'Recorded when retention policy settings are updated by an administrator. One line per successful policy save.',
    cs: 'Zapíše se při úpravě nastavení retenční politiky administrátorem. Jeden řádek za úspěšné uložení politiky.',
    sk: 'Zapíše sa pri úprave nastavenia retenčnej politiky administrátorom. Jeden riadok za úspešné uloženie politiky.',
  },
  'admin.salesPoint.deactivated': {
    en: 'Recorded when a sales point is turned off for customers. One line per sales point. Payments already in progress are handled separately.',
    cs: 'Zapíše se, když je platební místo vypnuté pro zákazníky. Jeden řádek za platební místo. Platby už rozjeté se řeší zvlášť.',
    sk: 'Zapíše sa, keď je platobné miesto vypnuté pre zákazníkov. Jeden riadok za platobné miesto. Platby už rozbehnuté sa riešia osobitne.',
  },
  'admin.salesPoint.reactivated': {
    en: 'Recorded when a turned-off sales point is enabled again. One line per sales point.',
    cs: 'Zapíše se, když je vypnuté platební místo znovu zapnuté. Jeden řádek za platební místo.',
    sk: 'Zapíše sa, keď je vypnuté platobné miesto znova zapnuté. Jeden riadok za platobné miesto.',
  },
  'admin.salesPoint.permanently_deleted': {
    en: 'Recorded when a sales point is removed from the system for good. One line per sales point. Old payment and audit records stay for compliance.',
    cs: 'Zapíše se, když je platební místo trvale odstraněno ze systému. Jeden řádek za platební místo. Staré platby a audit zůstávají kvůli evidenci.',
    sk: 'Zapíše sa, keď je platobné miesto trvale odstránené zo systému. Jeden riadok za platobné miesto. Staré platby a audit zostávajú kvôli evidencii.',
  },
  'admin.tenant.deactivated': {
    en: 'Recorded when an entire customer organization (tenant) is soft-deactivated without legal closure. One line per soft deactivate. Customer personal data is not copied into this line.',
    cs: 'Zapíše se, když je zákaznická organizace dočasně deaktivována bez právního uzavření. Jeden řádek za dočasnou deaktivaci. Osobní údaje zákazníků se do řádku nekopírují.',
    sk: 'Zapíše sa, keď je zákaznícka organizácia dočasne deaktivovaná bez právneho uzavretia. Jeden riadok za dočasnú deaktiváciu. Osobné údaje zákazníkov sa do riadku nekopírujú.',
  },
  'admin.tenant.permanently_deleted': {
    en: 'Recorded when an organization is fully deleted from the system. One line per delete run. Summary counts may appear, not full customer lists.',
    cs: 'Zapíše se, když je organizace kompletně smazána ze systému. Jeden řádek za běh mazání. Mohou být souhrnná čísla, ne celé seznamy zákazníků.',
    sk: 'Zapíše sa, keď je organizácia kompletne zmazaná zo systému. Jeden riadok za beh mazania. Môžu byť súhrnné čísla, nie celé zoznamy zákazníkov.',
  },
  'admin.tenant.reactivated': {
    en: 'Recorded when a closed organization is opened again. One line per reactivation.',
    cs: 'Zapíše se, když je uzavřená organizace znovu otevřena. Jeden řádek za obnovení.',
    sk: 'Zapíše sa, keď je uzavretá organizácia znova otvorená. Jeden riadok za obnovenie.',
  },
  'admin.tenant.legal_closure_completed': {
    en: 'Recorded when Mode A legal closure finishes for an organization, including when it was already deactivated. One line per successful Mode A completion. Distinct from soft deactivate.',
    cs: 'Zapíše se, když právní uzavření organizace (režim A) doběhne, i když už byla deaktivovaná. Jeden řádek za úspěšné právní uzavření. Oddělené od dočasné deaktivace.',
    sk: 'Zapíše sa, keď právne uzavretie organizácie (režim A) dobehne, aj keď už bola deaktivovaná. Jeden riadok za úspešné právne uzavretie. Oddelené od dočasnej deaktivácie.',
  },
  'admin.tenant.physical_purge_started': {
    en: 'Recorded when a physical purge (Mode B or grace worker) starts for an organization. One line per purge attempt start.',
    cs: 'Zapíše se, když začne fyzické mazání (režim B nebo odložené mazání) organizace. Jeden řádek za zahájení pokusu.',
    sk: 'Zapíše sa, keď začne fyzické mazanie (režim B alebo odložené mazanie) organizácie. Jeden riadok za zahájenie pokusu.',
  },
  'admin.tenant.physical_purge_completed': {
    en: 'Recorded when a physical purge finishes successfully (Gone or runtime-only outcome). One line per successful completion.',
    cs: 'Zapíše se, když fyzické mazání úspěšně skončí (Gone nebo jen runtime). Jeden řádek za úspěšné dokončení.',
    sk: 'Zapíše sa, keď fyzické mazanie úspešne skončí (Gone alebo len runtime). Jeden riadok za úspešné dokončenie.',
  },
  'admin.tenant.physical_purge_failed': {
    en: 'Recorded when a physical purge fails or cannot finish safely. One line per failure. Does not include full customer lists.',
    cs: 'Zapíše se, když fyzické mazání selže nebo nelze bezpečně dokončit. Jeden řádek za selhání. Neobsahuje celé seznamy zákazníků.',
    sk: 'Zapíše sa, keď fyzické mazanie zlyhá alebo nie je možné ho bezpečne dokončiť. Jeden riadok za zlyhanie. Neobsahuje celé zoznamy zákazníkov.',
  },
  'admin.tenant.physical_purge_blocked': {
    en: 'Recorded when a physical purge is refused because preflight blockers remain. One line per blocked attempt.',
    cs: 'Zapíše se, když je fyzické mazání odmítnuto kvůli blokátorům v preflightu. Jeden řádek za zablokovaný pokus.',
    sk: 'Zapíše sa, keď je fyzické mazanie odmietnuté kvôli blokátorom v preflighte. Jeden riadok za zablokovaný pokus.',
  },
  'admin.tenant.physical_purge_scheduled': {
    en: 'Recorded when a physical purge is scheduled after legal closure or by operator request. One line per schedule action.',
    cs: 'Zapíše se, když je fyzické mazání naplánováno po právním uzavření nebo na žádost operátora. Jeden řádek za naplánování.',
    sk: 'Zapíše sa, keď je fyzické mazanie naplánované po právnom uzavretí alebo na žiadosť operátora. Jeden riadok za naplánovanie.',
  },
  'admin.tenant.physical_purge_cancelled': {
    en: 'Recorded when a scheduled physical purge is cancelled before it runs. One line per cancel action.',
    cs: 'Zapíše se, když je naplánované fyzické mazání zrušeno dříve, než proběhne. Jeden řádek za zrušení.',
    sk: 'Zapíše sa, keď je naplánované fyzické mazanie zrušené skôr, než prebehne. Jeden riadok za zrušenie.',
  },
  'admin.tenant.contract_reopened': {
    en: 'Recorded when a legally closed organization contract is reopened by SUPER_DEV. One line per reopen. Historical evidence stays immutable.',
    cs: 'Zapíše se, když SUPER_DEV znovu otevře právně uzavřenou smlouvu organizace. Jeden řádek za reopen. Historická evidence zůstává neměnná.',
    sk: 'Zapíše sa, keď SUPER_DEV znova otvorí právne uzavretú zmluvu organizácie. Jeden riadok za reopen. Historická evidencia zostáva nemenná.',
  },
  'admin.tenant.access_cut': {
    en: 'Recorded when access cut revokes sessions, credentials, and related live access for an organization. One line per access-cut run.',
    cs: 'Zapíše se, když systém odvolá relace, přihlašovací údaje a související živý přístup organizace. Jeden řádek za běh odvolání přístupu.',
    sk: 'Zapíše sa, keď systém odvolá relácie, prihlasovacie údaje a súvisiaci živý prístup organizácie. Jeden riadok za beh odvolania prístupu.',
  },
  'admin.tenant.logo_uploaded': {
    en: 'Recorded when an administrator uploads an organization logo. One line per upload.',
    cs: 'Zapíše se, když administrátor nahraje logo organizace. Jeden řádek za nahrání.',
    sk: 'Zapíše sa, keď administrátor nahrá logo organizácie. Jeden riadok za nahranie.',
  },
  'admin.tenant.logo_replaced': {
    en: 'Recorded when an administrator replaces an organization logo. One line per replace.',
    cs: 'Zapíše se, když administrátor nahradí logo organizace. Jeden řádek za nahrazení.',
    sk: 'Zapíše sa, keď administrátor nahradí logo organizácie. Jeden riadok za nahradenie.',
  },
  'admin.tenant.logo_deleted': {
    en: 'Recorded when an administrator deletes an organization logo. One line per delete.',
    cs: 'Zapíše se, když administrátor smaže logo organizace. Jeden řádek za smazání.',
    sk: 'Zapíše sa, keď administrátor vymaže logo organizácie. Jeden riadok za vymazanie.',
  },
  'admin.salesPoint.image_uploaded': {
    en: 'Recorded when an administrator uploads a sales point image. One line per upload.',
    cs: 'Zapíše se, když administrátor nahraje obrázek prodejního místa. Jeden řádek za nahrání.',
    sk: 'Zapíše sa, keď administrátor nahrá obrázok predajného miesta. Jeden riadok za nahranie.',
  },
  'admin.salesPoint.image_replaced': {
    en: 'Recorded when an administrator replaces a sales point image. One line per replace.',
    cs: 'Zapíše se, když administrátor nahradí obrázek prodejního místa. Jeden řádek za nahrazení.',
    sk: 'Zapíše sa, keď administrátor nahradí obrázok predajného miesta. Jeden riadok za nahradenie.',
  },
  'admin.salesPoint.image_deleted': {
    en: 'Recorded when an administrator deletes a sales point image. One line per delete.',
    cs: 'Zapíše se, když administrátor smaže obrázek prodejního místa. Jeden řádek za smazání.',
    sk: 'Zapíše sa, keď administrátor vymaže obrázok predajného miesta. Jeden riadok za vymazanie.',
  },
  'admin.donation_template.created': {
    en: 'Recorded when a new preset list of donation amounts is created. One line per new template.',
    cs: 'Zapíše se při vytvoření nového seznamu přednastavených částek daru. Jeden řádek za novou šablonu.',
    sk: 'Zapíše sa pri vytvorení nového zoznamu prednastavených čiastok daru. Jeden riadok za novú šablónu.',
  },
  'admin.donation_template.updated': {
    en: 'Recorded when an existing donation amount list is edited. One line per saved change.',
    cs: 'Zapíše se při úpravě existujícího seznamu částek daru. Jeden řádek za uloženou změnu.',
    sk: 'Zapíše sa pri úprave existujúceho zoznamu čiastok daru. Jeden riadok za uloženú zmenu.',
  },
  'admin.donation_template.default_set': {
    en: 'Recorded when one donation amount list is marked as the default for the organization. One line when the default changes.',
    cs: 'Zapíše se, když je jeden seznam částek daru označen jako výchozí pro organizaci. Jeden řádek při změně výchozího.',
    sk: 'Zapíše sa, keď je jeden zoznam čiastok daru označený ako predvolený pre organizáciu. Jeden riadok pri zmene predvoleného.',
  },
  'admin.salesPoint.donation_projects.updated': {
    en: 'Recorded when which charity projects appear on a sales point is saved. One line per save. Project names are not all listed in the audit line.',
    cs: 'Zapíše se při uložení toho, které dárkové projekty se na platebním místě zobrazují. Jeden řádek za uložení. Názvy všech projektů nejsou v řádku auditu.',
    sk: 'Zapíše sa pri uložení toho, ktoré darčekové projekty sa na platobnom mieste zobrazujú. Jeden riadok za uloženie. Názvy všetkých projektov nie sú v riadku auditu.',
  },
  'admin.salesPoint.donation_amounts.updated': {
    en: 'Recorded when donation amount presets linked to a sales point are updated. One line per save.',
    cs: 'Zapíše se při aktualizaci přednastavených částek daru navázaných na platební místo. Jeden řádek za uložení.',
    sk: 'Zapíše sa pri aktualizácii prednastavených čiastok daru naviazaných na platobné miesto. Jeden riadok za uloženie.',
  },
  'admin.product.media_saved': {
    en: 'Recorded when an admin saves a product or variant image gallery. One line per successful gallery PUT.',
    cs: 'Zapíše se, když administrátor uloží galerii obrázků produktu nebo varianty. Jeden řádek za úspěšné uložení galerie.',
    sk: 'Zapíše sa, keď administrátor uloží galériu obrázkov produktu alebo variantu. Jeden riadok za úspešné uloženie galérie.',
  },
  'admin.product.media_deleted': {
    en: 'Recorded when images are removed from a product gallery during save. One line per save that deletes images.',
    cs: 'Zapíše se, když jsou při ukládání galerie odstraněny obrázky produktu. Jeden řádek za uložení s odstraněním.',
    sk: 'Zapíše sa, keď sú pri ukladaní galérie odstránené obrázky produktu. Jeden riadok za uloženie s odstránením.',
  },
  'admin.product.primary_image_changed': {
    en: 'Recorded when the primary catalog image flag changes in a gallery save. One line when primary changes.',
    cs: 'Zapíše se, když se při ukládání galerie změní hlavní obrázek v katalogu. Jeden řádek při změně primárního obrázku.',
    sk: 'Zapíše sa, keď sa pri ukladaní galérie zmení hlavný obrázok v katalógu. Jeden riadok pri zmene primárneho obrázka.',
  },
  'admin.loyalty.physical_card_issued': {
    en: 'Recorded when an administrator issues a new physical loyalty card for sales point scanning. The full card payload is never stored in this log.',
    cs: 'Zapíše se, když administrátor vydá novou fyzickou věrnostní kartu pro skenování na platebním místě. Plná hodnota karty se v záznamu neukládá.',
    sk: 'Zapíše sa, keď administrátor vydá novú fyzickú vernostnú kartu na skenovanie na platobnom mieste. Plná hodnota karty sa v zázname neukladá.',
  },
  'admin.loyalty.physical_card_revoked': {
    en: 'Recorded when a physical loyalty card is revoked and can no longer be used at a sales point. One line per revoked card.',
    cs: 'Zapíše se, když je fyzická věrnostní karta zneplatněna a nelze ji již použít na platebním místě. Jeden řádek za zneplatněnou kartu.',
    sk: 'Zapíše sa, keď je fyzická vernostná karta zneplatnená a už ju nie je možné použiť na platobnom mieste. Jeden riadok za zneplatnenú kartu.',
  },
  'admin.promo.event.created': {
    en: 'Recorded when an operator creates a new promo event in draft state. One line per created event.',
    cs: 'Zapíše se, když operátor vytvoří novou promo akci ve stavu konceptu. Jeden řádek za vytvořenou akci.',
    sk: 'Zapíše sa, keď operátor vytvorí novú promo akciu v stave konceptu. Jeden riadok za vytvorenú akciu.',
  },
  'admin.promo.event.paused': {
    en: 'Recorded when an operator pauses an active promo event. One line per pause action.',
    cs: 'Zapíše se, když operátor pozastaví aktivní promo akci. Jeden řádek za každé pozastavení.',
    sk: 'Zapíše sa, keď operátor pozastaví aktívnu promo akciu. Jeden riadok za každé pozastavenie.',
  },
  'admin.promo.reward.issued': {
    en: 'Recorded when an operator manually issues a promo reward to a customer. One line per issued reward.',
    cs: 'Zapíše se, když operátor ručně vydá promo odměnu zákazníkovi. Jeden řádek za vydanou odměnu.',
    sk: 'Zapíše sa, keď operátor ručne vydá promo odmenu zákazníkovi. Jeden riadok za vydanú odmenu.',
  },
  'admin.promo.reward.revoked': {
    en: 'Recorded when an operator revokes an unused or active promo reward. One line per revoked reward.',
    cs: 'Zapíše se, když operátor zruší nepoužitou nebo aktivní promo odměnu. Jeden řádek za zrušenou odměnu.',
    sk: 'Zapíše sa, keď operátor zruší nepoužitú alebo aktívnu promo odmenu. Jeden riadok za zrušenú odmenu.',
  },
  'admin.promo.enrollment.revoked': {
    en: 'Recorded when an operator revokes a customer enrollment from a promo event. One line per revoked enrollment.',
    cs: 'Zapíše se, když operátor zruší registraci zákazníka k promo akci. Jeden řádek za zrušenou registraci.',
    sk: 'Zapíše sa, keď operátor zruší registráciu zákazníka k promo akcii. Jeden riadok za zrušenú registráciu.',
  },
  'commerce.promo.reward.activated': {
    en: 'Recorded when a customer activates an earned promo reward during checkout or account flow. One line per activation.',
    cs: 'Zapíše se, když zákazník aktivuje získanou promo odměnu při checkoutu nebo v účtu. Jeden řádek za aktivaci.',
    sk: 'Zapíše sa, keď zákazník aktivuje získanú promo odmenu pri checkoute alebo v účte. Jeden riadok za aktiváciu.',
  },
  'commerce.promo.reward.redeemed': {
    en: 'Recorded when an activated promo reward is applied to a completed purchase. One line per redemption.',
    cs: 'Zapíše se, když je aktivovaná promo odměna uplatněna u dokončeného nákupu. Jeden řádek za uplatnění.',
    sk: 'Zapíše sa, keď je aktivovaná promo odmena uplatnená pri dokončenom nákupe. Jeden riadok za uplatnenie.',
  },
  'commerce.promo.reward.rolled_back': {
    en: 'Recorded when a promo reward redemption is reversed after payment failure or order cancellation. One line per rollback.',
    cs: 'Zapíše se, když je uplatnění promo odměny vráceno po selhání platby nebo zrušení objednávky. Jeden řádek za vrácení.',
    sk: 'Zapíše sa, keď je uplatnenie promo odmeny vrátené po zlyhaní platby alebo zrušení objednávky. Jeden riadok za vrátenie.',
  },
  'commerce.promo.progress.updated': {
    en: 'Recorded when a customer promo progress counter changes toward a threshold reward. One line per progress update.',
    cs: 'Zapíše se, když se u zákazníka změní průběh promo akce směrem k prahové odměně. Jeden řádek za aktualizaci průběhu.',
    sk: 'Zapíše sa, keď sa u zákazníka zmení priebeh promo akcie smerom k prahovej odmene. Jeden riadok za aktualizáciu priebehu.',
  },
  'commerce.promo.enrollment.created': {
    en: 'Recorded when a customer enrolls in a promo event that requires enrollment. One line per enrollment.',
    cs: 'Zapíše se, když se zákazník zaregistruje k promo akci vyžadující registraci. Jeden řádek za registraci.',
    sk: 'Zapíše sa, keď sa zákazník zaregistruje k promo akcii vyžadujúcej registráciu. Jeden riadok za registráciu.',
  },
  'admin.product.barcode_assigned': {
    en: 'Recorded when a primary product or variant barcode is created or updated, including confirmed overwrite moves.',
    cs: 'Zapíše se při vytvoření nebo změně primárního čárového kódu produktu či varianty, včetně potvrzeného přesunu z jiného držitele.',
    sk: 'Zapíše sa pri vytvorení alebo zmene primárneho čiarového kódu produktu či variantu, vrátane potvrdeného presunu z iného držiteľa.',
  },
  'admin.product.barcode_cleared': {
    en: 'Recorded when the primary barcode is removed from a product or variant.',
    cs: 'Zapíše se při odstranění primárního čárového kódu z produktu nebo varianty.',
    sk: 'Zapíše sa pri odstránení primárneho čiarového kódu z produktu alebo variantu.',
  },
  'admin.product.barcode_alt_added': {
    en: 'Recorded when an alternate lookup barcode alias is added to a product or variant.',
    cs: 'Zapíše se při přidání alternativního aliasu čárového kódu k produktu nebo variantě.',
    sk: 'Zapíše sa pri pridaní alternatívneho aliasu čiarového kódu k produktu alebo variante.',
  },
  'admin.product.barcode_alt_removed': {
    en: 'Recorded when an alternate barcode alias is removed from a product or variant.',
    cs: 'Zapíše se při odebrání alternativního aliasu čárového kódu z produktu nebo varianty.',
    sk: 'Zapíše sa pri odobratí alternatívneho aliasu čiarového kódu z produktu alebo variantu.',
  },
  'admin.product.barcode_alt_promoted': {
    en: 'Recorded when an alternate barcode is promoted to become the primary barcode.',
    cs: 'Zapíše se, když je alternativní čárový kód povýšen na primární.',
    sk: 'Zapíše sa, keď je alternatívny čiarový kód povýšený na primárny.',
  },
  'pickup.device.paired': {
    en: 'Recorded when pickup staff successfully pair a counter tablet using an admin-issued pairing code.',
    cs: 'Zapíše se po úspěšném spárování pickup zařízení pomocí párovacího kódu z administrace.',
    sk: 'Zapíše sa po úspešnom spárovaní pickup zariadenia pomocou párovacieho kódu z administrácie.',
  },
  'pickup.device.pairing.failed': {
    en: 'Recorded when pickup device pairing is rejected (invalid code, inactive device, etc.).',
    cs: 'Zapíše se při zamítnutí spárování pickup zařízení (neplatný kód, neaktivní zařízení atd.).',
    sk: 'Zapíše sa pri zamietnutí spárovania pickup zariadenia (neplatný kód, neaktívne zariadenie atď.).',
  },
  'pickup.fulfillment.claim.acquired': {
    en: 'Recorded when pickup staff acquire a soft claim on an order fulfillment (counter tablet lease).',
    cs: 'Zapíše se, když pickup personál získá soft claim na vyzvednutí objednávky (lease tabletu).',
    sk: 'Zapíše sa, keď pickup personál získa soft claim na vyzdvihnutie objednávky (lease tabletu).',
  },
  'pickup.fulfillment.claim.released': {
    en: 'Recorded when pickup staff release their soft claim on an order fulfillment.',
    cs: 'Zapíše se, když pickup personál uvolní soft claim na vyzvednutí objednávky.',
    sk: 'Zapíše sa, keď pickup personál uvoľní soft claim na vyzdvihnutie objednávky.',
  },
  'dev.tenant.created': {
    en: 'Recorded when platform staff create a brand-new organization in the dev tools. One line per new organization. Invitation links and passwords are not stored here.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích založí novou organizaci. Jeden řádek za novou organizaci. Odkazy z pozvánek a hesla se sem neukládají.',
    sk: 'Zapíše sa, keď pracovníci platformy v dev nástrojoch založia novú organizáciu. Jeden riadok za novú organizáciu. Odkazy z pozvánok a heslá sa sem neukladajú.',
  },
  'dev.tenant.updated': {
    en: 'Recorded when platform staff change an organization’s code or display name. One line per successful update.',
    cs: 'Zapíše se, když pracovníci platformy změní kód nebo zobrazované jméno organizace. Jeden řádek za úspěšnou změnu.',
    sk: 'Zapíše sa, keď pracovníci platformy zmenia kód alebo zobrazované meno organizácie. Jeden riadok za úspešnú zmenu.',
  },
  'dev.tenant.provider.updated': {
    en: 'Recorded when platform staff change payment provider settings for an organization in dev tools. One line per successful update.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích změní nastavení platebního poskytovatele organizace. Jeden řádek za úspěšnou změnu.',
    sk: 'Zapíše sa, keď pracovníci platformy v dev nástrojoch zmenia nastavenie platobného poskytovateľa organizácie. Jeden riadok za úspešnú zmenu.',
  },
  'dev.tenant.entitlement_policy.changed': {
    en: 'Recorded when platform staff change tenant feature-policy entitlement rows in dev tools. One line per successful save with revision metadata.',
    cs: 'Zapíše se, když pracovníci platformy v dev nástrojích změní řádky politiky funkcí (entitlement). Jeden řádek za úspěšné uložení s metadaty revize.',
    sk: 'Zapíše sa, keď pracovníci platformy v dev nástrojoch zmenia riadky politiky funkcií (entitlement). Jeden riadok za úspešné uloženie s metadátami revízie.',
  },
  'payment.transaction.state_changed': {
    en: 'Recorded automatically when a payment moves to a new status (paid, cancelled, etc.). One line per status change. If writing the line fails, the payment still changes.',
    cs: 'Zapíše se automaticky, když platba přejde do nového stavu (zaplaceno, zrušeno atd.). Jeden řádek za změnu stavu. Když se zápis nepovede, platba se stejně změní.',
    sk: 'Zapíše sa automaticky, keď platba prejde do nového stavu (zaplatené, zrušené atď.). Jeden riadok za zmenu stavu. Keď sa zápis nepodarí, platba sa aj tak zmení.',
  },
  'payment.admin_manual_complete': {
    en: 'Recorded when an admin marks a pending bank-transfer order as paid at the counter. One line per successful mark (idempotent replays reuse the same line).',
    cs: 'Zapíše se, když administrátor označí čekající bankovní objednávku jako zaplacenou u pokladny. Jeden řádek za úspěšné označení (opakované odeslání znovu použije stejný řádek).',
    sk: 'Zapíše sa, keď administrátor označí čakajúcu bankovú objednávku ako zaplatenú pri pokladni. Jeden riadok za úspešné označenie (opakované odoslanie znova použije ten istý riadok).',
  },
  'webhook_skipped_tenant_inactive': {
    en: 'Recorded when a payment webhook is acknowledged without money mutation because the tenant is deactivated, deleted, or legally closed.',
    cs: 'Zapíše se, když je platební webhook potvrzen bez peněžní změny, protože organizace je deaktivovaná, smazaná nebo právně uzavřená.',
    sk: 'Zapíše sa, keď je platobný webhook potvrdený bez peňažnej zmeny, pretože organizácia je deaktivovaná, zmazaná alebo právne uzavretá.',
  },
  'payment.customer.refund.requested': {
    en: 'Recorded when a customer submits a refund request from the PWA after a failed or timed-out payment. One line per request (duplicate submissions are idempotent).',
    cs: 'Zapíše se, když zákazník odešle žádost o vrácení z zákaznické aplikace po neúspěšné nebo vypršené platbě. Jeden řádek za žádost (opakované odeslání znovu použije stejný záznam).',
    sk: 'Zapíše sa, keď zákazník odošle žiadosť o vrátenie zo zákazníckej aplikácie po neúspešnej alebo vypršanej platbe. Jeden riadok za žiadosť (opakované odoslanie znova použije ten istý záznam).',
  },
  'reconciliation.transaction.refund_candidate.marked': {
    en: 'Recorded when staff mark a bank payment as needing a possible refund check. One line per mark. Does not send money back by itself.',
    cs: 'Zapíše se, když pracovník označí bankovní platbu k možné kontrole vrácení peněz. Jeden řádek za označení. Samo o sobě peníze nevrací.',
    sk: 'Zapíše sa, keď pracovník označí bankovú platbu na možnú kontrolu vrátenia peňazí. Jeden riadok za označenie. Samo o sebe peniaze nevracia.',
  },
  'reconciliation.transaction.refund_candidate.unmarked': {
    en: 'Recorded when staff remove the “needs refund check” flag from a payment. One line per removal.',
    cs: 'Zapíše se, když pracovník zruší příznak „kontrola vrácení“ u platby. Jeden řádek za zrušení.',
    sk: 'Zapíše sa, keď pracovník zruší príznak „kontrola vrátenia“ pri platbe. Jeden riadok za zrušenie.',
  },
  'reconciliation.bank_inbound.matched': {
    en: 'Recorded when an inbound bank movement is automatically matched to an open order or donation obligation.',
    cs: 'Zapíše se, když je příchozí bankovní pohyb automaticky spárován s otevřenou objednávkou nebo závazkem daru.',
    sk: 'Zapíše sa, keď je prichádzajúci bankový pohyb automaticky spárovaný s otvorenou objednávkou alebo záväzkom daru.',
  },
  'reconciliation.bank_inbound.attribute': {
    en: 'Recorded when staff manually attribute an inbound bank movement to a transaction.',
    cs: 'Zapíše se, když pracovník ručně přiřadí příchozí bankovní pohyb k transakci.',
    sk: 'Zapíše sa, keď pracovník ručne priradí prichádzajúci bankový pohyb k transakcii.',
  },
  'reconciliation.payment_claim.submitted': {
    en: 'Recorded when a customer submits a payment claim for an orphan inbound transfer.',
    cs: 'Zapíše se, když zákazník nahlásí platbu za nespárovaný příchozí převod.',
    sk: 'Zapíše sa, keď zákazník nahlási platbu za nespárovaný prichádzajúci prevod.',
  },
  'reconciliation.payment_claim.approved': {
    en: 'Recorded when a payment claim is approved and linked to a transaction.',
    cs: 'Zapíše se, když je nahlášení platby schváleno a propojeno s transakcí.',
    sk: 'Zapíše sa, keď je nahlásenie platby schválené a prepojené s transakciou.',
  },
  'reconciliation.payment_claim.rejected': {
    en: 'Recorded when a payment claim is rejected by staff review.',
    cs: 'Zapíše se, když pracovník zamítne nahlášení platby.',
    sk: 'Zapíše sa, keď pracovník zamietne nahlásenie platby.',
  },
  'reconciliation.recurring_payment.missed': {
    en: 'Recorded when an expected recurring donation payment was not received by the due date.',
    cs: 'Zapíše se, když očekávaná platba pravidelného daru nedorazila do termínu splatnosti.',
    sk: 'Zapíše sa, keď očakávaná platba pravidelného daru nedorazila do termínu splatnosti.',
  },
  'reconciliation.recurring_payment.received': {
    en: 'Recorded when an inbound bank match advances a recurring donation schedule.',
    cs: 'Zapíše se, když příchozí bankovní párování posune plán pravidelného daru.',
    sk: 'Zapíše sa, keď prichádzajúce bankové párovanie posunie plán pravidelného daru.',
  },
  'reconciliation.bank_account.mode_changed': {
    en: 'Recorded when bank account reconciliation or customer claim mode is changed.',
    cs: 'Zapíše se při změně režimu párování nebo nahlášení plateb u bankovního účtu.',
    sk: 'Zapíše sa pri zmene režimu párovania alebo nahlásenia platieb pri bankovom účte.',
  },
  'payment.provider_wiring.verified': {
    en: 'Recorded when a tenant payment provider wiring probe succeeds.',
    cs: 'Zapíše se po úspěšném ověření napojení platebního poskytovatele tenanta.',
    sk: 'Zapíše sa po úspešnom overení napojenia platobného poskytovateľa tenanta.',
  },
  'payment.provider_wiring.verify_failed': {
    en: 'Recorded when a tenant payment provider wiring probe fails.',
    cs: 'Zapíše se po neúspěšném ověření napojení platebního poskytovatele tenanta.',
    sk: 'Zapíše sa po neúspešnom overení napojenia platobného poskytovateľa tenanta.',
  },
  'payment.provider_wiring.invalidated': {
    en: 'Recorded when provider wiring is invalidated (e.g. Connect onboarding regression).',
    cs: 'Zapíše se při zneplatnění napojení poskytovatele (např. regrese Stripe Connect).',
    sk: 'Zapíše sa pri zneplatnení napojenia poskytovateľa (napr. regresia Stripe Connect).',
  },
  'payment.cash_provider.risk_ack': {
    en: 'Recorded when an operator acknowledges cash payment risk on the cash provider policy.',
    cs: 'Zapíše se po potvrzení rizika hotovostní platby u politiky cash poskytovatele.',
    sk: 'Zapíše sa po potvrdení rizika hotovostnej platby pri politike cash poskytovateľa.',
  },
  'payment.cash_checkout.self_confirm': {
    en: 'Recorded when a customer self-confirms sales point cash checkout (ADR-PICKUP-CASH).',
    cs: 'Zapíše se po vlastním potvrzení hotovostní platby zákazníkem u platebního místa (ADR-PICKUP-CASH).',
    sk: 'Zapíše sa po vlastnom potvrdení hotovostnej platby zákazníkom pri platobnom mieste (ADR-PICKUP-CASH).',
  },
  'payment.cash_shift.opened': {
    en: 'Recorded when a cash drawer shift is opened at a sales point.',
    cs: 'Zapíše se při otevření hotovostní směny u platebního místa.',
    sk: 'Zapíše sa pri otvorení hotovostnej zmeny pri platobnom mieste.',
  },
  'payment.cash_shift.closed': {
    en: 'Recorded when a cash drawer shift is closed with a counted closing balance.',
    cs: 'Zapíše se při uzavření hotovostní směny se spočítanou závěrečnou hotovostí.',
    sk: 'Zapíše sa pri uzavretí hotovostnej zmeny so spočítanou záverečnou hotovosťou.',
  },
  'payment.cash_drawer.open_signal': {
    en: 'Recorded when the sales point signals a physical drawer open after cash payment completion.',
    cs: 'Zapíše se, když platební místo po dokončení hotovostní platby signalizuje otevření zásuvky.',
    sk: 'Zapíše sa, keď platobné miesto po dokončení hotovostnej platby signalizuje otvorenie zásuvky.',
  },
  'export.analytics.explore.exported': {
    en: 'Recorded when someone downloads a spreadsheet export from customer behavior analytics. One line per successful export. The spreadsheet contents are not copied into the audit line.',
    cs: 'Zapíše se, když někdo stáhne export tabulky z analýzy chování zákazníků. Jeden řádek za úspěšný export. Obsah tabulky se do řádku auditu nekopíruje.',
    sk: 'Zapíše sa, keď niekto stiahne export tabuľky z analýzy správania zákazníkov. Jeden riadok za úspešný export. Obsah tabuľky sa do riadku auditu nekopíruje.',
  },
  'export.analytics.dev.views': {
    en: 'Recorded when a developer exports analytics views from the Dev analytics surface. One line per export.',
    cs: 'Zapíše se, když vývojář exportuje analytické pohledy z Dev analytics. Jeden řádek za export.',
    sk: 'Zapíše sa, keď vývojár exportuje analytické pohľady z Dev analytics. Jeden riadok za export.',
  },
  'export.analytics.mission_control.exported': {
    en: 'Recorded when someone downloads a Mission Control tenant breakdown CSV export. One line per successful export.',
    cs: 'Zapíše se, když někdo stáhne CSV export tenantů z Mission Control. Jeden řádek za úspěšný export.',
    sk: 'Zapíše sa, keď niekto stiahne CSV export tenantov z Mission Control. Jeden riadok za úspešný export.',
  },
  'analytics.mission_control.cross_tenant.read': {
    en: 'Recorded when an elevated operator reads Mission Control metrics across multiple tenants.',
    cs: 'Zapíše se, když oprávněný operátor čte metriky Mission Control napříč tenanty.',
    sk: 'Zapíše sa, keď oprávnený operátor číta metriky Mission Control naprieč tenantmi.',
  },
  'export.analytics.rollups.materialized': {
    en: 'Recorded when scheduled analytics rollup snapshots are materialized for reporting. One line per materialization run.',
    cs: 'Zapíše se při materializaci plánovaných analytických agregací pro reporty. Jeden řádek za běh materializace.',
    sk: 'Zapíše sa pri materializácii plánovaných analytických agregácií pre reporty. Jeden riadok za beh materializácie.',
  },
  'export.transactions.exported': {
    en: 'Recorded when an operator exports transaction rows to CSV.',
    cs: 'Zapíše se, když operátor exportuje transakce do CSV.',
    sk: 'Zapíše sa, keď operátor exportuje transakcie do CSV.',
  },
  'export.fulfillment.exported': {
    en: 'Recorded when an operator exports fulfillment rows to CSV.',
    cs: 'Zapíše se, když operátor exportuje vyzvednutí do CSV.',
    sk: 'Zapíše sa, keď operátor exportuje vyzdvihnutia do CSV.',
  },
  'export.compliance.audit_events.exported': {
    en: 'Recorded when an operator exports compliance audit events to CSV.',
    cs: 'Zapíše se, když operátor exportuje compliance audit události do CSV.',
    sk: 'Zapíše sa, keď operátor exportuje compliance audit udalosti do CSV.',
  },
  'export.consent.grantees': {
    en: 'Recorded when an operator exports active consent grantees for GDPR processing. One line per successful export. Personal data from the export file is not copied into the audit row.',
    cs: 'Zapíše se, když operátor exportuje aktivní příjemce souhlasů pro zpracování podle GDPR. Jeden řádek za úspěšný export. Osobní údaje ze souboru exportu se do řádku auditu nekopírují.',
    sk: 'Zapíše sa, keď operátor exportuje aktívnych príjemcov súhlasov na spracovanie podľa GDPR. Jeden riadok za úspešný export. Osobné údaje zo súboru exportu sa do riadku auditu nekopírujú.',
  },
  'customer_pickup_ack_informational': {
    en: 'Recorded when a customer taps “I picked up my order” on a prepay order detail (informational self-report only). One line per transaction. Does not change fulfillment state.',
    cs: 'Zapíše se, když zákazník na detailu prepaid objednávky potvrdí „Vyzvedl jsem objednávku“ (pouze informativní). Jeden řádek za transakci. Nemění stav vyzvednutí.',
    sk: 'Zapíše sa, keď zákazník na detaile prepaid objednávky potvrdí „Vyzdvihol som objednávku“ (iba informatívne). Jeden riadok za transakciu. Nemení stav vyzdvihnutia.',
  },
  'customer.receipt.downloaded': {
    en: 'Recorded when a customer downloads a receipt PDF from their account. One line per download. PDF bytes are not stored in the audit row.',
    cs: 'Zapíše se, když zákazník stáhne PDF účtenku ze svého účtu. Jeden řádek za stažení. Obsah PDF se v řádku auditu neukládá.',
    sk: 'Zapíše sa, keď zákazník stiahne PDF účtenku zo svojho účtu. Jeden riadok za stiahnutie. Obsah PDF sa v riadku auditu neukladá.',
  },
  'gdpr.erasure.completed': {
    en: 'Recorded when a confirmed GDPR erasure request is finished and personal data is removed or anonymized as required. One line per completed request. The person’s email is not stored in this line.',
    cs: 'Zapíše se po dokončení potvrzené žádosti o výmaz podle GDPR a odstranění nebo anonymizaci údajů. Jeden řádek za dokončenou žádost. E-mail dotčené osoby se v řádku neukládá.',
    sk: 'Zapíše sa po dokončení potvrdenej žiadosti o výmaz podľa GDPR a odstránení alebo anonymizácii údajov. Jeden riadok za dokončenú žiadosť. E-mail dotknutej osoby sa v riadku neukladá.',
  },
  'gdpr.erasure.side_effects_pending': {
    en: 'Recorded when a GDPR erasure request completed in the database but follow-up side-effects (sessions, analytics, auth artifacts) failed and need operator retry.',
    cs: 'Zapíše se, když žádost o výmaz byla v databázi dokončena, ale následné vedlejší účinky (relace, analytika, autentizační artefakty) selhaly a vyžadují ruční opakování.',
    sk: 'Zapíše sa, keď žiadosť o výmaz bola v databáze dokončená, ale následné vedľajšie účinky (relácie, analytika, autentizačné artefakty) zlyhali a vyžadujú ručné opakovanie.',
  },
};
