import {
  ANALYTICS_DONATION_EVENTS,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_KIOSK_EVENTS,
  ANALYTICS_RETAIL_EVENTS,
  ANALYTICS_UNIVERSAL_EVENTS,
  type AnalyticsEventName,
} from './analyticsEvents.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Operator-facing analytics event descriptions (cs + en), 1–3 sentences each. */
const UNIVERSAL_DESCRIPTIONS: Record<
  (typeof ANALYTICS_UNIVERSAL_EVENTS)[keyof typeof ANALYTICS_UNIVERSAL_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_STARTED]: {
    en: 'Recorded once when the backend accepts a new analytics session (POST …/analytics/sessions via StartAnalyticsSessionUseCase). This is the only server emitter of the “Session started” event. One ingest row per tenant + client sessionId; repeats are deduplicated. It is not the dashboard funnel metric “Sessions started” — that column comes from the sessions table, not a count of this event. Scoped to the tenant; timestamps stored in UTC; OPERATIONAL telemetry only.',
    cs: 'Zaznamená se jednou, kdy backend přijme novou analytickou relaci (POST …/analytics/sessions přes StartAnalyticsSessionUseCase). Jediný serverový emitent události „Relace zahájena“. Jedna řádka ingestu na tenant + client sessionId; opakování se deduplikují. Není to metrika „Zahájené relace“ ve funnelu — ta vychází ze sloupce sessions, ne z počtu tohoto eventu. V rozsahu tenanta; čas UTC; pouze OPERATIONAL telemetrie.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_COMPLETED]: {
    en: 'Recorded when a session is closed with outcome completed (CloseAnalyticsSessionUseCase), including after a successful payment completion path. One row per closed session under normal idempotency. Not the same as payment_confirmed or retail_order_paid/donation_completed — those are separate commerce events. Tenant-scoped; UTC occurredAt; does not by itself drive GMV rollups.',
    cs: 'Zaznamená se při uzavření relace s výsledkem completed (CloseAnalyticsSessionUseCase), včetně po úspěšné platbě. Obvykle jedna řádka na uzavřenou relaci. Není totéž co payment_confirmed ani retail_order_paid/donation_completed. V rozsahu tenanta; čas UTC; samo o sobě neřídí GMV v rollupech.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_ABANDONED]: {
    en: 'Recorded when a session ends without completion: explicit abandon API, tab_close/route_leave beacons, payment cancel mapped to abandon (§2.6), or AnalyticsSessionTimeoutWorker. One occurrence per abandon close per session in typical flows. Not payment_failed (that is explicit cancel while payment is terminal/uninitiated). Not a “bounce” on kiosk_wakeup alone. Tenant + sessionId scoped; UTC dates in explore filters apply to occurredAt, not local kiosk clock.',
    cs: 'Zaznamená se, když relace skončí bez dokončení: abandon API, beacon tab_close/route_leave, mapování cancel na abandon (§2.6) nebo timeout worker. Typicky jedna událost na abandon uzavření relace. Není payment_failed (explicitní zrušení u terminální platby). Není „bounce“ jen po kiosk_wakeup. Rozsah tenant + sessionId; filtry explore používají UTC occurredAt.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SCREEN_VIEWED]: {
    en: 'Recorded when the kiosk or customer PWA shows a screen (client emit on mount or route enter). Each navigation or re-entry to the same screen is a separate row — multiple per session are expected. Counts as one occurrence per ingest row in Explore (raw COUNT(*)). Not a session start/end, not a payment outcome, and not deduplicated across tenants. Optional metadata: screen_name / screen, previous_screen_name, payment_method. OPERATIONAL only; UTC storage.',
    cs: 'Zaznamená se při zobrazení obrazovky na kiosku nebo v PWA zákazníka (klient při mountu nebo vstupu na route). Každá navigace nebo opětovný vstup = samostatná řádka — v relaci jich bývá více. V Explore jedna occurrence = jeden ingest řádek (COUNT(*)). Není začátek/konec relace ani výsledek platby. Volitelná metadata: screen_name / screen, previous_screen_name. Pouze OPERATIONAL; UTC.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.CTA_CLICKED]: {
    en: 'Recorded when the user taps a primary call-to-action (client emit). One row per click emit; rapid double-taps can produce two rows. Not a screen_viewed (navigation) or payment_started. Tenant-scoped; may include element_id / cta_label metadata. Explore counts rows, not unique users.',
    cs: 'Zaznamená se po klepnutí na hlavní CTA (klient). Jedna řádka na emit; dvojité klepnutí může dát dvě řádky. Není screen_viewed ani payment_started. Rozsah tenant; metadata element_id / cta_label. Explore počítá řádky, ne unikátní uživatele.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.BACK_CLICKED]: {
    en: 'Recorded when the user uses an in-flow back control (client emit). One occurrence per back action emitted. Not session_abandoned unless the abandon/close API or beacon also fires. Tenant-scoped OPERATIONAL telemetry.',
    cs: 'Zaznamená se při použití zpět v průběhu (klient). Jedna occurrence na emit zpět. Není session_abandoned, pokud se zároveň nevolá abandon/close API nebo beacon. OPERATIONAL telemetrie v rozsahu tenanta.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ERROR_SHOWN]: {
    en: 'Recorded when the UI surfaces an error state to the user (client emit from kiosk orchestration and similar). One row per error presentation emit; the same underlying fault shown twice yields two rows. Not server exception logs or ingest rejections. May carry error_code / message metadata. Not counted in payment_failed unless cancel mapping applies separately.',
    cs: 'Zaznamená se, kdy UI zobrazí chybu uživateli (klient, např. orchestrace kiosku). Jedna řádka na emit zobrazení; opakované zobrazení = více řádků. Nejsou to serverové logy ani ingest rejections. Metadata error_code / message. Není payment_failed, pokud cancel mapování neproběhne zvlášť.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.AUTH_FLOW_STARTED]: {
    en: 'Recorded when the customer begins login or registration (client emit). One row per started auth attempt emit. Not login_success or account_created until those steps complete. Tenant-scoped; optional auth_method metadata.',
    cs: 'Zaznamená se na začátku přihlášení nebo registrace (klient). Jedna řádka na emit zahájení auth. Není login_success ani account_created do dokončení kroku. Rozsah tenant; volitelné auth_method.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.IDENTITY_COMPLETED]: {
    en: 'Recorded when the user finishes an identity capture step (e.g. phone/email verification) in the journey (client emit). One occurrence per completed identity step emit. Not login_success and not payment identity checks on the server alone.',
    cs: 'Zaznamená se po dokončení kroku identity (např. ověření telefonu/e-mailu) v journey (klient). Jedna occurrence na emit dokončeného kroku. Není login_success ani samotná serverová kontrola u platby.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.LOGIN_SUCCESS]: {
    en: 'Recorded when authentication succeeds (client and/or server with idempotency on tenantId + customerId). At most one stable row per customer per tenant under server idempotency keys. Not account_created for brand-new registrations. OPERATIONAL; not marketing consent profiling.',
    cs: 'Zaznamená se po úspěšném přihlášení (klient a/nebo server s idempotencí tenantId + customerId). Při serverové idempotenci nejvýše jedna stabilní řádka na zákazníka a tenant. Není account_created u nové registrace. OPERATIONAL; ne marketingový profil.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ACCOUNT_CREATED]: {
    en: 'Recorded when a new customer account is created in the auth flow (client and/or server; idempotent per tenantId + customerId). One canonical row per new account under server keys. Not login_success for returning users. Tenant-scoped OPERATIONAL event.',
    cs: 'Zaznamená se při vytvoření nového účtu v auth flow (klient a/nebo server; idempotentní per tenantId + customerId). Jedna kanonická řádka na nový účet. Není login_success pro vracející se uživatele. OPERATIONAL v rozsahu tenanta.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_STARTED]: {
    en: 'Recorded when a payment attempt begins — client emit first (with clientEventId), then server merge/insert from CreateQRPayment / CreateGatewayPayment (Option A merge port may UPDATE the same row with paymentId). One logical attempt per paymentId after merge; duplicate client+server rows collapse when merge succeeds. Not payment_confirmed or QR generation alone. Included in funnel “payment started” session flags, not raw event sum for sessions started.',
    cs: 'Zaznamená se na začátku pokusu o platbu — nejdřív klient (clientEventId), pak server merge/insert z CreateQRPayment / CreateGatewayPayment (Option A může UPDATE stejné řádky paymentId). Po merge jeden logický pokus na paymentId. Není payment_confirmed ani samotné vygenerování QR. Ve funnelu flag relací s payment started, ne součet pro sessions started.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_QR_GENERATED]: {
    en: 'Recorded by the server when a QR payment payload is created (CreateQRPaymentUseCase). One idempotent row per tenant + paymentId. Not emitted by the kiosk UI alone. Precedes or accompanies payment_submitted on the QR path. OPERATIONAL server telemetry.',
    cs: 'Zaznamená server při vytvoření QR platby (CreateQRPaymentUseCase). Jedna idempotentní řádka na tenant + paymentId. NEemituje samotné UI kiosku. Na QR cestě předchází nebo doprovází payment_submitted. Serverová OPERATIONAL telemetrie.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_SUBMITTED]: {
    en: 'Recorded by the server when the QR (or gateway) payment is submitted for provider processing after generation. Idempotent per payment attempt on the server. Not “user pressed pay” on the client (that is closer to payment_started / checkout_started). Not payment_confirmed until the transaction completes.',
    cs: 'Zaznamená server, když je QR (nebo gateway) platba odeslána poskytovateli po vygenerování. Idempotentní na serveru per pokus. Není klepnutí Zaplatit na klientovi (payment_started / checkout_started). Není payment_confirmed do dokončení transakce.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_CONFIRMED]: {
    en: 'Recorded only on the server when CompletePaymentTransactionUseCase moves the transaction to COMPLETED (best-effort emit). One idempotent row per tenant + paymentId; metadata may include amount_cents. Not a client-side “thank you” screen view. Not the same row as retail_order_paid or donation_completed — those fire as companion events in the same completion handler. Explore “occurrences” are raw event rows; dashboard GMV uses commerce rollups / TenantCommerceFact, not a sum of this event alone. UTC occurredAt; tenant-scoped.',
    cs: 'Zaznamená pouze server při přechodu transakce do COMPLETED v CompletePaymentTransactionUseCase (best-effort). Jedna idempotentní řádka na tenant + paymentId; metadata může mít amount_cents. Není zobrazení děkovné obrazovky na klientovi. Není totéž co retail_order_paid nebo donation_completed — ty jdou jako doprovodné eventy ve stejném handleru. Occurrences v Explore = řádky eventů; GMV na dashboardu z commerce rollupů, ne ze součtu tohoto eventu. UTC; rozsah tenant.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_FAILED]: {
    en: 'Recorded on the server when CancelIntent maps to payment_failed (explicit_cancel while the payment is already terminal or was never successfully initiated — §2.6). Idempotent per tenant + paymentId + failureReason (e.g. cancelled). Not tab_close or route_leave (those map to session_abandoned). Not a provider timeout unless the cancel path emits it. Distinct from error_shown UI events. Tenant-scoped; counts as one Explore occurrence per matching ingest row.',
    cs: 'Zaznamená server, když CancelIntent mapuje na payment_failed (explicit_cancel u terminální nebo nezahájené platby — §2.6). Idempotentní per tenant + paymentId + failureReason (např. cancelled). Není tab_close ani route_leave (session_abandoned). Není timeout poskytovatele, pokud cancel neemituje. Odlišné od error_shown v UI. Rozsah tenant; v Explore jedna occurrence = jeden ingest řádek.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.RECEIPT_OPENED]: {
    en: 'Recorded when the user opens or requests a receipt view (client emit). One row per open action. Not payment_confirmed and not email delivery success on the server. Optional receipt_format metadata. OPERATIONAL client telemetry per session.',
    cs: 'Zaznamená se při otevření nebo zobrazení účtenky (klient). Jedna řádka na akci otevření. Není payment_confirmed ani úspěšné odeslání e-mailu na serveru. Volitelné receipt_format. OPERATIONAL telemetrie relace.',
  },
};

const RETAIL_DESCRIPTIONS: Record<
  (typeof ANALYTICS_RETAIL_EVENTS)[keyof typeof ANALYTICS_RETAIL_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_RETAIL_EVENTS.CATALOG_INTERACTION]: {
    en: 'Recorded when the shopper interacts with the product catalog (browse, category tap, product detail) on kiosk or mobile shop (client emit). One row per emitted interaction. Not product_added until the item enters the cart. Used in funnel “catalog” session flags. RETAIL flow; tenant-scoped.',
    cs: 'Zaznamená se při interakci s katalogem (prohlížení, kategorie, detail) na kiosku nebo mobilním shopu (klient). Jedna řádka na emit. Není product_added dokud položka není v košíku. Ve funnelu flag relací s katalogem. Flow RETAIL; rozsah tenant.',
  },
  [ANALYTICS_RETAIL_EVENTS.PRODUCT_ADDED]: {
    en: 'Recorded when a product is added to the cart (client emit). One occurrence per add emit; quantity changes may emit again depending on UI. Not checkout_started or payment_started. Drives funnel “product added” session metrics. Optional product_id / quantity metadata.',
    cs: 'Zaznamená se při přidání produktu do košíku (klient). Jedna occurrence na emit přidání. Změna množství může emitovat znovu dle UI. Není checkout_started ani payment_started. Řídí funnel „product added“. Volitelná metadata product_id / quantity.',
  },
  [ANALYTICS_RETAIL_EVENTS.PRODUCT_REMOVED]: {
    en: 'Recorded when a line item is removed from the cart (client emit). One row per removal emit. Not retail_order_abandoned (that signals leaving the whole order). RETAIL flow only in catalog v1.',
    cs: 'Zaznamená se při odebrání položky z košíku (klient). Jedna řádka na emit odebrání. Není retail_order_abandoned (opuštění celé objednávky). Ve v1 katalogu pouze flow RETAIL.',
  },
  [ANALYTICS_RETAIL_EVENTS.CART_VIEWED]: {
    en: 'Recorded when the cart screen is shown or refreshed for review (client emit). One emit per cart view action; revisiting the cart adds another row. Not cart_item_count truth for revenue — rollups use commerce facts. Funnel “cart viewed” session flag source.',
    cs: 'Zaznamená se při zobrazení nebo obnovení obrazovky košíku (klient). Jedna řádka na emit zobrazení; návrat na košík přidá další. Počet položek zde není zdroj pravdy GMV — rollupy používají commerce fakta. Zdroj funnel flagu „cart viewed“.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_STARTED]: {
    en: 'Recorded when the user enters checkout from the cart (client emit, e.g. Pay on kiosk). One row per checkout entry emit. Precedes payment_started on the payment path. Not payment_confirmed. May include cart totals in metadata for diagnostics only.',
    cs: 'Zaznamená se při vstupu do checkoutu z košíku (klient, např. Zaplatit na kiosku). Jedna řádka na emit vstupu. Předchází payment_started na platební cestě. Není payment_confirmed. Metadata s celky košíku jen pro diagnostiku.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_PAID]: {
    en: 'Recorded on the server alongside payment_confirmed when the completed transaction purpose is retail (CompletePaymentTransactionUseCase). One idempotent row per tenant + transactionId. Companion to payment_confirmed, not a substitute. GMV dashboards use commerce rollups, not a raw count of this event.',
    cs: 'Zaznamená server spolu s payment_confirmed u dokončené retail transakce (CompletePaymentTransactionUseCase). Jedna idempotentní řádka na tenant + transactionId. Doprovod k payment_confirmed. GMV dashboardy z commerce rollupů, ne z počtu tohoto eventu.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_ABANDONED]: {
    en: 'Recorded when the shopper leaves a retail order without paying (client emit on abandon paths). Server idempotency per tenant + sessionId + eventName. Not session_abandoned unless the session close API also runs. Not product_removed for a single line.',
    cs: 'Zaznamená se, když zákazník opustí retail objednávku bez platby (klient na abandon cestách). Serverová idempotence per tenant + sessionId + eventName. Není session_abandoned, pokud se nevolá close relace. Není product_removed jedné položky.',
  },
};

const DONATION_DESCRIPTIONS: Record<
  (typeof ANALYTICS_DONATION_EVENTS)[keyof typeof ANALYTICS_DONATION_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_DONATION_EVENTS.DONATION_STARTED]: {
    en: 'Recorded when a donation payment intent is formed (client emit, e.g. kiosk donation-intent). One row per intent emit for that step. Not donation_completed (server, after pay). DONATION flow; may include project/amount metadata.',
    cs: 'Zaznamená se při vzniku intentu daru (klient, např. kiosk donation-intent). Jedna řádka na emit kroku. Není donation_completed (server po zaplacení). Flow DONATION; metadata projekt/částka.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_AMOUNT_SELECTED]: {
    en: 'Recorded when the donor picks a preset amount chip (client emit). One occurrence per selection emit; choosing another preset emits again. Not donation_custom_amount_entered. Often followed by screen_viewed on the next step.',
    cs: 'Zaznamená se při výběru přednastavené částky (klient). Jedna occurrence na emit; jiná předvolba = další řádka. Není donation_custom_amount_entered. Často následuje screen_viewed dalšího kroku.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_CUSTOM_AMOUNT_ENTERED]: {
    en: 'Recorded when the donor enters a custom amount instead of a preset (client emit). Mutually exclusive with donation_amount_selected for the same amount step. One row per custom entry submit.',
    cs: 'Zaznamená se při zadání vlastní částky místo předvolby (klient). Vylučuje donation_amount_selected pro stejný krok. Jedna řádka na odeslání vlastní částky.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_PROJECT_SELECTED]: {
    en: 'Recorded when the donor selects a beneficiary project (client emit). One row per project selection. Not donation_completed until payment succeeds on the server.',
    cs: 'Zaznamená se při výběru projektu příjemce (klient). Jedna řádka na výběr. Není donation_completed do úspěšné platby na serveru.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_IMPACT_OPENED]: {
    en: 'Recorded when the donor opens impact or story content for a project (client emit). One occurrence per open action. Informational only — not a payment or completion signal.',
    cs: 'Zaznamená se při otevření informace o dopadu příběhu projektu (klient). Jedna occurrence na otevření. Pouze informativní — není platba ani dokončení.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_TAX_RECEIPT_SELECTED]: {
    en: 'Recorded when the donor toggles tax-receipt preference (client emit). One row per toggle emit; flipping the switch again adds another row. Not legal receipt issuance on the server.',
    cs: 'Zaznamená se při přepnutí preference daňového dokladu (klient). Jedna řádka na emit přepnutí. Není vystavení dokladu na serveru.',
  },
  [ANALYTICS_DONATION_EVENTS.RECURRING_DONATION_SELECTED]: {
    en: 'Recorded when the donor selects a recurring donation option (client emit). One occurrence per selection emit. Does not create a subscription by itself — operational telemetry only in v1.',
    cs: 'Zaznamená se při výběru opakovaného daru (klient). Jedna occurrence na emit. Nesamostatně zakládá předplatné — ve v1 jen OPERATIONAL telemetrie.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_COMPLETED]: {
    en: 'Recorded on the server with payment_confirmed when the completed transaction is a donation (CompletePaymentTransactionUseCase). One idempotent row per tenant + transactionId. Not the client thank-you screen alone. Pair with payment_confirmed for money truth in rollups.',
    cs: 'Zaznamená server s payment_confirmed u dokončeného daru (CompletePaymentTransactionUseCase). Jedna idempotentní řádka na tenant + transactionId. Není jen děkovná obrazovka klienta. K payment_confirmed pro peněžní pravdu v rollupech.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_ABANDONED]: {
    en: 'Recorded when the donor exits the donation flow without completing payment (client emit). Idempotent server key per tenant + sessionId. Not donation_completed and not payment_failed unless cancel mapping applies to an in-flight payment.',
    cs: 'Zaznamená se při opuštění darovacího flow bez platby (klient). Serverová idempotence per tenant + sessionId. Není donation_completed ani payment_failed, pokud cancel neemituje u rozjeté platby.',
  },
};

const KIOSK_DESCRIPTIONS: Record<
  (typeof ANALYTICS_KIOSK_EVENTS)[keyof typeof ANALYTICS_KIOSK_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_KIOSK_EVENTS.KIOSK_WAKEUP]: {
    en: 'Recorded on physical kiosk idle wake (touch) or programmatic donation boot telemetry (client emit). One row per wake emit; first mount may include configVersion/projectCount. Not session_started — the session API may follow separately. KIOSK platform; included in kiosk performance rollups (wakeup counts). OPERATIONAL only.',
    cs: 'Zaznamená se při probuzení kiosku z idle (dotyk) nebo při boot telemetrii darovacího kiosku (klient). Jedna řádka na probuzení; první mount může mít configVersion/projectCount. Není session_started — relace může následovat API zvlášť. Platforma KIOSK; počítá se v rollup výkonu kiosku. Pouze OPERATIONAL.',
  },
  [ANALYTICS_KIOSK_EVENTS.KIOSK_TIMEOUT]: {
    en: 'Recorded when the kiosk idle timer fires and resets the attract loop (client emit). One occurrence per timeout cycle with required idle_time_ms and last_screen_name. Not session_abandoned unless the abandon beacon also runs. May include cart snapshot metadata; tenant + kiosk scoped.',
    cs: 'Zaznamená se při vypršení idle timeru kiosku a návratu do attract loop (klient). Jedna occurrence na cyklus s idle_time_ms a last_screen_name. Není session_abandoned, pokud neběží i abandon beacon. Může nést snapshot košíku; rozsah tenant + kiosk.',
  },
};

function buildAnalyticsEventDescriptions(): Record<AnalyticsEventName, LocalizedLabel> {
  const descriptions = {
    ...UNIVERSAL_DESCRIPTIONS,
    ...RETAIL_DESCRIPTIONS,
    ...DONATION_DESCRIPTIONS,
    ...KIOSK_DESCRIPTIONS,
  } as Record<AnalyticsEventName, LocalizedLabel>;

  for (const name of ANALYTICS_EVENT_NAMES) {
    if (!descriptions[name]) {
      throw new Error(`Missing analytics event description for: ${name}`);
    }
  }

  return descriptions;
}

export const ANALYTICS_EVENT_DESCRIPTIONS: Record<AnalyticsEventName, LocalizedLabel> =
  buildAnalyticsEventDescriptions();
