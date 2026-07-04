import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing analytics event labels — every catalog event has distinct cs + en. */
const ANALYTICS_LABEL_OVERRIDES: Record<AnalyticsEventName, LocalizedLabel> = {
  session_started: { en: 'Session started', cs: 'Relace zahájena' },
  session_completed: { en: 'Session completed', cs: 'Relace dokončena' },
  session_abandoned: { en: 'Session abandoned', cs: 'Relace opuštěna' },
  screen_viewed: { en: 'Screen viewed', cs: 'Obrazovka zobrazena' },
  cta_clicked: { en: 'Action button clicked', cs: 'Klepnutí na akční tlačítko' },
  back_clicked: { en: 'Back pressed', cs: 'Stisknuto Zpět' },
  error_shown: { en: 'Error shown', cs: 'Chyba zobrazena' },
  auth_flow_started: { en: 'Sign-in started', cs: 'Zahájení přihlášení' },
  identity_completed: { en: 'Identity step completed', cs: 'Krok identity dokončen' },
  login_success: { en: 'Login succeeded', cs: 'Přihlášení úspěšné' },
  account_created: { en: 'Account created', cs: 'Účet vytvořen' },
  payment_started: { en: 'Payment started', cs: 'Platba zahájena' },
  payment_qr_generated: { en: 'Payment QR generated', cs: 'QR kód platby vygenerován' },
  payment_submitted: { en: 'Payment submitted', cs: 'Platba odeslána' },
  payment_confirmed: { en: 'Payment confirmed', cs: 'Platba potvrzena' },
  payment_failed: { en: 'Payment failed', cs: 'Platba selhala' },
  receipt_opened: { en: 'Receipt opened', cs: 'Účtenka otevřena' },
  catalog_interaction: { en: 'Catalog browsed', cs: 'Prohlížení katalogu' },
  catalog_image_load_failed: {
    en: 'Catalog image failed to load',
    cs: 'Obrázek v katalogu se nepodařilo načíst',
  },
  product_added: { en: 'Product added to cart', cs: 'Produkt přidán do košíku' },
  product_removed: { en: 'Product removed from cart', cs: 'Produkt odebrán z košíku' },
  cart_viewed: { en: 'Cart viewed', cs: 'Košík zobrazen' },
  checkout_started: { en: 'Checkout started', cs: 'Pokladna zahájena' },
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
  physical_card_issued: { en: 'Physical loyalty card issued', cs: 'Vydána fyzická věrnostní karta' },
  physical_card_revoked: { en: 'Physical loyalty card revoked', cs: 'Zneplatněna fyzická věrnostní karta' },
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
