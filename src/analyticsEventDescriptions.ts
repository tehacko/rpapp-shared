import {
  ANALYTICS_ACCOUNT_EVENTS,
  ANALYTICS_DONATION_EVENTS,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_FUNNEL_EVENTS,
  ANALYTICS_IDENTITY_EVENTS,
  ANALYTICS_KIOSK_EVENTS,
  ANALYTICS_PROMO_EVENTS,
  ANALYTICS_PWA_EVENTS,
  ANALYTICS_RETAIL_EVENTS,
  ANALYTICS_SERVER_OPS_EVENTS,
  ANALYTICS_UNIVERSAL_EVENTS,
  type AnalyticsEventName,
} from './analyticsEvents.js';
import type { LocalizedLabel } from './labels/localizedLabel.js';

/** Plain-language analytics descriptions for operators (cs + en), 1–3 short sentences. */
const UNIVERSAL_DESCRIPTIONS: Record<
  (typeof ANALYTICS_UNIVERSAL_EVENTS)[keyof typeof ANALYTICS_UNIVERSAL_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_STARTED]: {
    en: 'Counts when a new customer visit starts on the kiosk or phone app. One count per new visit — doing the same thing again in the same visit does not add another. This is not the same as the “sessions started” number on some charts, which is calculated differently.',
    cs: 'Počítá se, když u platebního místa nebo v aplikaci začne nová návštěva zákazníka. Jednou za každou novou návštěvu — opakování ve stejné návštěvě nepřidá další. Není totéž jako číslo „zahájených relací“ na některých grafech, které se počítá jinak.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_COMPLETED]: {
    en: 'Counts when a visit ends in a normal, finished way — often after a successful payment. Usually one per finished visit. Not the same as “payment went through” or “order paid” — those are counted separately.',
    cs: 'Počítá se, když návštěva skončí normálně — často po úspěšné platbě. Obvykle jednou za každou dokončenou návštěvu. Není totéž jako „platba prošla“ nebo „objednávka zaplacena“ — to se počítá zvlášť.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_ABANDONED]: {
    en: 'Counts when someone leaves without finishing — closed tab, walked away, timed out, or cancelled in a way that ends the visit. One count per time that happens for a visit. Not the same as “payment failed” when they only cancel a payment step.',
    cs: 'Počítá se, když někdo odejde bez dokončení — zavře stránku, odejde od kiosku, vyprší čas, nebo zruší tak, že návštěva skončí. Jednou za každý takový konec návštěvy. Není totéž jako „platba selhala“, když zruší jen krok platby.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_RECOVERED]: {
    en: 'Counts when analytics detects a previously closed session and resumes tracking in a fresh session context. One count per recovery action.',
    cs: 'Počítá se, když analytika zjistí dříve uzavřenou relaci a pokračuje sledování v nové relaci. Jednou za obnovu.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SCREEN_VIEWED]: {
    en: 'Counts each time a screen is shown on the kiosk or customer app — home, cart, payment, and so on. Every time they open or return to a screen adds one. Not a new visit, not a payment result.',
    cs: 'Počítá se pokaždé, když se u platebního místa nebo v aplikaci zobrazí obrazovka — úvod, košík, platba atd. Každé otevření nebo návrat na obrazovku přidá jednu. Není nová návštěva ani výsledek platby.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.CTA_CLICKED]: {
    en: 'Counts when someone taps a main action button (for example “Continue” or “Pay”). One count per tap — tapping twice quickly can mean two. Not the same as just changing screen or starting payment.',
    cs: 'Počítá se, když někdo klepne na hlavní tlačítko (např. „Pokračovat“ nebo „Zaplatit“). Jednou za každé klepnutí — rychlé dvojité klepnutí může být dvakrát. Není jen změna obrazovky ani začátek platby.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.BACK_CLICKED]: {
    en: 'Counts when someone uses the Back control in the flow. One count per back press. Leaving the whole visit is counted separately as “visit abandoned”, not here.',
    cs: 'Počítá se, když někdo v průběhu použije Zpět. Jednou za každé stisknutí. Úplné opuštění návštěvy se počítá zvlášť jako „návštěva opuštěna“, ne tady.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ERROR_SHOWN]: {
    en: 'Counts when an error message is shown to the customer on screen. One count each time the message appears — showing it again adds another. Not the same as a failed payment unless they also cancel the payment.',
    cs: 'Počítá se, když se zákazníkovi na obrazovce ukáže chybová hláška. Jednou za každé zobrazení — opětovné ukázání přidá další. Není totéž jako neúspěšná platba, pokud platbu zároveň nezruší.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.CONSENT_BANNER_DISMISSED]: {
    en: 'Counts when the customer dismisses the analytics consent prompt without confirming new preferences. One count per dismiss action.',
    cs: 'Počítá se, když zákazník zavře výzvu k analytickému souhlasu bez potvrzení nové volby. Jednou za zavření.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.AUTH_FLOW_STARTED]: {
    en: 'Counts when someone starts logging in or signing up. One count per time they begin that process. Success or new account is counted with different events.',
    cs: 'Počítá se, když někdo začne přihlašování nebo registraci. Jednou za každý začátek. Úspěch nebo nový účet se počítá jinými událostmi.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.IDENTITY_CREATED]: {
    en: 'Counts when someone finishes onboarding identity setup (credentials saved or OTP-only path). One count per completion. Not the same as “logged in” or “account created”.',
    cs: 'Počítá se po dokončení nastavení identity při onboardingu (uložené přihlašovací údaje nebo cesta jen přes OTP). Jednou za dokončení. Není totéž jako „přihlášen“ nebo „účet vytvořen“.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ACCOUNT_LOGGED_IN]: {
    en: 'Counts when an existing account is actively logged in to begin an authenticated session. One count per successful account login action.',
    cs: 'Počítá se, když se existující účet aktivně přihlásí a zahájí autentizovanou relaci. Jednou za úspěšné přihlášení účtu.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ACCOUNT_CREATED]: {
    en: 'Counts when a new customer account is created. One count per new account. Returning customers who only log in are not counted here.',
    cs: 'Počítá se při vytvoření nového zákaznického účtu. Jednou za každý nový účet. Zákazníci, kteří se jen přihlásí, se sem nepočítají.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_STARTED]: {
    en: 'Counts when a payment attempt begins — customer chose to pay and the system started handling it. One count per payment try (retries may merge into one). Not the same as payment finished or QR code shown alone.',
    cs: 'Počítá se, když začne pokus o platbu — zákazník zvolil zaplatit a systém to začal řešit. Jednou za pokus (opakování se mohou sloučit). Není totéž jako dokončená platba nebo jen zobrazení QR kódu.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_METHOD_VIEWED]: {
    en: 'Counts when the checkout payment method picker is shown with available options. One count per checkout method-selection view.',
    cs: 'Počítá se při zobrazení výběru platební metody na pokladně včetně dostupných možností. Jednou za zobrazení výběru metody.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_QR_GENERATED]: {
    en: 'Counts when the system creates a QR code for paying by phone banking. One count per payment that gets a QR. The customer tapping “pay” on screen is counted separately.',
    cs: 'Počítá se, když systém vytvoří QR kód pro platbu přes bankovní aplikaci. Jednou za platbu s QR. Klepnutí zákazníka na „zaplatit“ na obrazovce se počítá zvlášť.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.QR_REGENERATED]: {
    en: 'Counts when the payment flow explicitly regenerates an already issued payment QR (for example retry/new cycle). One count per regenerate action.',
    cs: 'Počítá se, když platební tok výslovně znovu vygeneruje již vydaný platební QR (např. opakování/nový cyklus). Jednou za regeneraci.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_SUBMITTED]: {
    en: 'Counts when the payment is sent to the bank or card provider to process. One count per payment sent. Not the same as money already received — that is “payment confirmed”.',
    cs: 'Počítá se, když se platba odešle bance nebo platební bráně ke zpracování. Jednou za odeslanou platbu. Není totéž jako peníze už dorazily — to je „platba potvrzena“.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_CONFIRMED]: {
    en: 'Counts when the system marks a payment as successfully received. One count per successful payment. Revenue totals on dashboards use money reports, not just adding up this number.',
    cs: 'Počítá se, když systém označí platbu jako úspěšně přijatou. Jednou za každou úspěšnou platbu. Součty tržeb na přehledech vycházejí z finančních reportů, ne jen ze sečtení tohoto čísla.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_FAILED]: {
    en: 'Counts when a payment is cancelled or fails in a way the system records as failed — for example customer cancels at the terminal. One count per failed payment attempt. Closing the browser without paying is usually “visit abandoned”, not this.',
    cs: 'Počítá se, když je platba zrušena nebo selže tak, že ji systém eviduje jako neúspěšnou — např. zrušení u terminálu. Jednou za neúspěšný pokus. Zavření prohlížeče bez placení je obvykle „návštěva opuštěna“, ne toto.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.RECEIPT_OPENED]: {
    en: 'Counts when the customer opens or views a receipt on screen. One count per time they open it. Not the same as payment succeeding or an email receipt being sent.',
    cs: 'Počítá se, když zákazník otevře nebo zobrazí účtenku na obrazovce. Jednou za každé otevření. Není totéž jako úspěšná platba nebo odeslání účtenky e-mailem.',
  },
};

const EXTENSION_DESCRIPTIONS = {
  [ANALYTICS_FUNNEL_EVENTS.QR_DISPLAYED]: {
    en: 'Counts when the payment QR is rendered on screen for the customer. One count per QR display attempt.',
    cs: 'Počítá se, když se zákazníkovi vykreslí platební QR na obrazovce. Jednou za pokus o zobrazení QR.',
  },
  [ANALYTICS_FUNNEL_EVENTS.MENU_OPENED]: {
    en: 'Counts when a product menu or catalog listing is opened. One count per open action.',
    cs: 'Počítá se při otevření produktového menu nebo katalogového výpisu. Jednou za otevření.',
  },
  [ANALYTICS_FUNNEL_EVENTS.PRODUCT_SELECTED]: {
    en: 'Counts when a specific product is selected from the menu/catalog. One count per selection.',
    cs: 'Počítá se, když je z menu/katalogu vybrán konkrétní produkt. Jednou za výběr.',
  },
  [ANALYTICS_IDENTITY_EVENTS.IDENTITY_RECOGNIZED]: {
    en: 'Counts when the system recognizes an existing customer identity signal. One count per recognized identity action.',
    cs: 'Počítá se, když systém rozpozná existující identitní signál zákazníka. Jednou za akci rozpoznání.',
  },
  [ANALYTICS_IDENTITY_EVENTS.IDENTITY_LINKED]: {
    en: 'Counts when an identity is linked to a customer account record. One count per successful link.',
    cs: 'Počítá se při propojení identity se zákaznickým účtem. Jednou za úspěšné propojení.',
  },
  [ANALYTICS_IDENTITY_EVENTS.IDENTITY_MATCHED]: {
    en: 'Counts when identity matching logic returns a deterministic match result. Currently used as a controlled catalog event.',
    cs: 'Počítá se, když párování identity vrátí deterministický výsledek shody. Aktuálně slouží jako řízená katalogová událost.',
  },
  [ANALYTICS_IDENTITY_EVENTS.IDENTITY_DELETED]: {
    en: 'Counts when a customer identity link is removed. One count per delete action.',
    cs: 'Počítá se při odstranění vazby identity zákazníka. Jednou za smazání.',
  },
  [ANALYTICS_IDENTITY_EVENTS.CUSTOMER_DELETED]: {
    en: 'Counts when a customer account is deleted. One count per deleted account.',
    cs: 'Počítá se při smazání zákaznického účtu. Jednou za smazaný účet.',
  },
  [ANALYTICS_ACCOUNT_EVENTS.ACCOUNT_LOGGED_OUT]: {
    en: 'Counts when an authenticated customer explicitly logs out. One count per logout action.',
    cs: 'Počítá se, když se přihlášený zákazník explicitně odhlásí. Jednou za odhlášení.',
  },
  [ANALYTICS_ACCOUNT_EVENTS.PROFILE_UPDATED]: {
    en: 'Counts when a customer profile setting is updated and persisted. One count per update action.',
    cs: 'Počítá se při změně a uložení nastavení zákaznického profilu. Jednou za aktualizaci.',
  },
  [ANALYTICS_ACCOUNT_EVENTS.RECEIPT_CREATED]: {
    en: 'Counts when the server successfully generates a receipt for a paid transaction. One count per generated receipt. Server-only — not a customer screen open.',
    cs: 'Počítá se, když server úspěšně vygeneruje účtenku pro zaplacenou transakci. Jednou za vygenerovanou účtenku. Pouze server — není otevření obrazovky zákazníkem.',
  },
  [ANALYTICS_ACCOUNT_EVENTS.RECEIPT_DOWNLOADED]: {
    en: 'Counts when a receipt file is downloaded by the customer. One count per download action.',
    cs: 'Počítá se při stažení souboru účtenky zákazníkem. Jednou za stažení.',
  },
} as const;

const RETAIL_DESCRIPTIONS = {
  [ANALYTICS_RETAIL_EVENTS.CATALOG_IMAGE_LOAD_FAILED]: {
    en: 'Counts when a catalog product or donation project image fails to load in the browser. Includes URL class metadata only — no raw signed tokens.',
    cs: 'Počítá se, když se v prohlížeči nepodaří načíst obrázek produktu nebo donačního projektu. Metadata obsahují jen typ URL — ne surové tokeny.',
  },
  [ANALYTICS_RETAIL_EVENTS.PRODUCT_ADDED]: {
    en: 'Counts when a product is put into the shopping cart. One count per add (changing quantity may count again). Not checkout or payment yet.',
    cs: 'Počítá se, když se produkt vloží do košíku. Jednou za přidání (změna množství může počítat znovu). Ještě není pokladna ani platba.',
  },
  [ANALYTICS_RETAIL_EVENTS.PRODUCT_REMOVED]: {
    en: 'Counts when a product is removed from the cart. One count per removal. Leaving the whole order without paying is counted elsewhere.',
    cs: 'Počítá se, když se produkt odebere z košíku. Jednou za odebrání. Opuštění celé objednávky bez platby se počítá jinde.',
  },
  [ANALYTICS_RETAIL_EVENTS.CART_VIEWED]: {
    en: 'Counts when the cart screen is opened to review items. One count each time they open the cart — opening it again adds another. Sales money uses payment data, not this count alone.',
    cs: 'Počítá se, když se otevře obrazovka košíku ke kontrole položek. Jednou za každé otevření — návrat na košík přidá další. Tržby vycházejí z plateb, ne jen z tohoto počtu.',
  },
  [ANALYTICS_RETAIL_EVENTS.CART_SHEET_OPENED]: {
    en: 'Counts when the mobile sticky-cart sheet opens (summary or pay entry). One count per open with optional source metadata.',
    cs: 'Počítá se, když se na mobilu otevře panel košíku (souhrn nebo vstup k platbě). Jednou za otevření s volitelným zdrojem.',
  },
  [ANALYTICS_RETAIL_EVENTS.CART_STICKY_PAY_CLICKED]: {
    en: 'Counts when the customer taps Pay on the sticky cart bar before checkout. One count per tap.',
    cs: 'Počítá se, když zákazník klepne na Zaplatit v liště košíku před pokladnou. Jednou za klepnutí.',
  },
  [ANALYTICS_RETAIL_EVENTS.COLLECT_STEP_OPENED]: {
    en: 'Counts when the collect/pickup step sheet opens in the shop checkout funnel. One count per open.',
    cs: 'Počítá se, když se v obchodě otevře krok vyzvednutí v pokladně. Jednou za otevření.',
  },
  [ANALYTICS_RETAIL_EVENTS.COLLECT_STEP_CONFIRMED]: {
    en: 'Counts when the customer confirms collect timing and pickup point before session create. One count per confirmation.',
    cs: 'Počítá se, když zákazník potvrdí načasování a místo vyzvednutí před vytvořením relace. Jednou za potvrzení.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_STARTED]: {
    en: 'Counts when the customer moves from the cart to the payment step (for example taps Pay). One count per time they enter checkout. Payment finishing is counted separately.',
    cs: 'Počítá se, když zákazník přejde z košíku k platbě (např. klepne Zaplatit). Jednou za vstup do pokladny. Dokončení platby se počítá zvlášť.',
  },
  [ANALYTICS_RETAIL_EVENTS.GIFT_SURFACE_IMPRESSION]: {
    en: 'Counts when gift/donation nav surfaces become visible after flags and entitlements resolve. One count per poll revision per hub view.',
    cs: 'Počítá se, když se po vyhodnocení oprávnění a příznaků zobrazí navigační plochy pro dary. Jednou za revizi poll na hubu.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_PAID]: {
    en: 'Counts when a shop purchase payment is completed successfully. One count per paid order. Works together with “payment confirmed” — dashboards use money totals, not only this row count.',
    cs: 'Počítá se, když je nákup v obchodě úspěšně zaplacen. Jednou za zaplacenou objednávku. Jde ruku v ruce s „platba potvrzena“ — přehledy používají součty peněz, ne jen tento počet řádků.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_ABANDONED]: {
    en: 'Counts when someone leaves a shop order without paying. One count per abandoned order attempt. Not removing one item from the cart.',
    cs: 'Počítá se, když někdo opustí objednávku v obchodě bez zaplacení. Jednou za opuštěný pokus. Není odebrání jedné položky z košíku.',
  },
  [ANALYTICS_RETAIL_EVENTS.BUY_AGAIN_FAILED_STOCK]: {
    en: 'Counts when buy-again validation finds no lines in stock. Emitted on server and client before showing the no-stock error.',
    cs: 'Počítá se, když validace „koupit znovu“ nenajde žádné položky skladem. Odesílá server i klient před chybou bez zásoby.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_PREPARED]: {
    en: 'Counts when staff or the system moves a collect-later order into preparation. One count per transition to preparing.',
    cs: 'Počítá se, když personál nebo systém přesune objednávku collect-later do přípravy. Jednou za přechod do přípravy.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_READY]: {
    en: 'Counts when an order is marked ready for pickup. One count per ready transition. Customer notifications may follow separately.',
    cs: 'Počítá se, když je objednávka označena jako připravená k vyzvednutí. Jednou za přechod do připraveno. Upozornění zákazníkovi může následovat zvlášť.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_COLLECTED]: {
    en: 'Counts when the customer collects a ready order. One count per successful pickup confirmation.',
    cs: 'Počítá se, když zákazník vyzvedne připravenou objednávku. Jednou za úspěšné potvrzení vyzvednutí.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_TICKET_CREATED]: {
    en: 'Counts when a kiosk collect-later ticket is created before payment. One count per ticket row.',
    cs: 'Počítá se při vytvoření kioskového lístku collect-later před zaplacením. Jednou za každý lístek.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_PICKUP_SCHEDULED]: {
    en: 'Counts when a customer chooses a scheduled pickup slot. One count per scheduled slot selection.',
    cs: 'Počítá se, když zákazník zvolí plánovaný slot vyzvednutí. Jednou za výběr slotu.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_PICKUP_SLOT_MISSED]: {
    en: 'Counts when a scheduled pickup window passes without collection. One count per missed window detected by workers.',
    cs: 'Počítá se, když plánované okno vyzvednutí uplyne bez vyzvednutí. Jednou za zmeškané okno zjištěné workers.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_MODE_SELECTED]: {
    en: 'Counts when a customer selects a checkout sub-mode (pay now, collect later, etc.). One count per selection.',
    cs: 'Počítá se, když zákazník zvolí podrežim pokladny (zaplatit hned, vyzvednout později atd.). Jednou za výběr.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_HANDOFF_CREATED]: {
    en: 'Counts when a payment handoff session is created so the customer can finish checkout on another device. One count per handoff row.',
    cs: 'Počítá se při vytvoření relace pro předání platby, aby zákazník dokončil pokladnu na jiném zařízení. Jednou za každý handoff.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_HANDOFF_EXPIRED]: {
    en: 'Counts when a payment handoff session expires before completion. One count per expired handoff.',
    cs: 'Počítá se, když relace pro předání platby vyprší bez dokončení. Jednou za každé vypršení.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_HANDOFF_COMPLETED]: {
    en: 'Counts when a customer completes checkout through a payment handoff link. One count per successful handoff completion.',
    cs: 'Počítá se, když zákazník dokončí pokladnu přes odkaz handoff platby. Jednou za úspěšné dokončení handoffu.',
  },
  [ANALYTICS_RETAIL_EVENTS.BUY_AGAIN_STARTED]: {
    en: 'Counts when a customer starts a buy-again flow from order history. One count per started buy-again attempt.',
    cs: 'Počítá se, když zákazník zahájí nákup znovu z historie objednávek. Jednou za každý pokus.',
  },
  [ANALYTICS_RETAIL_EVENTS.BUY_AGAIN_TRIMMED]: {
    en: 'Counts when buy-again removes unavailable lines and continues with a reduced cart. One count per trim action.',
    cs: 'Počítá se, když „koupit znovu“ odstraní nedostupné položky a pokračuje s menším košíkem. Jednou za ořezání.',
  },
  [ANALYTICS_RETAIL_EVENTS.SELF_SERVICE_SLA_NOTICE_SHOWN]: {
    en: 'Counts when the pay-on-spot proximity SLA notice is shown (informational only).',
    cs: 'Počítá se při zobrazení informativního SLA upozornění u platby na místě.',
  },
  [ANALYTICS_RETAIL_EVENTS.CUSTOMER_PICKUP_ACK_INFORMATIONAL]: {
    en: 'Counts when a customer acknowledges prepay pickup on order detail (audit only).',
    cs: 'Počítá se při potvrzení vyzvednutí u prepaid objednávky (pouze audit).',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_QR_ISSUED]: {
    en: 'Counts when pickup QR or scan credentials are issued for an order. One count per issuance.',
    cs: 'Počítá se při vydání QR nebo skenovacích údajů pro vyzvednutí objednávky. Jednou za vydání.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_QR_SCANNED]: {
    en: 'Counts when staff or kiosk scans a pickup QR or short code to resolve an order. One count per scan.',
    cs: 'Počítá se, když personál nebo kiosk naskenuje QR nebo krátký kód pro dohledání objednávky. Jednou za sken.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_STAFF_MARK_PAID]: {
    en: 'Counts when pickup staff marks an unpaid ticket as paid in cash at the stand. One count per mark-paid action.',
    cs: 'Počítá se, když personál na výdeji označí nezaplacený lístek jako zaplacený hotově. Jednou za akci.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_PARTIAL_CONFIRM]: {
    en: 'Counts when staff confirms a partial pickup (not all lines collected). One count per partial confirmation.',
    cs: 'Počítá se, když personál potvrdí částečné vyzvednutí (ne všechny položky). Jednou za částečné potvrzení.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_FULFILLMENT_REFUSED]: {
    en: 'Counts when pickup fulfillment is refused (for example policy or stock block). One count per refusal.',
    cs: 'Počítá se, když je vyzvednutí odmítnuto (např. pravidlo nebo sklad). Jednou za odmítnutí.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_FULFILLMENT_HELD]: {
    en: 'Counts when a pickup order is placed on hold pending review. One count per hold action.',
    cs: 'Počítá se, když je objednávka k vyzvednutí pozastavena ke kontrole. Jednou za pozastavení.',
  },
  [ANALYTICS_RETAIL_EVENTS.PICKUP_FULFILLMENT_HOLD_RELEASED]: {
    en: 'Counts when a held pickup order is released back to normal flow. One count per release.',
    cs: 'Počítá se, když je pozastavená objednávka uvolněna zpět do běžného toku. Jednou za uvolnění.',
  },
  [ANALYTICS_RETAIL_EVENTS.KIOSK_CASH_COMPLETE]: {
    en: 'Counts when a kiosk cash checkout completes successfully. One count per completed cash sale.',
    cs: 'Počítá se při úspěšném dokončení hotovostní pokladny u platebního místa. Jednou za hotovostní prodej.',
  },
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_COLLECT_CONFIGURED]: {
    en: 'Counts when collect-later checkout options are configured for a session (slot, mode, etc.). One count per configuration.',
    cs: 'Počítá se při nastavení možností collect-later pro relaci (slot, režim atd.). Jednou za konfiguraci.',
  },
  [ANALYTICS_RETAIL_EVENTS.SLUG_LEGACY_REDIRECT]: {
    en: 'Counts when a legacy kioskId shop URL redirects to a slug-based platební místo URL. One count per redirect.',
    cs: 'Počítá se při přesměrování staré URL s kioskId na URL s slugem platebního místa. Jednou za přesměrování.',
  },
  [ANALYTICS_RETAIL_EVENTS.TENANT_SWITCHED]: {
    en: 'Counts when a logged-in customer switches tenant context in the account shop flow. One count per switch.',
    cs: 'Počítá se, když přihlášený zákazník přepne tenant v účtu/obchodu. Jednou za přepnutí.',
  },
};

const DONATION_DESCRIPTIONS: Record<
  (typeof ANALYTICS_DONATION_EVENTS)[keyof typeof ANALYTICS_DONATION_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_DONATION_EVENTS.DONATION_STARTED]: {
    en: 'Counts when someone starts the donation flow and chooses to give. One count per start of that flow. A finished donation is counted separately after payment.',
    cs: 'Počítá se, když někdo začne darovat a zvolí dát peníze. Jednou za začátek tohoto kroku. Dokončený dar se počítá zvlášť po zaplacení.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_AMOUNT_SELECTED]: {
    en: 'Counts when someone picks a preset donation amount (a chip on screen). One count per pick — choosing another amount adds another. Typing a custom amount is a different event.',
    cs: 'Počítá se, když někdo vybere přednastavenou částku daru (tlačítko na obrazovce). Jednou za výběr — jiná částka přidá další. Vlastní částka je jiná událost.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_CUSTOM_AMOUNT_ENTERED]: {
    en: 'Counts when someone types their own donation amount instead of a preset. One count when they confirm that amount. Preset chip clicks are not counted here.',
    cs: 'Počítá se, když někdo napíše vlastní částku daru místo předvolby. Jednou při potvrzení částky. Klepnutí na předvolbu se sem nepočítá.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_PROJECT_SELECTED]: {
    en: 'Counts when someone chooses which project or cause receives the donation. One count per project choice. Paying the donation is counted later.',
    cs: 'Počítá se, když někdo vybere, který projekt nebo účel dar dostane. Jednou za výběr projektu. Samotná platba daru se počítá později.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_IMPACT_OPENED]: {
    en: 'Counts when someone opens extra information about the project’s impact or story. One count per open. Just reading — not paying yet.',
    cs: 'Počítá se, když někdo otevře doplňující informace o dopadu nebo příběhu projektu. Jednou za otevření. Jen čtení — ještě bez platby.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_TAX_RECEIPT_SELECTED]: {
    en: 'Counts when someone turns the tax receipt option on or off. One count per change. Does not mean a receipt was already issued.',
    cs: 'Počítá se, když někdo zapne nebo vypne volbu daňového dokladu. Jednou za změnu. Neznamená, že doklad už byl vystaven.',
  },
  [ANALYTICS_DONATION_EVENTS.RECURRING_DONATION_SELECTED]: {
    en: 'Counts when someone chooses a repeating (monthly) donation option on screen. One count per choice. It does not by itself start a subscription in this report.',
    cs: 'Počítá se, když někdo na obrazovce zvolí opakovaný (měsíční) dar. Jednou za volbu. Samo o sobě tím v tomto reportu nevzniká předplatné.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_COMPLETED]: {
    en: 'Counts when a donation payment is completed successfully. One count per paid donation. Shown together with payment success in the system.',
    cs: 'Počítá se, když je dar úspěšně zaplacen. Jednou za zaplacený dar. V systému jde ruku v ruce s úspěšnou platbou.',
  },
  [ANALYTICS_DONATION_EVENTS.DONATION_ABANDONED]: {
    en: 'Counts when someone leaves the donation flow without paying. One count per time they abandon. Not the same as a failed card payment unless they cancel an active payment.',
    cs: 'Počítá se, když někdo opustí darování bez zaplacení. Jednou za každé opuštění. Není totéž jako neúspěšná platba kartou, pokud nezruší rozjetou platbu.',
  },
};

const KIOSK_DESCRIPTIONS: Record<
  (typeof ANALYTICS_KIOSK_EVENTS)[keyof typeof ANALYTICS_KIOSK_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_KIOSK_EVENTS.KIOSK_WAKEUP]: {
    en: 'Counts when the kiosk wakes up from the idle attract screen because someone touched it or it starts up. One count per wake-up. Starting a full customer visit may be counted separately.',
    cs: 'Počítá se, když se kiosk probudí z úvodní obrazovky po dotyku nebo při startu. Jednou za probuzení. Zahájení celé návštěvy zákazníka se může počítat zvlášť.',
  },
  [ANALYTICS_KIOSK_EVENTS.KIOSK_TIMEOUT]: {
    en: 'Counts when the kiosk sits unused too long and returns to the attract screen by itself. One count per timeout. Someone walking away mid-order may also count as visit abandoned.',
    cs: 'Počítá se, když kiosk dlouho nikdo nepoužívá a sám se vrátí na úvodní obrazovku. Jednou za vypršení času. Odejití uprostřed objednávky může být také „návštěva opuštěna“.',
  },
};

const PWA_DESCRIPTIONS: Record<
  (typeof ANALYTICS_PWA_EVENTS)[keyof typeof ANALYTICS_PWA_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_PWA_EVENTS.PWA_INSTALL_ACCEPTED]: {
    en: 'Counts when the user accepts the browser install prompt and adds the progressive web app to their device. One count per accepted prompt.',
    cs: 'Počítá se, když uživatel přijme výzvu prohlížeče k instalaci a přidá progresivní webovou aplikaci na zařízení. Jednou za přijatou výzvu.',
  },
  [ANALYTICS_PWA_EVENTS.PWA_INSTALL_DISMISSED]: {
    en: 'Counts when the user dismisses or declines the browser install prompt without installing the progressive web app. One count per dismissed prompt.',
    cs: 'Počítá se, když uživatel zavře nebo odmítne výzvu prohlížeče k instalaci bez instalace progresivní webové aplikace. Jednou za odmítnutou výzvu.',
  },
  [ANALYTICS_PWA_EVENTS.PWA_UPDATE_SHOWN]: {
    en: 'Counts when an in-app prompt tells the user a new service-worker version is ready to apply. One count each time the update UI is shown.',
    cs: 'Počítá se, když výzva v aplikaci oznámí, že je připravena nová verze service workeru. Jednou za každé zobrazení výzvy k aktualizaci.',
  },
  [ANALYTICS_PWA_EVENTS.PWA_UPDATE_DEFERRED]: {
    en: 'Counts when the user postpones applying a ready progressive web app update and keeps the current version. One count per deferral.',
    cs: 'Počítá se, když uživatel odloží použití připravené aktualizace progresivní webové aplikace a ponechá stávající verzi. Jednou za odložení.',
  },
  [ANALYTICS_PWA_EVENTS.PWA_UPDATE_APPLIED]: {
    en: 'Counts when the user applies a ready progressive web app update and the new service-worker version takes effect. One count per applied update.',
    cs: 'Počítá se, když uživatel použije připravenou aktualizaci progresivní webové aplikace a nová verze service workeru se aktivuje. Jednou za použitou aktualizaci.',
  },
};

const SERVER_OPS_DESCRIPTIONS: Record<
  (typeof ANALYTICS_SERVER_OPS_EVENTS)[keyof typeof ANALYTICS_SERVER_OPS_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_ASSIGNED]: {
    en: 'Counts when a primary product or variant barcode is saved, including confirmed overwrite moves. Emitted server-side after admin or pickup staff mutations.',
    cs: 'Počítá se při uložení primárního čárového kódu produktu či varianty, včetně potvrzeného přesunu. Emituje server po změně administrátorem nebo personálem vyzvednutí.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_CLEARED]: {
    en: 'Counts when the primary barcode is removed from a product or variant. Emitted server-side after admin or pickup staff mutations.',
    cs: 'Počítá se při odstranění primárního čárového kódu z produktu nebo varianty. Emituje server po změně administrátorem nebo personálem vyzvednutí.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_ALT_ADDED]: {
    en: 'Counts when an alternate barcode alias is added to a product or variant. Emitted server-side after admin or pickup staff mutations.',
    cs: 'Počítá se při přidání alternativního aliasu čárového kódu. Emituje server po změně administrátorem nebo personálem vyzvednutí.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_ALT_REMOVED]: {
    en: 'Counts when an alternate barcode alias is removed from a product or variant. Emitted server-side after admin or pickup staff mutations.',
    cs: 'Počítá se při odebrání alternativního aliasu čárového kódu. Emituje server po změně administrátorem nebo personálem vyzvednutí.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_ALT_PROMOTED]: {
    en: 'Counts when an alternate barcode is promoted to primary. Emitted server-side after admin or pickup staff mutations.',
    cs: 'Počítá se, když je alternativní čárový kód povýšen na primární. Emituje server po změně administrátorem nebo personálem vyzvednutí.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_ASSIGN_CONFLICT]: {
    en: 'Counts when a barcode assign is rejected because the code already belongs to another product, without overwrite confirmation. Emitted server-side on 409 responses.',
    cs: 'Počítá se, když je přiřazení čárového kódu odmítnuto, protože kód už patří jinému produktu a nebylo potvrzeno přepsání. Emituje server při odpovědi 409.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_LOOKUP_HIT]: {
    en: 'Counts when a scanned barcode resolves to a known product or variant during lookup. Emitted server-side for successful lookup calls.',
    cs: 'Počítá se, když naskenovaný čárový kód při lookupu odpovídá známému produktu nebo variantě. Emituje server pro úspěšné lookup volání.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PRODUCT_BARCODE_LOOKUP_MISS]: {
    en: 'Counts when a scanned barcode does not match any known product during lookup. Emitted server-side for lookup misses.',
    cs: 'Počítá se, když naskenovaný čárový kód při lookupu neodpovídá žádnému známému produktu. Emituje server pro lookup miss.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PHYSICAL_CARD_ISSUED]: {
    en: 'Counts when an administrator issues a new physical loyalty card. Emitted server-side; card secrets are never included in metadata.',
    cs: 'Počítá se, když administrátor vydá novou fyzickou věrnostní kartu. Emituje server; tajné údaje karty nejsou v metadatech.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.PHYSICAL_CARD_REVOKED]: {
    en: 'Counts when a physical loyalty card is revoked and can no longer be scanned at a kiosk. Emitted server-side after admin revoke.',
    cs: 'Počítá se, když je fyzická věrnostní karta zneplatněna a nelze ji již naskenovat na kiosku. Emituje server po zneplatnění administrátorem.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.RECURRING_PAYMENT_MISSED]: {
    en: 'Counts when an expected recurring donation payment did not arrive by the due date. One count per missed period on a standing-order setup. Emitted by the reconciliation worker, not by a customer session.',
    cs: 'Počítá se, když očekávaná platba opakovaného daru nedorazí do termínu. Jednou za každé zmeškané období trvalého příkazu. Emituje workers reconciliace, ne klientská relace.',
  },
  [ANALYTICS_SERVER_OPS_EVENTS.RECURRING_PAYMENT_RECEIVED]: {
    en: 'Counts when an inbound bank movement matches a recurring donation standing-order setup. Emitted by reconciliation after SS match.',
    cs: 'Počítá se, když příchozí bankovní pohyb sedí na trvalý příkaz k opakovanému daru. Emituje reconciliace po shodě SS.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_PREVIEW_EVALUATED]: {
    en: 'Counts when checkout promo pricing preview runs for a cart. Server-side only.',
    cs: 'Počítá se při náhledu promo ceny košíku. Pouze server.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_REWARD_ACTIVATED]: {
    en: 'Counts when a customer activates a promo reward for checkout.',
    cs: 'Počítá se, když zákazník aktivuje promo odměnu pro checkout.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_REWARD_REDEEMED]: {
    en: 'Counts when a promo reward is committed on payment completion.',
    cs: 'Počítá se při uplatnění promo odměny po dokončení platby.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_REWARD_ROLLED_BACK]: {
    en: 'Counts when a promo reward rollback runs after refund.',
    cs: 'Počítá se při vrácení promo odměny po refundaci.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_PROGRESS_THRESHOLD_REACHED]: {
    en: 'Counts when buy-X progress crosses an issue threshold.',
    cs: 'Počítá se, když postup buy-X překročí práh pro vydání odměny.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_STACKING_REJECTED]: {
    en: 'Counts when promo and loyalty stacking policy rejects a candidate.',
    cs: 'Počítá se, když pravidla kombinace promo a věrnosti odmítnou kandidáta.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_BUDGET_SOFT_STOP]: {
    en: 'Counts when promo spend crosses a soft-stop threshold.',
    cs: 'Počítá se při překročení měkkého limitu promo rozpočtu.',
  },
  [ANALYTICS_PROMO_EVENTS.PROMO_BUDGET_EXHAUSTED]: {
    en: 'Counts when promo event budget is fully exhausted.',
    cs: 'Počítá se, když je promo rozpočet akce vyčerpán.',
  },
};

function buildAnalyticsEventDescriptions(): Record<AnalyticsEventName, LocalizedLabel> {
  const descriptions = {
    ...UNIVERSAL_DESCRIPTIONS,
    ...EXTENSION_DESCRIPTIONS,
    ...RETAIL_DESCRIPTIONS,
    ...DONATION_DESCRIPTIONS,
    ...KIOSK_DESCRIPTIONS,
    ...PWA_DESCRIPTIONS,
    ...SERVER_OPS_DESCRIPTIONS,
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
