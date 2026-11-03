# Payment marks — attribution & §14 status

**Matrix §14 / brand-kit (`g14-payment-marks`): Fail until a full licensed kit lands.**  
Present placeholders / unlicensed geometry ≠ Pass. Do not claim Pass in UI copy or ops checklists until every required mark below is **Pass**.

| File | Status | Source / blocker |
| --- | --- | --- |
| `gopay.svg` | **Pass** | Official GoPay banner SVG (`gopay-banner-blue.svg`) from GoPay help merchant pack. EN: https://help.gopay.com/en/knowledge-base/integration-of-payment-gateway/integration-of-payment-gateway-1/gopay-banners · CS: https://help.gopay.com/cs/tema/integrace-platebni-brany/loga-a-bannery/gopay-bannery. **Link-back required:** https://www.gopay.cz. Retrieved 2026-11-03. Identical bytes under `shared/`, `admin-app/`, and `rpapp-customer/` `public/providers/`. |
| `visa.svg` | **BLOCKED** | Visa Brand Mark requires Brand Center / merchant-signage download (https://brand.visa.com/ · https://www.merchantsignage.visa.com/brandguidelines · Fundamentals Sept 2025 PDF). Merchant-signage portal TLS reset from this environment; Brand Center form/login gate. Current file is a DIY / unlicensed placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). |
| `mastercard.svg` | **BLOCKED** | Mastercard Brand Mark requires Brand Center Download Artwork (https://www.mastercard.com/brandcenter/us/en/download-artwork.html) — login / account gate (HTTP 403 without session). Current file is a DIY / unlicensed placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). |
| `visa-secure.svg` | **BLOCKED** | Visa Secure Badge Logo Assets require merchant-signage / Brand Center package (Sept 2025 standards PDF + signage downloads). Portal TLS / login blocked this pass. Current file is a DIY / unlicensed placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). |
| `mastercard-id-check.svg` | **BLOCKED** | Identity Check Symbol = Mastercard Symbol **without** wordmark (Program Guide **19 Nov 2019** App B + Brand Center Other Marks; SecureCode retired). Brand Center Other Marks requires login (HTTP 403). Current file is a DIY / unlicensed placeholder (`RPAPP_PAYMENT_MARK_PLACEHOLDER`). |

## Runtime Fail UI

`PlatformPaymentMarks` (admin) and `PaymentMarksStrip` (customer) fetch `/providers/*.svg` and treat a mark as unlicensed when the SVG body contains:

- comment `RPAPP_PAYMENT_MARK_PLACEHOLDER`, or
- `<text` combined with a VISA / Mastercard / Secure / ID Check / DIY `GoPay` placeholder pattern

Unlicensed kit → warning with `data-testid="payment-marks-unlicensed"`. Matrix §14 must remain **Fail**.

## Kit layout

Canonical copies live under `shared/public/providers/`. Deploy mirrors:

- `admin-app/public/providers/`
- `rpapp-customer/public/providers/`

Kiosk website chrome was **not** expanded in the G1 shrink pass beyond optional future `gopay.svg` sync.
