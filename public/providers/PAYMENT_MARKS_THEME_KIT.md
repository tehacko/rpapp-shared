# Payment marks — light/dark theme kit operator manual

**Goal:** Every GoPay §14 mark has **two** official SVGs — one for light UI surfaces, one for dark — and the apps switch automatically with `effectiveTheme`.

**Code (already wired):**

| Surface | Component | URL pattern |
|---------|-----------|-------------|
| Admin (`/`, AdjustPlanModal, `/legal/payments`) | `PlatformPaymentMarks` | `/providers/{light\|dark}/{file}.svg` |
| Customer shop/checkout | `PaymentMarksStrip` | same |

Theme source: `useTheme().effectiveTheme` (`light` \| `dark`). Attribute `data-payment-mark-theme` on the strip for QA.

---

## 1. Folder layout (single source of truth)

Edit under **`shared/public/providers/`**, then mirror **byte-identical** copies:

```
shared/public/providers/
  light/
    visa.svg
    mastercard.svg
    visa-secure.svg
    mastercard-id-check.svg
    gopay.svg
  dark/
    visa.svg
    mastercard.svg
    visa-secure.svg
    mastercard-id-check.svg
    gopay.svg
  ATTRIBUTION.md
  PAYMENT_MARKS_THEME_KIT.md   ← this file
```

Deploy mirrors (must match `shared` hashes):

- `admin-app/public/providers/light|dark/`
- `rpapp-customer/public/providers/light|dark/`

Root copies (`providers/visa.svg` etc.) are **legacy fallbacks only** — UI no longer reads them for §14 strips. Keep them in sync with `light/` until you delete them deliberately.

---

## 2. What to download (licensed only — no DIY redraws)

### A. GoPay (public — no Brand Center login)

1. Open **EN:** https://help.gopay.com/en/knowledge-base/integration-of-payment-gateway/integration-of-payment-gateway-1/gopay-banners  
   or **CS:** https://help.gopay.com/cs/tema/integrace-platebni-brany/loga-a-bannery/gopay-bannery
2. Download the **SVG banner pack** (ZIP).
3. From the pack:
   - **Light kit:** use the blue banner SVG (e.g. `gopay-banner-blue.svg`) → save as `light/gopay.svg`
   - **Dark kit:** use the **white / inverted** banner SVG from the same pack (name varies by ZIP; pick the mark intended for dark backgrounds) → save as `dark/gopay.svg`
4. If the pack has only one SVG: put that file in **both** folders temporarily and note it in ATTRIBUTION (dark kit incomplete until white banner lands).
5. **Required:** GoPay mark in UI must link to https://www.gopay.cz (already coded).

### B. Visa Brand Mark + Visa Secure (login required)

1. Create/login: https://brand.visa.com/ (Frontify auth).
2. Also use merchant signage when available: https://www.merchantsignage.visa.com/brandguidelines (EU host may differ).
3. Download official **Visa Brand Mark** SVG (or AI→export SVG only if Visa’s kit allows; do **not** hand-trace).
4. Download official **Visa Secure** badge logo assets (Sept 2025 standards + signage pack).
5. Map files:
   | Kit | Typical brand guidance | Save as |
   |-----|------------------------|---------|
   | Light | Full-color / standard on white or light | `light/visa.svg`, `light/visa-secure.svg` |
   | Dark | Reverse / white / monochrome-for-dark | `dark/visa.svg`, `dark/visa-secure.svg` |
6. Prefer official “for dark backgrounds” / reverse assets. Do **not** invent CSS filters as a substitute for licensed reverse marks if Brand Center ships a reverse file.

### C. Mastercard Brand Mark + Identity Check Symbol (login required)

1. Login: https://www.mastercard.com/brandcenter/us/en/download-artwork.html
2. Download **Mastercard Brand Mark** artwork.
3. Download **Identity Check Symbol** from **Other Marks** (Program Guide **19 Nov 2019** App B): **circles without wordmark**. **Do not** use retired SecureCode logos.
4. Map:
   | Kit | Save as |
   |-----|---------|
   | Light | `light/mastercard.svg`, `light/mastercard-id-check.svg` |
   | Dark | `dark/mastercard.svg`, `dark/mastercard-id-check.svg` |

---

## 3. File tagging (required before claiming §14 Pass)

At the top of **each** licensed SVG (both themes), use an HTML comment:

```xml
<!-- RPAPP_LICENSED_PAYMENT_MARK | source: <Brand Center path or GoPay ZIP entry> | theme: light|dark | retrieved: YYYY-MM-DD -->
```

- Remove any `RPAPP_PAYMENT_MARK_PLACEHOLDER` comment.
- Never tag DIY redraws as licensed.

Runtime Fail UI (`data-testid=payment-marks-unlicensed`) trips on:

- `RPAPP_PAYMENT_MARK_PLACEHOLDER`, or
- `<text>` doodles matching VISA / Mastercard / Secure / ID Check / DIY GoPay patterns.

**§14 Pass** only when **all 10 files** (5 × light + 5 × dark) are licensed and present.

---

## 4. Sync script (PowerShell from repo)

After dropping files into `shared/public/providers/light` and `dark`:

```powershell
$shared = 'rpapp\shared\public\providers'
$mirrors = @(
  'rpapp\admin-app\public\providers',
  'rpapp\rpapp-customer\public\providers'
)
foreach ($theme in @('light','dark')) {
  foreach ($destRoot in $mirrors) {
    New-Item -ItemType Directory -Force -Path "$destRoot\$theme" | Out-Null
    Copy-Item -Force "$shared\$theme\*.svg" "$destRoot\$theme\"
  }
}
# Optional: keep legacy root names = light kit
Copy-Item -Force "$shared\light\*.svg" "$shared\"
Copy-Item -Force "$shared\light\*.svg" "rpapp\admin-app\public\providers\"
Copy-Item -Force "$shared\light\*.svg" "rpapp\rpapp-customer\public\providers\"
```

Verify identical hashes:

```powershell
Get-FileHash rpapp\shared\public\providers\light\*.svg, rpapp\admin-app\public\providers\light\*.svg -Algorithm SHA256
Get-FileHash rpapp\shared\public\providers\dark\*.svg, rpapp\admin-app\public\providers\dark\*.svg -Algorithm SHA256
```

Update `ATTRIBUTION.md` status table (Pass/BLOCKED per file **and** theme).

---

## 5. Manual UI check

1. Start admin + customer + API as usual.
2. **Admin light:** open `/` or `/legal/payments` → DevTools Network: images from `/providers/light/…`. Strip has `data-payment-mark-theme="light"`.
3. **Admin dark:** toggle theme → same page loads `/providers/dark/…`, `data-payment-mark-theme="dark"`.
4. **Customer:** `/{tenant}/shop` (and checkout payment step) — flip theme in settings; confirm light/dark URLs.
5. GoPay logo click → https://www.gopay.cz.
6. While any placeholder remains → `payment-marks-unlicensed` warning still shown; matrix §14 stays Fail; plan todo `g14-payment-marks` stays `in_progress`.
7. **Status 2026-11-04:** all 10 licensed → no `payment-marks-unlicensed`; matrix §8/§14 Pass; `g14-payment-marks` completed. Re-check after any kit replace.

---

## 6. Plan / matrix honesty

- Complete `g14-payment-marks` only when every light **and** dark required mark is licensed (done 2026-11-04 — see `ATTRIBUTION.md`).
- Matrix §14 / §8 logos cell: **Pass** while kits stay licensed; revert to Fail/Partial if placeholders return.
- Kiosk website chrome remains out of scope unless product expands it later.
