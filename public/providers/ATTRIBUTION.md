# Payment marks — attribution & §14 status

**Matrix §14 / brand-kit (`g14-payment-marks`): Fail until a full licensed kit lands.**  
Present placeholders / unlicensed geometry ≠ Pass. Do not claim Pass in UI copy or ops checklists until every required mark below is **Pass**.

**Plan todo `g14`:** do **not** mark completed while any card mark remains BLOCKED (parent owns YAML).

| File | Status | Source / blocker | SHA-256 (UTF-8 bytes; identical under `shared/`, `admin-app/`, `rpapp-customer/` `public/providers/`) |
| --- | --- | --- | --- |
| `gopay.svg` | **Pass** | Official GoPay banner SVG (`gopay-banner-blue.svg`) from GoPay help merchant pack. EN: https://help.gopay.com/en/knowledge-base/integration-of-payment-gateway/integration-of-payment-gateway-1/gopay-banners · CS: https://help.gopay.com/cs/tema/integrace-platebni-brany/loga-a-bannery/gopay-bannery. ZIP hashes (CS help `download.php`): `b5209b25…ebe1dbe2` (small PNG pack), `64415cb9…746e3fd2` (large SVG/EPS/AI pack). **Link-back required:** https://www.gopay.cz. Retrieved / re-verified 2026-11-03. Tagged `RPAPP_LICENSED_PAYMENT_MARK`. | `4BE4485276DCB2B546B9D30911157F3A47399C30E895FB730368660F59DDA61F` |
| `visa.svg` | **BLOCKED** | Visa Brand Mark requires Brand Center download. Probe 2026-11-03: `https://brand.visa.com/` → **HTTP 200** Frontify auth shell at `https://brand.visa.com/auth/?referer=%2F` (login / account gate; no public SVG). Merchant signage `https://www.merchantsignage.visa.com/brandguidelines` → **302** to `merchantsignageeu.visa.com` then **TLS connection reset (curl 35)**. Standards PDF only (not artwork): `visa-brand-standards-sept2025.pdf` HTTP 200. GoPay merchant pack supplies `visa-full-colour-rgb.eps` / Verified-by-Visa EPS — **not** licensed SVG Brand Mark; EPS→SVG conversion / DIY redraws are **forbidden** as licensed. Current file remains DIY placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). | `FB30F0540E19CCA44B75C34129E5A37CE6A3E3D16C2D90F5BA976DF8C368AAA7` |
| `mastercard.svg` | **BLOCKED** | Mastercard Brand Mark requires Brand Center Download Artwork. Probe 2026-11-03: `https://www.mastercard.com/brandcenter/us/en/download-artwork.html`, `…/artwork/other-marks.html`, `…/brandcenter/`, `https://brand.mastercard.com/` → **HTTP 403** without session. GoPay Dropbox `mastercard_acceptance_new_logo.svg.svg` HTTP 200 (Acceptance Mark SVG, sha256 `BDBFF3E1BF644EEE5A02D4C55C92687353697763D73D7748167945494EFAEFED`) is **not** substituted: wrong mark class for §14 Brand Mark kit + incomplete kit without Visa Secure / Identity Check SVGs. PNG/AI POS assets in GoPay ZIP are not SVG Brand Center exports. Current file remains DIY placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). | `D6C1322B21FB8A01F53B21951E17E864A55D2A44A3D80E576E49800EEC3B539D` |
| `visa-secure.svg` | **BLOCKED** | Visa Secure Badge Logo Assets require merchant-signage / Brand Center package. Probe 2026-11-03: merchantsignage / EU portal **TLS reset (curl 35)**; Brand Center **auth gate**. Standards PDF `visa-secure-brand-standards-sept2025.pdf` HTTP 200 (guidance only). GoPay pack still hosts obsolete **Verified by Visa** EPS — not Visa Secure badge SVG. Current file remains DIY placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). | `88734295AF635C5372D3A109C5EEAFF8ECCAF29E13EB61AF00C0D6066C4C6010` |
| `mastercard-id-check.svg` | **BLOCKED** | Identity Check Symbol = Mastercard Symbol **without** wordmark (Program Guide **19 Nov 2019** App B + Brand Center Other Marks; SecureCode retired). Probe 2026-11-03: Brand Center Other Marks **HTTP 403**. Program PDF HTTP 200 (text only). GoPay still redistributes **SecureCode** PNG/AI (retired) — must not be used as Identity Check. Current file remains DIY placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). | `C0214D6A9FAF0617B520140D203B6D9BD6AD2E2C69AE39BAB77F554FCC19B242` |

## Probe evidence (2026-11-03)

| Endpoint | Result |
| --- | --- |
| `https://brand.visa.com/` | 200 → `/auth/?referer=%2F` (login gate) |
| `https://www.merchantsignage.visa.com/brandguidelines` | 302 → `merchantsignageeu.visa.com` → TLS reset (curl 35) |
| `https://merchantsignageeu.visa.com/` | TLS reset (curl 35) |
| `https://www.mastercard.com/brandcenter/us/en/download-artwork.html` | **403** |
| `https://www.mastercard.com/brandcenter/us/en/artwork/other-marks.html` | **403** |
| `https://brand.mastercard.com/` | **403** |
| GoPay CS banner ZIPs (`download.php` hashes above) | **200** — GoPay SVG Pass; card marks EPS/AI/PNG only |
| DIY `.tmp-payment-marks/kit-{visa,mastercard,visa-secure,mastercard-id-check}.svg` | **Not installed** (invented redraws falsely tagged licensed) |

Raw probe log: `rpapp/.tmp-payment-marks/g1-probe-20261103-214324/`.

## Runtime Fail UI

`PlatformPaymentMarks` (admin) and `PaymentMarksStrip` (customer) fetch `/providers/*.svg` and treat a mark as unlicensed when the SVG body contains:

- comment `RPAPP_PAYMENT_MARK_PLACEHOLDER`, or
- `<text` combined with a VISA / Mastercard / Secure / ID Check / DIY `GoPay` placeholder pattern

Unlicensed kit → warning with `data-testid="payment-marks-unlicensed"`. Matrix §14 must remain **Fail**.

## Kit layout

Canonical copies live under `shared/public/providers/`. Deploy mirrors (byte-identical after G1 sync):

- `admin-app/public/providers/`
- `rpapp-customer/public/providers/`

Kiosk website chrome was **not** expanded in the G1 shrink pass beyond optional future `gopay.svg` sync.

## Unlock path (human)

1. Authenticate to Visa Brand Center + merchant-signage; download official Visa Brand Mark + Visa Secure Badge SVG/AI packs.
2. Authenticate to Mastercard Brand Center; download Brand Mark + Identity Check Symbol (Other Marks) SVG packs.
3. Drop official SVGs into `shared/public/providers/`, strip `RPAPP_PAYMENT_MARK_PLACEHOLDER`, add `RPAPP_LICENSED_PAYMENT_MARK` + provenance comments, mirror identical bytes to admin + customer, then parent may complete `g14`.
