# Barcode scanner — human QA matrix (subset)

Supplemental to CI golden-PNG and unit suites. **Do not** mark scanner work done from mocks or `zbar.wasm` 200 alone.

**Fixture EAN:** `8593807360153` (seed product / `shared/src/__tests__/fixtures/ean-8593807360153.png`).

Full 16-row matrix lives in the bulletproof camera scanner plan; **Exit DoD human subset** = rows **7, 1, 4, 14** below.

## Prerequisites

| Service | URL |
|---------|-----|
| API | `http://localhost:3015/health` |
| Admin | `http://localhost:3001/dev/login` → `superdev` / `test1234` |
| Customer | `http://localhost:3003/railway-cafe/sign-in` → `supercustomer` / `test1234` |

From `rpappp/up-backend`: `npm run dev`. Start only the surfaces under test.

---

## Row 7 — Windows PC Chrome admin (Wave B exit)

| Field | Value |
|-------|-------|
| Device | Windows PC |
| Browser | Chrome |
| Surface | Admin product edit → **Čárový kód** / barcode field |
| Code | EAN `8593807360153` on screen or printed |
| Pass | Barcode field filled via **live camera** or **preview snap** within **≤5s** |

### Steps

1. Log in at `http://localhost:3001/dev/login` (`superdev` / `test1234`).
2. Open tenant admin → Products → edit a product with variant barcode section.
3. Enable camera scanner on the barcode field.
4. Present fixture `8593807360153` to the camera **or** use preview snap on a clear on-screen barcode.
5. **Expected:** field shows `8593807360153` within 5 seconds; no `degradedMode` warning unless ZBar boot failed (then snap should still work).
6. **Blockers:** `zbar.wasm` not 200 → fix deploy/CSP before retest.

---

## Row 1 — Android phone Chrome admin

| Field | Value |
|-------|-------|
| Device | Android phone |
| Browser | Chrome |
| Surface | Admin product edit (same as row 7) |
| Code | EAN fixture `8593807360153` |
| Pass | Decode **≤3s** live or snap |

### Steps

1. On device, open admin URL (LAN or deployed origin); sign in.
2. Product edit → barcode scanner on.
3. Scan fixture label or screen barcode.
4. **Expected:** `8593807360153` in barcode field ≤3s.
5. **Blockers:** camera permission, mixed content, or WASM 404 on that origin.

---

## Row 4 — iPhone Safari customer `/scan`

| Field | Value |
|-------|-------|
| Device | iPhone |
| Browser | Safari |
| Surface | Customer `/{tenant}/scan` (e.g. `railway-cafe/scan`) |
| Codes | EAN fixture + any seeded QR product |
| Pass | **≤3s** per code type |

### Steps

1. Sign in at `http://localhost:3003/railway-cafe/sign-in` (or production tenant).
2. Navigate to shop scan route.
3. Scan EAN `8593807360153` → product lookup or cart flow starts.
4. Scan a QR product/token if available in seed.
5. **Expected:** each scan resolves within 3s or offers snap fallback.
6. **Blockers:** iOS camera permission, PWA shell stale — hard refresh.

---

## Row 14 — Camera deny recovery (all surfaces)

| Field | Value |
|-------|-------|
| Device | Any |
| Browser | Any |
| Surface | Admin product barcode, customer `/scan`, pickup scan/assign |
| Codes | n/a |
| Pass | Recovery UI + manual entry; **preview and snap hidden** on deny/error; **recovery CTAs only** |

### Steps

1. Deny camera permission (or revoke in browser settings).
2. Open scanner on each surface under test.
3. **Expected:**
   - Clear permission-denied or error message with recovery guidance (manual entry, Allow camera / Try again, Stop).
   - Live camera preview **not** shown while denied or errored (video sr-only / hidden).
   - Admin/customer: preview snap and file-upload snap **hidden** on deny/error.
   - Pickup scan/assign: **preview snap only** (no file upload); preview snap **hidden** on deny/error.
   - Only recovery CTAs visible (retry/allow, stop) — no snap buttons until camera is running again.
4. Re-grant permission → preview and snap return; scan works.
5. **Blockers:** if preview or snap visible while denied/errored, file bug against surface component.

---

## Quick diagnostics

| Symptom | Check |
|---------|-------|
| Scanner never starts | Network → `zbar.wasm` status 200; CSP `wasm-unsafe-eval` |
| Slow / yellow degraded banner | `degradedMode` — ZBar failed; hard refresh |
| Decode works in snap only | Lighting/distance; try torch (customer) or preview snap |
| Same code twice in a row | After success, hook **re-arms after 600ms** (`SCANNER_POST_DECODE_COOLDOWN_MS`); duplicate payload within **800ms** dedupe window is suppressed |
| Works locally, fails deploy | Per-origin WASM 200 + no SW precache of `zbar.wasm` |

## Related

- Runbook: [shared/README.md](../README.md#barcode-camera-scanner-runbook)
- Backend barcode program: [up-backend/docs/BARCODE/BARCODE_IMPLEMENTATION.md](../../up-backend/docs/BARCODE/BARCODE_IMPLEMENTATION.md)
- Manual UI skill: [rpapp-manual-ui-testing](../../.cursor/skills/rpapp-manual-ui-testing/SKILL.md)

## Optional ROI crop (P2 — not v2.2)

Center **25% margin ROI** before live decode is **not implemented**. PC admin shows text scan hints only; use **preview snap** for difficult webcams. Tracking: optional future `decodeStillImage` / hook enhancement — not required for v2.2 Exit DoD.
