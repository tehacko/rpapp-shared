import {
  ANALYTICS_DONATION_EVENTS,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_KIOSK_EVENTS,
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
    cs: 'Počítá se, když na kiosku nebo v aplikaci začne nová návštěva zákazníka. Jednou za každou novou návštěvu — opakování ve stejné návštěvě nepřidá další. Není totéž jako číslo „zahájených relací“ na některých grafech, které se počítá jinak.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_COMPLETED]: {
    en: 'Counts when a visit ends in a normal, finished way — often after a successful payment. Usually one per finished visit. Not the same as “payment went through” or “order paid” — those are counted separately.',
    cs: 'Počítá se, když návštěva skončí normálně — často po úspěšné platbě. Obvykle jednou za každou dokončenou návštěvu. Není totéž jako „platba prošla“ nebo „objednávka zaplacena“ — to se počítá zvlášť.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SESSION_ABANDONED]: {
    en: 'Counts when someone leaves without finishing — closed tab, walked away, timed out, or cancelled in a way that ends the visit. One count per time that happens for a visit. Not the same as “payment failed” when they only cancel a payment step.',
    cs: 'Počítá se, když někdo odejde bez dokončení — zavře stránku, odejde od kiosku, vyprší čas, nebo zruší tak, že návštěva skončí. Jednou za každý takový konec návštěvy. Není totéž jako „platba selhala“, když zruší jen krok platby.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.SCREEN_VIEWED]: {
    en: 'Counts each time a screen is shown on the kiosk or customer app — home, cart, payment, and so on. Every time they open or return to a screen adds one. Not a new visit, not a payment result.',
    cs: 'Počítá se pokaždé, když se na kiosku nebo v aplikaci zobrazí obrazovka — úvod, košík, platba atd. Každé otevření nebo návrat na obrazovku přidá jednu. Není nová návštěva ani výsledek platby.',
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
  [ANALYTICS_UNIVERSAL_EVENTS.AUTH_FLOW_STARTED]: {
    en: 'Counts when someone starts logging in or signing up. One count per time they begin that process. Success or new account is counted with different events.',
    cs: 'Počítá se, když někdo začne přihlašování nebo registraci. Jednou za každý začátek. Úspěch nebo nový účet se počítá jinými událostmi.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.IDENTITY_COMPLETED]: {
    en: 'Counts when someone finishes a step like confirming phone or email in the journey. One count per completed step. Not the same as “logged in” or “account created”.',
    cs: 'Počítá se, když někdo dokončí krok jako potvrzení telefonu nebo e-mailu. Jednou za každý dokončený krok. Není totéž jako „přihlášen“ nebo „účet vytvořen“.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.LOGIN_SUCCESS]: {
    en: 'Counts when login succeeds. Usually one per customer per shop when the system remembers them — repeats may be ignored. Not the same as creating a brand-new account.',
    cs: 'Počítá se po úspěšném přihlášení. Obvykle jednou na zákazníka a provozovnu, když si systém pamatuje — opakování mohou být ignorována. Není totéž jako založení úplně nového účtu.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.ACCOUNT_CREATED]: {
    en: 'Counts when a new customer account is created. One count per new account. Returning customers who only log in are not counted here.',
    cs: 'Počítá se při vytvoření nového zákaznického účtu. Jednou za každý nový účet. Zákazníci, kteří se jen přihlásí, se sem nepočítají.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_STARTED]: {
    en: 'Counts when a payment attempt begins — customer chose to pay and the system started handling it. One count per payment try (retries may merge into one). Not the same as payment finished or QR code shown alone.',
    cs: 'Počítá se, když začne pokus o platbu — zákazník zvolil zaplatit a systém to začal řešit. Jednou za pokus (opakování se mohou sloučit). Není totéž jako dokončená platba nebo jen zobrazení QR kódu.',
  },
  [ANALYTICS_UNIVERSAL_EVENTS.PAYMENT_QR_GENERATED]: {
    en: 'Counts when the system creates a QR code for paying by phone banking. One count per payment that gets a QR. The customer tapping “pay” on screen is counted separately.',
    cs: 'Počítá se, když systém vytvoří QR kód pro platbu přes bankovní aplikaci. Jednou za platbu s QR. Klepnutí zákazníka na „zaplatit“ na obrazovce se počítá zvlášť.',
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

const RETAIL_DESCRIPTIONS: Record<
  (typeof ANALYTICS_RETAIL_EVENTS)[keyof typeof ANALYTICS_RETAIL_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_RETAIL_EVENTS.CATALOG_INTERACTION]: {
    en: 'Counts when someone browses products — opens categories or product details in the shop. One count per browsing action recorded. Adding to cart is a different event.',
    cs: 'Počítá se, když někdo prohlíží produkty — otevře kategorie nebo detail v obchodě. Jednou za zaznamenanou interakci. Přidání do košíku je jiná událost.',
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
  [ANALYTICS_RETAIL_EVENTS.CHECKOUT_STARTED]: {
    en: 'Counts when the customer moves from the cart to the payment step (for example taps Pay). One count per time they enter checkout. Payment finishing is counted separately.',
    cs: 'Počítá se, když zákazník přejde z košíku k platbě (např. klepne Zaplatit). Jednou za vstup do pokladny. Dokončení platby se počítá zvlášť.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_PAID]: {
    en: 'Counts when a shop purchase payment is completed successfully. One count per paid order. Works together with “payment confirmed” — dashboards use money totals, not only this row count.',
    cs: 'Počítá se, když je nákup v obchodě úspěšně zaplacen. Jednou za zaplacenou objednávku. Jde ruku v ruce s „platba potvrzena“ — přehledy používají součty peněz, ne jen tento počet řádků.',
  },
  [ANALYTICS_RETAIL_EVENTS.RETAIL_ORDER_ABANDONED]: {
    en: 'Counts when someone leaves a shop order without paying. One count per abandoned order attempt. Not removing one item from the cart.',
    cs: 'Počítá se, když někdo opustí objednávku v obchodě bez zaplacení. Jednou za opuštěný pokus. Není odebrání jedné položky z košíku.',
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

const SERVER_OPS_DESCRIPTIONS: Record<
  (typeof ANALYTICS_SERVER_OPS_EVENTS)[keyof typeof ANALYTICS_SERVER_OPS_EVENTS],
  LocalizedLabel
> = {
  [ANALYTICS_SERVER_OPS_EVENTS.RECURRING_PAYMENT_MISSED]: {
    en: 'Counts when an expected recurring donation payment did not arrive by the due date. One count per missed period on a standing-order setup. Emitted by the reconciliation worker, not by a customer session.',
    cs: 'Počítá se, když očekávaná platba opakovaného daru nedorazí do termínu. Jednou za každé zmeškané období trvalého příkazu. Emituje workers reconciliace, ne klientská relace.',
  },
};

function buildAnalyticsEventDescriptions(): Record<AnalyticsEventName, LocalizedLabel> {
  const descriptions = {
    ...UNIVERSAL_DESCRIPTIONS,
    ...RETAIL_DESCRIPTIONS,
    ...DONATION_DESCRIPTIONS,
    ...KIOSK_DESCRIPTIONS,
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
