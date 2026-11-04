# Payment marks — attribution & §14 status

**Matrix §14 / brand-kit (`g14-payment-marks`): Pass (2026-11-04).**  
All ten kit files (`light|dark` × five marks) carry `RPAPP_LICENSED_PAYMENT_MARK` and no `RPAPP_PAYMENT_MARK_PLACEHOLDER`. Merchant Brand Center / GoPay pack drops (phases 1–2) tagged + mirrored (phases 3–4).

**Plan todo `g14-payment-marks`:** complete when this table is all **Pass** and mirrors match (parent owns YAML).

| File | Theme | Status | Source | SHA-256 (UTF-8; `shared/` ≡ `admin-app/` ≡ `rpapp-customer/` `public/providers/{theme}/`) |
| --- | --- | --- | --- | --- |
| `gopay.svg` | light | **Pass** | Official GoPay banner SVG (`gopay-banner-blue.svg`) from GoPay help merchant pack. EN: https://help.gopay.com/en/knowledge-base/integration-of-payment-gateway/integration-of-payment-gateway-1/gopay-banners · CS: https://help.gopay.com/cs/tema/integrace-platebni-brany/loga-a-bannery/gopay-bannery. **Link-back required:** https://www.gopay.cz. Tagged `RPAPP_LICENSED_PAYMENT_MARK` (retrieved 2026-11-03; re-tagged 2026-11-04). | `26928FDB919890EFF7B718ED231CEF228A2B2C40F6FD0A05FDEB0D14F0B844D5` |
| `gopay.svg` | dark | **Pass** | Same GoPay merchant-pack banner as light (merchant drop; no separate white banner substituted this pass). Link-back https://www.gopay.cz. | `78F45940B794AF5B8AB2C681AAF6A00F9BBE7B668FE21C78B535016E0083DEBA` |
| `visa.svg` | light | **Pass** | Visa Brand Mark from Visa Brand Center / merchant signage (merchant drop 2026-11-04). https://brand.visa.com/ | `43C57DC8B65585A9EF2481416981AFE77A0D793649D613B269BB81E7E4C9F573` |
| `visa.svg` | dark | **Pass** | Visa Brand Mark reverse / dark variant from Brand Center pack (merchant drop 2026-11-04). | `7E65400DA2AFA9C94F94416ACDD540B12748C3CCDDBA0AEC6B5DAB6D81671EA7` |
| `mastercard.svg` | light | **Pass** | Mastercard Brand Mark from Brand Center Download Artwork (merchant drop 2026-11-04). https://www.mastercard.com/brandcenter/us/en/download-artwork.html | `8F1EC71A0854DD0F41825449092BAD391DD6044EA294D02A2D330E6D3BE56D0B` |
| `mastercard.svg` | dark | **Pass** | Mastercard Brand Mark (merchant drop; geometry matches light this pass). | `3A7F07BD446339CEE947344DDC1BB4995B68F49C6E5A6E654E8056C91ABD6042` |
| `visa-secure.svg` | light | **Pass** | Visa Secure badge from Brand Center / merchant signage (merchant drop 2026-11-04). https://www.merchantsignage.visa.com/brandguidelines | `8AB07F9F99EE2D73FFA329E09F4E0D6B908450E993C32E011B79BF5F0515D071` |
| `visa-secure.svg` | dark | **Pass** | Visa Secure badge (merchant drop; geometry matches light this pass). | `2D54019FCAD8FF9204346433B105821F48BB9C3AA50CCA11B27B861A7A33E3D7` |
| `mastercard-id-check.svg` | light | **Pass** | Mastercard Identity Check Symbol (circles, no wordmark) — Program Guide 19 Nov 2019 App B + Brand Center Other Marks (merchant drop). https://www.mastercard.com/brandcenter/us/en/artwork/other-marks.html | `8FEAD21BDA11C97982CDD1757FAC5000F4BD4191BFC45D14F8F64853D820309D` |
| `mastercard-id-check.svg` | dark | **Pass** | Identity Check Symbol dark / reverse variant (merchant drop 2026-11-04). | `D34CBDF97A95B464BD783D45F4BC6F154D6A30FEAF4FBE005BBC61BA0337C6F3` |

SHA differs between light/dark even when path geometry matches because the licensed comment embeds `theme: light|dark`.

## Historical probe (2026-11-03 — pre-drop)

| Endpoint | Result (then) |
| --- | --- |
| `https://brand.visa.com/` | 200 → `/auth/?referer=%2F` (login gate) |
| `https://www.merchantsignage.visa.com/brandguidelines` | 302 → EU portal → TLS reset |
| Mastercard Brand Center artwork URLs | **403** without session |
| GoPay CS banner ZIPs | **200** — GoPay SVG already Pass |

Raw probe log: `rpapp/.tmp-payment-marks/g1-probe-20261103-214324/`. **Superseded** by merchant Brand Center drop 2026-11-04.

## Runtime Fail UI

`PlatformPaymentMarks` (admin) and `PaymentMarksStrip` (customer) fetch **theme kits** `/providers/light|dark/*.svg` (via `effectiveTheme`) and treat a mark as unlicensed when the SVG body contains:

- comment `RPAPP_PAYMENT_MARK_PLACEHOLDER`, or
- `<text` combined with a VISA / Mastercard / Secure / ID Check / DIY `GoPay` placeholder pattern

Unlicensed kit → warning with `data-testid="payment-marks-unlicensed"`. With the Pass table above, that testid must **not** appear for the five required marks.

## Kit layout (light + dark)

Canonical copies live under `shared/public/providers/{light|dark}/`. Deploy mirrors (byte-identical):

- `admin-app/public/providers/{light|dark}/`
- `rpapp-customer/public/providers/{light|dark}/`

Root `providers/*.svg` files are legacy mirrors of **light** only; UI strips use theme folders. Operator steps: **`PAYMENT_MARKS_THEME_KIT.md`**.

Kiosk website chrome was **not** expanded for dual theme kits (OOS).
