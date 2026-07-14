import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing analytics event labels — every catalog event has distinct cs + en. */
const ANALYTICS_LABEL_OVERRIDES: Record<AnalyticsEventName, LocalizedLabel> = {
  session_started: { en: 'Session started', cs: 'Relace zahájena' },
  session_completed: { en: 'Session completed', cs: 'Relace dokončena' },
  session_abandoned: { en: 'Session abandoned', cs: 'Relace opuštěna' },
  session_recovered: { en: 'Session recovered', cs: 'Relace obnovena' },
  screen_viewed: { en: 'Screen viewed', cs: 'Obrazovka zobrazena' },
  cta_clicked: { en: 'Action button clicked', cs: 'Klepnutí na akční tlačítko' },
  back_clicked: { en: 'Back pressed', cs: 'Stisknuto Zpět' },
  error_shown: { en: 'Error shown', cs: 'Chyba zobrazena' },
  consent_banner_dismissed: { en: 'Consent banner dismissed', cs: 'Lišta souhlasu zavřena' },
  auth_flow_started: { en: 'Sign-in started', cs: 'Zahájení přihlášení' },
  identity_created: { en: 'Identity created', cs: 'Identita vytvořena' },
  account_logged_in: { en: 'Account logged in', cs: 'Účet přihlášen' },
  account_created: { en: 'Account created', cs: 'Účet vytvořen' },
  payment_started: { en: 'Payment started', cs: 'Platba zahájena' },
  payment_method_viewed: { en: 'Payment method viewed', cs: 'Výběr platební metody zobrazen' },
  payment_qr_generated: { en: 'Payment QR generated', cs: 'QR kód platby vygenerován' },
  qr_regenerated: { en: 'Payment QR regenerated', cs: 'Platební QR vygenerováno znovu' },
  payment_submitted: { en: 'Payment submitted', cs: 'Platba odeslána' },
  payment_confirmed: { en: 'Payment confirmed', cs: 'Platba potvrzena' },
  payment_failed: { en: 'Payment failed', cs: 'Platba selhala' },
  receipt_opened: { en: 'Receipt opened', cs: 'Účtenka otevřena' },
  qr_displayed: { en: 'Payment QR displayed', cs: 'Platební QR zobrazeno' },
  menu_opened: { en: 'Menu opened', cs: 'Menu otevřeno' },
  product_selected: { en: 'Product selected', cs: 'Produkt vybrán' },
  identity_recognized: { en: 'Identity recognized', cs: 'Identita rozpoznána' },
  identity_linked: { en: 'Identity linked', cs: 'Identita propojena' },
  identity_matched: { en: 'Identity matched', cs: 'Identita spárována' },
  identity_deleted: { en: 'Identity deleted', cs: 'Identita smazána' },
  customer_deleted: { en: 'Customer deleted', cs: 'Zákazník smazán' },
  account_logged_out: { en: 'Account logged out', cs: 'Účet odhlášen' },
  profile_updated: { en: 'Profile updated', cs: 'Profil aktualizován' },
  receipt_downloaded: { en: 'Receipt downloaded', cs: 'Účtenka stažena' },
  catalog_image_load_failed: {
    en: 'Catalog image failed to load',
    cs: 'Obrázek v katalogu se nepodařilo načíst',
  },
  product_added: { en: 'Product added to cart', cs: 'Produkt přidán do košíku' },
  product_removed: { en: 'Product removed from cart', cs: 'Produkt odebrán z košíku' },
  cart_viewed: { en: 'Cart viewed', cs: 'Košík zobrazen' },
  cart_sheet_opened: { en: 'Cart sheet opened', cs: 'Panel košíku otevřen' },
  cart_sticky_pay_clicked: { en: 'Sticky cart pay clicked', cs: 'Klepnutí na Zaplatit v liště košíku' },
  collect_step_opened: { en: 'Collect step opened', cs: 'Krok vyzvednutí otevřen' },
  collect_step_confirmed: { en: 'Collect step confirmed', cs: 'Krok vyzvednutí potvrzen' },
  checkout_started: { en: 'Checkout started', cs: 'Pokladna zahájena' },
  gift_surface_impression: { en: 'Gift surface impression', cs: 'Zobrazení dárkových ploch' },
  retail_order_paid: { en: 'Order paid', cs: 'Objednávka zaplacena' },
  retail_order_abandoned: { en: 'Order abandoned', cs: 'Objednávka opuštěna' },
  retail_order_prepared: { en: 'Order in preparation', cs: 'Objednávka v přípravě' },
  retail_order_ready: { en: 'Order ready for pickup', cs: 'Objednávka připravena k vyzvednutí' },
  retail_order_collected: { en: 'Order collected', cs: 'Objednávka vyzvednuta' },
  retail_ticket_created: { en: 'Collect-later ticket created', cs: 'Lístek collect-later vytvořen' },
  retail_pickup_scheduled: { en: 'Pickup slot scheduled', cs: 'Slot vyzvednutí naplánován' },
  retail_pickup_slot_missed: { en: 'Pickup slot missed', cs: 'Slot vyzvednutí zmeškán' },
  checkout_mode_selected: { en: 'Checkout mode selected', cs: 'Režim pokladny zvolen' },
  pickup_qr_issued: { en: 'Pickup QR issued', cs: 'QR pro vyzvednutí vydán' },
  pickup_qr_scanned: { en: 'Pickup QR scanned', cs: 'QR pro vyzvednutí naskenován' },
  pickup_staff_mark_paid: { en: 'Marked paid at pickup', cs: 'Označeno zaplaceno při vyzvednutí' },
  checkout_handoff_created: { en: 'Checkout handoff created', cs: 'Předání pokladny vytvořeno' },
  checkout_handoff_expired: { en: 'Checkout handoff expired', cs: 'Předání pokladny vypršelo' },
  checkout_handoff_completed: { en: 'Checkout handoff completed', cs: 'Předání pokladny dokončeno' },
  buy_again_started: { en: 'Buy again started', cs: 'Nákup znovu zahájen' },
  buy_again_trimmed: { en: 'Buy again cart trimmed', cs: 'Košík nákupu znovu ořezán' },
  buy_again_failed_stock: { en: 'Buy again — no stock', cs: 'Nákup znovu — bez zásoby' },
  self_service_sla_notice_shown: { en: 'Pay-on-spot SLA notice shown', cs: 'SLA upozornění u platby na místě' },
  customer_pickup_ack_informational: {
    en: 'Pickup acknowledgment',
    cs: 'Potvrzení vyzvednutí',
  },
  pickup_partial_confirm: { en: 'Partial pickup confirmed', cs: 'Částečné vyzvednutí potvrzeno' },
  pickup_fulfillment_refused: { en: 'Pickup refused', cs: 'Vyzvednutí odmítnuto' },
  pickup_fulfillment_held: { en: 'Pickup placed on hold', cs: 'Vyzvednutí pozastaveno' },
  pickup_fulfillment_hold_released: {
    en: 'Pickup hold released',
    cs: 'Pozastavení vyzvednutí zrušeno',
  },
  kiosk_cash_complete: { en: 'Kiosk cash checkout complete', cs: 'Hotovostní pokladna na kiosku dokončena' },
  checkout_collect_configured: {
    en: 'Collect-later options configured',
    cs: 'Možnosti collect-later nastaveny',
  },
  slug_legacy_redirect: { en: 'Legacy shop URL redirect', cs: 'Přesměrování staré URL obchodu' },
  tenant_switched: { en: 'Tenant switched', cs: 'Tenant přepnut' },
  donation_started: { en: 'Donation started', cs: 'Darování zahájeno' },
  donation_amount_selected: { en: 'Donation amount selected', cs: 'Částka daru zvolena' },
  donation_custom_amount_entered: {
    en: 'Custom donation amount entered',
    cs: 'Vlastní částka daru zadána',
  },
  donation_project_selected: { en: 'Donation project selected', cs: 'Projekt daru zvolen' },
  donation_impact_opened: { en: 'Donation impact opened', cs: 'Informace o dopadu daru otevřeny' },
  donation_tax_receipt_selected: {
    en: 'Tax receipt option changed',
    cs: 'Volba daňového dokladu změněna',
  },
  recurring_donation_selected: {
    en: 'Recurring donation selected',
    cs: 'Opakovaný dar zvolen',
  },
  donation_completed: { en: 'Donation completed', cs: 'Dar dokončen' },
  donation_abandoned: { en: 'Donation abandoned', cs: 'Darování opuštěno' },
  kiosk_wakeup: { en: 'Kiosk woken up', cs: 'Kiosk probuzen' },
  kiosk_timeout: { en: 'Kiosk timed out', cs: 'Kiosk — vypršení nečinnosti' },
  product_barcode_assigned: { en: 'Product barcode assigned', cs: 'Čárový kód produktu přiřazen' },
  product_barcode_cleared: { en: 'Product barcode cleared', cs: 'Čárový kód produktu odstraněn' },
  product_barcode_alt_added: { en: 'Alternate barcode added', cs: 'Alternativní kód přidán' },
  product_barcode_alt_removed: { en: 'Alternate barcode removed', cs: 'Alternativní kód odebrán' },
  product_barcode_alt_promoted: { en: 'Alternate barcode promoted', cs: 'Alternativní kód povýšen' },
  product_barcode_assign_conflict: { en: 'Barcode assign conflict', cs: 'Konflikt přiřazení kódu' },
  product_barcode_lookup_hit: { en: 'Barcode lookup hit', cs: 'Vyhledání kódu nalezeno' },
  product_barcode_lookup_miss: { en: 'Barcode lookup miss', cs: 'Vyhledání kódu nenalezeno' },
  physical_card_issued: { en: 'Physical loyalty card issued', cs: 'Vydána fyzická věrnostní karta' },
  physical_card_revoked: { en: 'Physical loyalty card revoked', cs: 'Zneplatněna fyzická věrnostní karta' },
  promo_preview_evaluated: { en: 'Promo preview evaluated', cs: 'Promo náhled vyhodnocen' },
  promo_reward_activated: { en: 'Promo reward activated', cs: 'Promo odměna aktivována' },
  promo_reward_redeemed: { en: 'Promo reward redeemed', cs: 'Promo odměna uplatněna' },
  promo_reward_rolled_back: { en: 'Promo reward rolled back', cs: 'Promo odměna vrácena' },
  promo_progress_threshold_reached: {
    en: 'Promo progress threshold reached',
    cs: 'Promo práh postupu dosažen',
  },
  promo_stacking_rejected: { en: 'Promo stacking rejected', cs: 'Promo kombinace odmítnuta' },
  promo_budget_soft_stop: { en: 'Promo budget soft stop', cs: 'Promo měkký limit rozpočtu' },
  promo_budget_exhausted: { en: 'Promo budget exhausted', cs: 'Promo rozpočet vyčerpán' },
  recurring_payment_missed: {
    en: 'Recurring payment missed',
    cs: 'Zmeškaná opakovaná platba',
  },
  recurring_payment_received: {
    en: 'Recurring payment received',
    cs: 'Přijata opakovaná platba',
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
