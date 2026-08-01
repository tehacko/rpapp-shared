import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing analytics event labels — every catalog event has distinct cs + en + sk. */
const ANALYTICS_LABEL_OVERRIDES: Record<AnalyticsEventName, LocalizedLabel> = {
  session_started: { en: 'Session started', cs: 'Relace zahájena', sk: 'Relácia začatá' },
  session_completed: { en: 'Session completed', cs: 'Relace dokončena', sk: 'Relácia dokončená' },
  session_abandoned: { en: 'Session abandoned', cs: 'Relace opuštěna', sk: 'Relácia opustená' },
  session_recovered: { en: 'Session recovered', cs: 'Relace obnovena', sk: 'Relácia obnovená' },
  screen_viewed: { en: 'Screen viewed', cs: 'Obrazovka zobrazena', sk: 'Obrazovka zobrazená' },
  cta_clicked: {
    en: 'Action button clicked',
    cs: 'Klepnutí na akční tlačítko',
    sk: 'Klepnutie na akčné tlačidlo',
  },
  back_clicked: { en: 'Back pressed', cs: 'Stisknuto Zpět', sk: 'Stlačené Späť' },
  error_shown: { en: 'Error shown', cs: 'Chyba zobrazena', sk: 'Chyba zobrazená' },
  consent_banner_dismissed: {
    en: 'Consent banner dismissed',
    cs: 'Lišta souhlasu zavřena',
    sk: 'Lišta súhlasu zatvorená',
  },
  auth_flow_started: { en: 'Sign-in started', cs: 'Zahájení přihlášení', sk: 'Začatie prihlásenia' },
  identity_created: { en: 'Identity created', cs: 'Identita vytvořena', sk: 'Identita vytvorená' },
  account_logged_in: { en: 'Account logged in', cs: 'Účet přihlášen', sk: 'Účet prihlásený' },
  account_created: { en: 'Account created', cs: 'Účet vytvořen', sk: 'Účet vytvorený' },
  payment_started: { en: 'Payment started', cs: 'Platba zahájena', sk: 'Platba začatá' },
  payment_method_viewed: {
    en: 'Payment method viewed',
    cs: 'Výběr platební metody zobrazen',
    sk: 'Výber platobnej metódy zobrazený',
  },
  payment_qr_generated: {
    en: 'Payment QR generated',
    cs: 'QR kód platby vygenerován',
    sk: 'QR kód platby vygenerovaný',
  },
  qr_regenerated: {
    en: 'Payment QR regenerated',
    cs: 'Platební QR vygenerováno znovu',
    sk: 'Platobné QR vygenerované znova',
  },
  payment_submitted: { en: 'Payment submitted', cs: 'Platba odeslána', sk: 'Platba odoslaná' },
  payment_confirmed: { en: 'Payment confirmed', cs: 'Platba potvrzena', sk: 'Platba potvrdená' },
  payment_failed: { en: 'Payment failed', cs: 'Platba selhala', sk: 'Platba zlyhala' },
  receipt_opened: { en: 'Receipt opened', cs: 'Účtenka otevřena', sk: 'Účtenka otvorená' },
  qr_displayed: {
    en: 'Payment QR displayed',
    cs: 'Platební QR zobrazeno',
    sk: 'Platobné QR zobrazené',
  },
  menu_opened: { en: 'Menu opened', cs: 'Menu otevřeno', sk: 'Menu otvorené' },
  product_selected: { en: 'Product selected', cs: 'Produkt vybrán', sk: 'Produkt vybraný' },
  identity_recognized: {
    en: 'Identity recognized',
    cs: 'Identita rozpoznána',
    sk: 'Identita rozpoznaná',
  },
  identity_linked: { en: 'Identity linked', cs: 'Identita propojena', sk: 'Identita prepojená' },
  identity_matched: { en: 'Identity matched', cs: 'Identita spárována', sk: 'Identita spárovaná' },
  identity_deleted: { en: 'Identity deleted', cs: 'Identita smazána', sk: 'Identita zmazaná' },
  customer_deleted: { en: 'Customer deleted', cs: 'Zákazník smazán', sk: 'Zákazník zmazaný' },
  account_logged_out: { en: 'Account logged out', cs: 'Účet odhlášen', sk: 'Účet odhlásený' },
  profile_updated: { en: 'Profile updated', cs: 'Profil aktualizován', sk: 'Profil aktualizovaný' },
  receipt_created: { en: 'Receipt created', cs: 'Účtenka vytvořena', sk: 'Účtenka vytvorená' },
  receipt_downloaded: { en: 'Receipt downloaded', cs: 'Účtenka stažena', sk: 'Účtenka stiahnutá' },
  catalog_image_load_failed: {
    en: 'Catalog image failed to load',
    cs: 'Obrázek v katalogu se nepodařilo načíst',
    sk: 'Obrázok v katalógu sa nepodarilo načítať',
  },
  product_added: {
    en: 'Product added to cart',
    cs: 'Produkt přidán do košíku',
    sk: 'Produkt pridaný do košíka',
  },
  product_removed: {
    en: 'Product removed from cart',
    cs: 'Produkt odebrán z košíku',
    sk: 'Produkt odobraný z košíka',
  },
  cart_viewed: { en: 'Cart viewed', cs: 'Košík zobrazen', sk: 'Košík zobrazený' },
  cart_sheet_opened: {
    en: 'Cart sheet opened',
    cs: 'Panel košíku otevřen',
    sk: 'Panel košíka otvorený',
  },
  cart_sticky_pay_clicked: {
    en: 'Sticky cart pay clicked',
    cs: 'Klepnutí na Zaplatit v liště košíku',
    sk: 'Klepnutie na Zaplatiť v lište košíka',
  },
  collect_step_opened: {
    en: 'Collect step opened',
    cs: 'Krok vyzvednutí otevřen',
    sk: 'Krok vyzdvihnutia otvorený',
  },
  collect_step_confirmed: {
    en: 'Collect step confirmed',
    cs: 'Krok vyzvednutí potvrzen',
    sk: 'Krok vyzdvihnutia potvrdený',
  },
  checkout_started: { en: 'Checkout started', cs: 'Pokladna zahájena', sk: 'Pokladňa začatá' },
  gift_surface_impression: {
    en: 'Gift surface impression',
    cs: 'Zobrazení dárkových ploch',
    sk: 'Zobrazenie darčekových plôch',
  },
  retail_order_paid: { en: 'Order paid', cs: 'Objednávka zaplacena', sk: 'Objednávka zaplatená' },
  retail_order_abandoned: {
    en: 'Order abandoned',
    cs: 'Objednávka opuštěna',
    sk: 'Objednávka opustená',
  },
  retail_order_prepared: {
    en: 'Order in preparation',
    cs: 'Objednávka v přípravě',
    sk: 'Objednávka v príprave',
  },
  retail_order_ready: {
    en: 'Order ready for pickup',
    cs: 'Objednávka připravena k vyzvednutí',
    sk: 'Objednávka pripravená na vyzdvihnutie',
  },
  retail_order_collected: {
    en: 'Order collected',
    cs: 'Objednávka vyzvednuta',
    sk: 'Objednávka vyzdvihnutá',
  },
  retail_ticket_created: {
    en: 'Collect-later ticket created',
    cs: 'Lístek pro vyzvednutí později vytvořen',
    sk: 'Lístok na vyzdvihnutie neskôr vytvorený',
  },
  retail_pickup_scheduled: {
    en: 'Pickup slot scheduled',
    cs: 'Termín vyzvednutí naplánován',
    sk: 'Termín vyzdvihnutia naplánovaný',
  },
  retail_pickup_slot_missed: {
    en: 'Pickup slot missed',
    cs: 'Termín vyzvednutí zmeškán',
    sk: 'Termín vyzdvihnutia zmeškaný',
  },
  checkout_mode_selected: {
    en: 'Checkout mode selected',
    cs: 'Režim pokladny zvolen',
    sk: 'Režim pokladne zvolený',
  },
  pickup_qr_issued: {
    en: 'Pickup QR issued',
    cs: 'QR pro vyzvednutí vydán',
    sk: 'QR na vyzdvihnutie vydaný',
  },
  pickup_qr_scanned: {
    en: 'Pickup QR scanned',
    cs: 'QR pro vyzvednutí naskenován',
    sk: 'QR na vyzdvihnutie naskenovaný',
  },
  pickup_staff_mark_paid: {
    en: 'Marked paid at pickup',
    cs: 'Označeno zaplaceno při vyzvednutí',
    sk: 'Označené zaplatené pri vyzdvihnutí',
  },
  checkout_handoff_created: {
    en: 'Checkout handoff created',
    cs: 'Předání pokladny vytvořeno',
    sk: 'Odovzdanie pokladne vytvorené',
  },
  checkout_handoff_expired: {
    en: 'Checkout handoff expired',
    cs: 'Předání pokladny vypršelo',
    sk: 'Odovzdanie pokladne vypršalo',
  },
  checkout_handoff_completed: {
    en: 'Checkout handoff completed',
    cs: 'Předání pokladny dokončeno',
    sk: 'Odovzdanie pokladne dokončené',
  },
  buy_again_started: {
    en: 'Buy again started',
    cs: 'Nákup znovu zahájen',
    sk: 'Nákup znova začatý',
  },
  buy_again_trimmed: {
    en: 'Buy again cart trimmed',
    cs: 'Košík nákupu znovu ořezán',
    sk: 'Košík nákupu znova orezaný',
  },
  buy_again_failed_stock: {
    en: 'Buy again — no stock',
    cs: 'Nákup znovu — bez zásoby',
    sk: 'Nákup znova — bez zásoby',
  },
  self_service_sla_notice_shown: {
    en: 'Pay-on-spot SLA notice shown',
    cs: 'Upozornění na dobu vyzvednutí u platby na místě',
    sk: 'Upozornenie na dobu vyzdvihnutia pri platbe na mieste',
  },
  customer_pickup_ack_informational: {
    en: 'Pickup acknowledgment',
    cs: 'Potvrzení vyzvednutí',
    sk: 'Potvrdenie vyzdvihnutia',
  },
  pickup_partial_confirm: {
    en: 'Partial pickup confirmed',
    cs: 'Částečné vyzvednutí potvrzeno',
    sk: 'Čiastočné vyzdvihnutie potvrdené',
  },
  pickup_fulfillment_refused: {
    en: 'Pickup refused',
    cs: 'Vyzvednutí odmítnuto',
    sk: 'Vyzdvihnutie odmietnuté',
  },
  pickup_fulfillment_held: {
    en: 'Pickup placed on hold',
    cs: 'Vyzvednutí pozastaveno',
    sk: 'Vyzdvihnutie pozastavené',
  },
  pickup_fulfillment_hold_released: {
    en: 'Pickup hold released',
    cs: 'Pozastavení vyzvednutí zrušeno',
    sk: 'Pozastavenie vyzdvihnutia zrušené',
  },
  kiosk_cash_complete: {
    en: 'Sales point cash checkout complete',
    cs: 'Hotovostní pokladna na platebním místě dokončena',
    sk: 'Hotovostná pokladňa na platobnom mieste dokončená',
  },
  checkout_collect_configured: {
    en: 'Collect-later options configured',
    cs: 'Možnosti vyzvednutí později nastaveny',
    sk: 'Možnosti vyzdvihnutia neskôr nastavené',
  },
  slug_legacy_redirect: {
    en: 'Legacy shop URL redirect',
    cs: 'Přesměrování staré URL obchodu',
    sk: 'Presmerovanie starej URL obchodu',
  },
  tenant_switched: {
    en: 'Tenant switched',
    cs: 'Organizace přepnuta',
    sk: 'Organizácia prepnutá',
  },
  donation_started: { en: 'Donation started', cs: 'Darování zahájeno', sk: 'Darovanie začaté' },
  donation_amount_selected: {
    en: 'Donation amount selected',
    cs: 'Částka daru zvolena',
    sk: 'Suma daru zvolená',
  },
  donation_custom_amount_entered: {
    en: 'Custom donation amount entered',
    cs: 'Vlastní částka daru zadána',
    sk: 'Vlastná suma daru zadaná',
  },
  donation_project_selected: {
    en: 'Donation project selected',
    cs: 'Projekt daru zvolen',
    sk: 'Projekt daru zvolený',
  },
  donation_impact_opened: {
    en: 'Donation impact opened',
    cs: 'Informace o dopadu daru otevřeny',
    sk: 'Informácie o dopade daru otvorené',
  },
  donation_tax_receipt_selected: {
    en: 'Tax receipt option changed',
    cs: 'Volba daňového dokladu změněna',
    sk: 'Voľba daňového dokladu zmenená',
  },
  recurring_donation_selected: {
    en: 'Recurring donation selected',
    cs: 'Opakovaný dar zvolen',
    sk: 'Opakovaný dar zvolený',
  },
  donation_completed: { en: 'Donation completed', cs: 'Dar dokončen', sk: 'Dar dokončený' },
  donation_abandoned: { en: 'Donation abandoned', cs: 'Darování opuštěno', sk: 'Darovanie opustené' },
  kiosk_wakeup: {
    en: 'Sales point woken up',
    cs: 'Platební místo probuzeno',
    sk: 'Platobné miesto prebudené',
  },
  kiosk_timeout: {
    en: 'Sales point timed out',
    cs: 'Platební místo — vypršení nečinnosti',
    sk: 'Platobné miesto — vypršanie nečinnosti',
  },
  product_barcode_assigned: {
    en: 'Product barcode assigned',
    cs: 'Čárový kód produktu přiřazen',
    sk: 'Čiarový kód produktu priradený',
  },
  product_barcode_cleared: {
    en: 'Product barcode cleared',
    cs: 'Čárový kód produktu odstraněn',
    sk: 'Čiarový kód produktu odstránený',
  },
  product_barcode_alt_added: {
    en: 'Alternate barcode added',
    cs: 'Alternativní kód přidán',
    sk: 'Alternatívny kód pridaný',
  },
  product_barcode_alt_removed: {
    en: 'Alternate barcode removed',
    cs: 'Alternativní kód odebrán',
    sk: 'Alternatívny kód odobraný',
  },
  product_barcode_alt_promoted: {
    en: 'Alternate barcode promoted',
    cs: 'Alternativní kód povýšen',
    sk: 'Alternatívny kód povýšený',
  },
  product_barcode_assign_conflict: {
    en: 'Barcode assign conflict',
    cs: 'Konflikt přiřazení kódu',
    sk: 'Konflikt priradenia kódu',
  },
  product_barcode_lookup_hit: {
    en: 'Barcode lookup hit',
    cs: 'Vyhledání kódu nalezeno',
    sk: 'Vyhľadanie kódu nájdené',
  },
  product_barcode_lookup_miss: {
    en: 'Barcode lookup miss',
    cs: 'Vyhledání kódu nenalezeno',
    sk: 'Vyhľadanie kódu nenájdené',
  },
  physical_card_issued: {
    en: 'Physical loyalty card issued',
    cs: 'Vydána fyzická věrnostní karta',
    sk: 'Vydaná fyzická vernostná karta',
  },
  physical_card_revoked: {
    en: 'Physical loyalty card revoked',
    cs: 'Zneplatněna fyzická věrnostní karta',
    sk: 'Zneplatnená fyzická vernostná karta',
  },
  promo_preview_evaluated: {
    en: 'Promo preview evaluated',
    cs: 'Náhled akce vyhodnocen',
    sk: 'Náhľad akcie vyhodnotený',
  },
  promo_reward_activated: {
    en: 'Promo reward activated',
    cs: 'Propagační odměna aktivována',
    sk: 'Propagačná odmena aktivovaná',
  },
  promo_reward_redeemed: {
    en: 'Promo reward redeemed',
    cs: 'Propagační odměna uplatněna',
    sk: 'Propagačná odmena uplatnená',
  },
  promo_reward_rolled_back: {
    en: 'Promo reward rolled back',
    cs: 'Propagační odměna vrácena',
    sk: 'Propagačná odmena vrátená',
  },
  promo_progress_threshold_reached: {
    en: 'Promo progress threshold reached',
    cs: 'Dosažen práh postupu v akci',
    sk: 'Dosiahnutý prah postupu v akcii',
  },
  promo_stacking_rejected: {
    en: 'Promo stacking rejected',
    cs: 'Kombinace akcí odmítnuta',
    sk: 'Kombinácia akcií odmietnutá',
  },
  promo_budget_soft_stop: {
    en: 'Promo budget soft stop',
    cs: 'Měkký limit rozpočtu akce',
    sk: 'Mäkký limit rozpočtu akcie',
  },
  promo_budget_exhausted: {
    en: 'Promo budget exhausted',
    cs: 'Rozpočet akce vyčerpán',
    sk: 'Rozpočet akcie vyčerpaný',
  },
  promo_code_rejected: {
    en: 'Promo code rejected',
    cs: 'Slevový kód odmítnut',
    sk: 'Zľavový kód odmietnutý',
  },
  promo_code_applied: {
    en: 'Promo code applied',
    cs: 'Slevový kód uplatněn',
    sk: 'Zľavový kód uplatnený',
  },
  promo_code_removed: {
    en: 'Promo code removed',
    cs: 'Slevový kód odebrán',
    sk: 'Zľavový kód odobraný',
  },
  promo_code_redeemed: {
    en: 'Promo code redeemed',
    cs: 'Slevový kód uplatněn v platbě',
    sk: 'Zľavový kód uplatnený v platbe',
  },
  promo_code_released: {
    en: 'Promo code released',
    cs: 'Slevový kód uvolněn',
    sk: 'Zľavový kód uvoľnený',
  },
  recurring_payment_missed: {
    en: 'Recurring payment missed',
    cs: 'Zmeškaná opakovaná platba',
    sk: 'Neuskutočnená opakovaná platba',
  },
  recurring_payment_received: {
    en: 'Recurring payment received',
    cs: 'Přijata opakovaná platba',
    sk: 'Prijatá opakovaná platba',
  },
  pwa_install_accepted: {
    en: 'PWA install accepted',
    cs: 'Instalace aplikace přijata',
    sk: 'Inštalácia aplikácie prijatá',
  },
  pwa_install_dismissed: {
    en: 'PWA install dismissed',
    cs: 'Instalace aplikace odmítnuta',
    sk: 'Inštalácia aplikácie odmietnutá',
  },
  pwa_update_shown: {
    en: 'PWA update shown',
    cs: 'Aktualizace aplikace zobrazena',
    sk: 'Aktualizácia aplikácie zobrazená',
  },
  pwa_update_deferred: {
    en: 'PWA update deferred',
    cs: 'Aktualizace aplikace odložena',
    sk: 'Aktualizácia aplikácie odložená',
  },
  pwa_update_applied: {
    en: 'PWA update applied',
    cs: 'Aktualizace aplikace použita',
    sk: 'Aktualizácia aplikácie použitá',
  },
};

function buildAnalyticsLabels(): Record<AnalyticsEventName, LocalizedLabel> {
  const labels = {} as Record<AnalyticsEventName, LocalizedLabel>;
  for (const name of ANALYTICS_EVENT_NAMES) {
    const override = ANALYTICS_LABEL_OVERRIDES[name];
    if (!override) {
      throw new Error(`Missing analytics event label for: ${name}`);
    }
    labels[name] = override;
  }
  return labels;
}

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventName, LocalizedLabel> =
  buildAnalyticsLabels();
