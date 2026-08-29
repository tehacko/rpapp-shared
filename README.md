# pi-kiosk-shared

Shared types, API contracts, and error classes for the Pi Kiosk system.

## Entries

- **Main entry `pi-kiosk-shared`**: Node-safe contracts, types, and API helpers for backend and frontends. Does **not** re-export React UI.
- **`pi-kiosk-shared/ui`**: React primitives and hooks (`Button`, `useSubmitCooldown`, `DatabaseUnavailable`, `CatalogImagePlaceholder`, `ProviderIcon`, …). Requires the React peer. Backends that never import `/ui` may omit React **only after** they consume a Node-safe main barrel — see [Temporary retention](#temporary-retention) and `up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`.

## Temporary retention

`up-backend` keeps production `react` / `react-dom` until cold/start paths consume a Node-safe published or overlaid main barrel. Do **not** drop those deps until that consume path is proven on the version actually installed (registry tarball from `npm view`, or monorepo overlay of sibling `../shared` **2.3.0**). Same caveat as `up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`.

## Installation

```bash
npm install pi-kiosk-shared
```

## Usage

### Types

```tsx
import type { Product, ApiResponse, KioskStatus, TransactionStatus } from 'pi-kiosk-shared';

const product: Product = {
  id: 1,
  name: 'Coffee',
  price: 25.0,
  description: 'Fresh coffee',
  image: '☕',
  clickedOn: 0,
  numberOfPurchases: 0,
};
```

### API Client

```tsx
import { APIClient, createAPIClient, API_ENDPOINTS } from 'pi-kiosk-shared';

const apiClient = createAPIClient('http://localhost:3015');
const products = await apiClient.get(API_ENDPOINTS.PRODUCTS);
```

### Error Classes

```tsx
import { NetworkError, ValidationError, AppError, getErrorMessage } from 'pi-kiosk-shared';

try {
  // ... some operation
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', getErrorMessage(error));
  }
}
```

### React UI (`pi-kiosk-shared/ui`)

```tsx
import { Button, useSubmitCooldown } from 'pi-kiosk-shared/ui';
```

Frontends import React modules from `/ui`. The **target** main barrel (local overlay / published Node-safe releases) is Node-safe. Until that barrel is what cold/start paths consume, see [Temporary retention](#temporary-retention).

## What's in this package vs apps

- **`pi-kiosk-shared`**: contracts, types, API helpers — shared by backend and frontends.
- **`pi-kiosk-shared/ui`**: cross-app source for React primitives and hooks.
- **App-local clones**: some apps may still keep local copies of primitives under `src/shared/ui/` or `src/shared/components/`. Prefer `/ui` for new shared UI; migrate leftovers when touching those files.

## Local monorepo overlay

**Honesty (SSOT):** Live monorepo source is `shared/package.json` **2.3.0** (ZBar WASM primary + still-image snap). Camera consumers (`admin-app`, `rpapp-customer`, `rpapp-pickup`) pin **`^2.3.0`**; `rpapp-kiosk` pins **`^2.3.0`** for contract sync (HID wedge only — no camera hook). `up-backend` may lag registry until next publish — overlay via `ensureDist.mjs` when sibling `../shared` exists.

### Consumer lock tarball bootstrap (Strategy A — optional)

When frontends use a **file tarball** pin (instead of registry `^2.3.0`):

```json
"pi-kiosk-shared": "file:../shared/pi-kiosk-shared-2.3.0.tgz"
```

The tarball is **gitignored** (`*.tgz` in repo root `.gitignore`) and is **not** in VCS. A fresh clone has no pack file until you build it:

```bash
cd shared
npm run publish:local   # build:clean + npm pack → shared/pi-kiosk-shared-<version>.tgz
```

**Strict `npm ci` in a consumer** (file-pin layout; lockfile-only install without relying on overlay alone):

1. From repo root, run bootstrap SSOT (repack tarball + ephemeral lock integrity patch):
   `node scripts/workspace/bootstrap-pi-kiosk-shared-tarball.mjs`
   — wraps `shared` `publish:local` and patches consumer `package-lock.json` hashes in-place. **Do not commit** patched integrity fields.
2. **Stop local dev servers** on Windows if they lock `node_modules` binaries (common `npm ci` failure).
3. From a consumer (`admin-app`, `rpapp-customer`, `rpapp-pickup`, `rpapp-kiosk`):

```powershell
# Optional when husky prepare fails during install-only / ci proof runs:
$env:HUSKY='0'
npm ci
```

**Version bump — committed lock refresh (manual):** when `shared/package.json` version changes, run in **every** consumer and commit the result:
`$env:HUSKY='0'; npm install pi-kiosk-shared@file:../shared/pi-kiosk-shared-<version>.tgz` (updates committed `package-lock.json` pins and `integrity`).

**Ephemeral lock patch (bootstrap SSOT):** `node scripts/workspace/bootstrap-pi-kiosk-shared-tarball.mjs` repacks the tarball and **patches consumer `package-lock.json` integrity in-place** so the next `npm ci` succeeds. Patches are local-only — **do not commit** bootstrap-dirtied hashes. Run bootstrap **before** local consumer `npm ci` when using file-pin layout. Bootstrap does **not** replace version-bump lock refresh; on bump still run the manual install above in each consumer and commit new pins.

**CI without sibling `shared/` source (file-pin layout):** every consumer workflow job runs [`.github/actions/bootstrap-pi-kiosk-shared-tarball`](../.github/actions/bootstrap-pi-kiosk-shared-tarball/action.yml) (SSOT: `node scripts/workspace/bootstrap-pi-kiosk-shared-tarball.mjs` → `shared npm ci && npm run publish:local` + lock integrity patch) before consumer `npm ci`. Root `cert:install:all` and `scripts/workspace/bootstrap.mjs` call the same script. See `hardening-gates.yml`, `retail-v1-cert.yml`, `rpapp-pickup-e2e.yml`.

**Local dev (preferred):** sibling `../shared` + `postinstall`/`prepare` overlay via `ensureDist.mjs` — tarball optional when the monorepo layout is complete and overlay runs on install.

**Registry-only / Railway app-only clones:** with **registry `^2.3.0` pins** (current monorepo `package.json`/locks), bare **`npm ci` succeeds** on app-only checkouts — no sibling tarball required. If you use **monorepo `file:` tarball pins** instead, bare `npm ci` **fails** on app-only clones (missing pack file). **`prebuildShared.mjs` runs on `predev` / `prebuild` only** — npm has already finished `install`/`ci` by then, and the script does **not** rewrite `package.json` or `package-lock.json` (it side-installs `pi-kiosk-shared` into `node_modules` with `--no-save`, which does **not** make a later strict `npm ci` succeed on `file:` pins). App-only options for `file:` pins: **(a)** run `cd shared && npm run publish:local` and ensure `../shared/pi-kiosk-shared-<version>.tgz` exists on disk before consumer `npm ci` (see [Consumer lock tarball bootstrap](#consumer-lock-tarball-bootstrap)), or **(b)** commit app-only `package.json`/lock with registry pins (same as current monorepo). Confirm with `npm view pi-kiosk-shared version` at deploy time.

**Documented cold path (monorepo):** `npm ci` / `npm install` in each app runs lifecycle hooks → `scripts/overlaySharedIfPresent.mjs` → `shared/scripts/ensureDist.mjs` when sibling `../shared` exists:

| Package | Install hook (cold path) |
|---------|----------------|
| `up-backend` | `prepare` → `overlaySharedIfPresent.mjs` (+ husky) → `ensureDist.mjs` |
| `admin-app`, `rpapp-kiosk`, `rpapp-customer`, `rpapp-pickup` | `postinstall` → `overlaySharedIfPresent.mjs` (+ patches) → `ensureDist.mjs` |

That script no-ops (exit 0) only when the sibling `../shared` **directory is absent** (true app-only / Railway clones). If `../shared` exists as a directory but is incomplete (missing `package.json` and/or `scripts/ensureDist.mjs`), the overlay fails exit 1 with recovery — empty/stub shared trees are not silent. When the layout is complete it runs `shared/scripts/ensureDist.mjs` (with `ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1` so single-package install does not fail siblings), which compiles this package and copies `package.json` + `dist` into each consumer `node_modules/pi-kiosk-shared` so Node/tsx/tsc load the Node-safe barrel and remapped `/ui` exports.

**Policy — half-tree / one-app install:** any frontend `prebuild` / `predev` path that invokes `ensureDist.mjs` (admin/customer/pickup `prebuildShared.mjs`, kiosk `ensure-shared-consume.mjs`) must also pass `ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1`, matching `overlaySharedIfPresent` / postinstall. Bare `ensureDist` hard-fails when sibling consumers lack `node_modules`; with the allow flag, one-app monorepo install stays green through prebuild.

**Secondary (not the cold path):** `up-backend` `predev` / `prebuild` / `prestart` (`ensure-shared` → same `overlaySharedIfPresent.mjs`); frontends `predev` / `prebuild` (`prebuildShared.mjs`, kiosk `ensure-shared-consume.mjs`) also refresh the overlay before dev/build.

```bash
# Documented cold path — from any consumer (runs prepare/postinstall overlay)
npm ci
# or: npm install

# Optional manual / shared-root rebuild + overlay all five consumers
cd ../shared   # from a consumer, or start in shared/
node scripts/ensureDist.mjs

# Prove the compiled main barrel does not import React — checks shared/dist
# AND each consumer's node_modules/pi-kiosk-shared/dist/index.js (up-backend,
# admin-app, rpapp-kiosk, rpapp-customer, rpapp-pickup). Also smokes
# import('pi-kiosk-shared') from up-backend cwd. Missing consumer install
# fails by default; opt-out: ENSURE_DIST_SKIP_MISSING_CONSUMERS=1,
# GATE_ALLOW_MISSING_CONSUMERS=1, or ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1.
npm run gate:main-barrel-node-safe
```

### Cold overlay proof

From `shared/`, prove the documented cold path:

1. **DIAGNOSTIC** — `npm pack` a known Node-safe registry tarball (`COLD_VERSION` in `prove-pi-kiosk-shared-cold-overlay.mjs`, currently `2.2.82` — intentional historical diagnostic fixture, not the live pin) in a temp dir and assert COLD_BAD markers (never installs into a consumer with `--ignore-scripts`). Live monorepo source is `shared/package.json` **2.3.0**.
2. **PASS** — wipe that consumer’s `node_modules/pi-kiosk-shared`, then `npm install` with **scripts on** (no package args) so `prepare` / `postinstall` overlays during install; assert Node-safe barrel + `NODE_IMPORT_OK`.

```bash
npm run prove:cold-overlay -- up-backend
npm run prove:cold-overlay -- --all   # serial across all consumers (never parallel)
```

Do **not** use `--ignore-scripts` then hand `npm run prepare` as the heal. Evidence is overwritten as markdown under `.cursor/artifacts/pi-kiosk-shared-cold-overlay-proof*.md` (not `.log`).

## Barcode camera scanner (runbook)

Cross-app live camera + still-image decode lives in `pi-kiosk-shared/barcode-scanner` (`useBarcodeScanner`, snap APIs, ZBar WASM boot). Backend barcode contracts and admin/pickup routes: [up-backend/docs/BARCODE/BARCODE_IMPLEMENTATION.md](../up-backend/docs/BARCODE/BARCODE_IMPLEMENTATION.md).

Human QA subset (fixture EAN `8593807360153`): [docs/SCANNER_QA.md](./docs/SCANNER_QA.md). Manual UI skill: [rpapp-manual-ui-testing](../../.cursor/skills/rpapp-manual-ui-testing/SKILL.md).

### Boot — `initZbarWasm` first import

Each camera surface must configure ZBar WASM **before** any `useBarcodeScanner` session:

| App | Boot module | Entry |
|-----|-------------|-------|
| `admin-app` | `src/initZbarWasm.ts` | first import in `src/main.tsx` |
| `rpapp-customer` | `src/initZbarWasm.ts` | first import in `src/main.tsx` |
| `rpapp-pickup` | `src/initZbarWasm.ts` | first import in `src/main.tsx` |

Pattern (all three apps):

```ts
import './initZbarWasm'; // must be first import in main.tsx
```

`initZbarWasm.ts` calls `setZbarWasmUrl(wasmUrl)` with Vite-resolved `@undecaf/zbar-wasm/dist/zbar.wasm?url` so the binary is same-origin and CSP-safe. **Do not** lazy-load this module on first scan — boot failure surfaces as `degradedMode` or `zbarBootstrapFailed` copy.

### Decode engines

| Engine | Role |
|--------|------|
| **`zbar-wasm`** | Primary when boot succeeds — ZBar C/C++ WASM (`@undecaf/zbar-wasm`); retail EAN/UPC/Code128 + QR per `formatProfile`. |
| **`zxing`** | Parallel assist (`@zxing/browser`) starting on **frame 0** while ZBar runs; also primary live path in **degraded** boot. Distance optical zoom still waits 1.5s (`SCANNER_DISTANCE_ZOOM_DELAY_MS`). |
| **`native-detector`** | Chromium `BarcodeDetector` parallel assist only — never the sole engine. |

Engine type: `ScannerEngine` in `selectEngine.ts`. Selection is internal to `useBarcodeScanner`; surfaces read `engine`, `zxingAssistActive`, and **`degradedMode`** — not engine alone.

### `degradedMode` contract (G-P4)

`UseBarcodeScannerReturn.degradedMode: boolean`:

| Value | Meaning |
|-------|---------|
| `false` | ZBar WASM URL configured and ZBar loop started — full mode. `@zxing` / native may still run as **assist** (`zxingAssistActive === true` does **not** imply degraded). |
| `true` | ZBar URL unset or ZBar boot failed — live decode continues on @zxing (+ native assist when available). |

**UI rule:** show `runningDegraded` i18n when **`degradedMode === true`**. Do **not** infer degraded from `engine === 'zxing'` or `zxingAssistActive` alone.

### Still-image snap APIs

Exported from `pi-kiosk-shared/barcode-scanner` (`decodeStillImage.ts`):

| API | Use |
|-----|-----|
| `decodeBarcodeFromImageFile(file, formatProfile?)` | File upload / gallery pick — preprocessing (grayscale, Otsu, optional 2× upscale) then ZBar → @zxing → native. |
| `decodeBarcodeFromVideoFrame(video, formatProfile?, canvas?)` | Preview-frame grab (admin/customer/pickup snap CTAs) — same engine cascade on a single frame. |

Both return `StillDecodeResult | null` (`payload`, `engine`). Payloads pass through `prepareScanPayloadForEmit` (trim, control chars, GTIN check digit, UPC-A↔EAN-13). Golden CI fixture: `shared/src/__tests__/fixtures/ean-8593807360153.png`.

### WASM network-only precache policy (v1)

**`zbar.wasm` is network-only** — not precached by the service worker.

- Vite PWA `globPatterns` in admin, customer, and pickup intentionally omit `*.wasm` (e.g. `**/*.{js,css,html,ico,png,svg,woff2}` only).
- WASM is fetched on the **first scan session** after `initZbarWasm` sets the URL — not at install time.
- **Deploy acceptance:** DevTools → Application → Cache Storage → no precached `zbar.wasm`; Network tab → HTTP **200** on first camera open per origin.
- Single WASM source: `@undecaf/zbar-wasm` via `setZbarWasmUrl` — no second WASM from a polyfill package.

### Ops failure recovery

| Symptom | Likely cause | Recovery |
|---------|--------------|----------|
| `cameraZbarBootstrapFailed` / `scannerZbarBootstrapFailed` | WASM 404, CSP block, or corrupt cache | Hard refresh (Ctrl+F5); Network tab → `zbar.wasm` **200**; clear site data if SW served stale shell. |
| `degradedMode: true`, slow decode | ZBar boot failed | Same as above; user can still decode via @zxing or **preview/file snap**. |
| Camera permission denied | `NotAllowedError` | Manual entry; preview hidden on deny (row 14 matrix). |
| Blank preview, no error | Insecure context (`http://` non-localhost) | Serve over HTTPS or localhost. |

### Deploy checklist (camera apps)

Applies to **admin-app**, **rpapp-customer**, **rpapp-pickup** (kiosk HID wedge unchanged).

1. Bump `shared/package.json`; `npm run build` in `shared`; publish per project workflow.
2. Bump `pi-kiosk-shared` in admin, customer, pickup; redeploy all three on Railway.
3. Verify built bundle exports `decodeBarcodeFromImageFile` / `decodeBarcodeFromVideoFrame` (grep `dist` or smoke import).
4. **CSP per origin** — meta `Content-Security-Policy` must allow WASM compile:
   - `script-src` includes `'wasm-unsafe-eval'` (all three apps).
   - Admin also keeps `'unsafe-inline'` for bootstrap scripts; production `connect-src` rewritten from `VITE_API_URL` / `VITE_WS_URL`.
   - Deploy HTTP headers may tighten further; WASM MIME must be `application/wasm`.
5. **`zbar.wasm` HTTP 200** on each deployed origin (admin, customer, pickup) — open scanner once, confirm in Network.
6. **No precached `zbar.wasm`** in Cache Storage (network-only policy above).

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## License

MIT
