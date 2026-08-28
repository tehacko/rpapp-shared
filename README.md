# pi-kiosk-shared

Shared types, API contracts, and error classes for the Pi Kiosk system.

## Entries

- **Main entry `pi-kiosk-shared`**: Node-safe contracts, types, and API helpers for backend and frontends. Does **not** re-export React UI.
- **`pi-kiosk-shared/ui`**: React primitives and hooks (`Button`, `useSubmitCooldown`, `DatabaseUnavailable`, `CatalogImagePlaceholder`, `ProviderIcon`, …). Requires the React peer. Backends that never import `/ui` may omit React **only after** they consume a Node-safe main barrel — see [Temporary retention](#temporary-retention) and `up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`.

## Temporary retention

`up-backend` keeps production `react` / `react-dom` until cold/start paths consume a Node-safe published or overlaid main barrel. Do **not** drop those deps until that consume path is proven on the version actually installed (registry tarball from `npm view`, or monorepo overlay of sibling `../shared` **2.2.96**). Same caveat as `up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`.

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

**Honesty (SSOT):** Live monorepo source is `shared/package.json` **2.2.96** (ZBar WASM primary). Frontend consumers in this repo pin **`file:../shared/pi-kiosk-shared-2.2.96.tgz`** in both `package.json` and lockfile roots (Strategy A — see [Consumer lock tarball bootstrap](#consumer-lock-tarball-bootstrap)). `up-backend` pins **`^2.2.96`** from npm registry. Sibling overlay via `ensureDist.mjs` still runs when `../shared` exists (preferred local dev). App-only / Railway clones cannot bare-`npm ci` with monorepo `file:` pins — see **Registry-only / Railway** below.

### Consumer lock tarball bootstrap (Strategy A)

Monorepo frontend `package.json` pins:

```json
"pi-kiosk-shared": "file:../shared/pi-kiosk-shared-2.2.96.tgz"
```

The tarball is **gitignored** (`*.tgz` in repo root `.gitignore`) and is **not** in VCS. A fresh clone has no pack file until you build it:

```bash
cd shared
npm run publish:local   # build:clean + npm pack → shared/pi-kiosk-shared-<version>.tgz
```

**Strict `npm ci` in a consumer** (when you need lockfile-only install without relying on overlay alone):

1. Run `publish:local` in `shared` (step above).
2. **Stop local dev servers** on Windows if they lock `node_modules` binaries (common `npm ci` failure).
3. From a consumer (`admin-app`, `rpapp-customer`, `rpapp-pickup`, `rpapp-kiosk`):

```powershell
# Optional when husky prepare fails during install-only / ci proof runs:
$env:HUSKY='0'
npm ci
```

After repacking, refresh lock integrity if the tarball bytes changed: `npm install` in the consumer (updates `package-lock.json` `integrity` for the file tarball).

**CI without sibling `shared/` source:** pipeline must run `cd shared && npm run publish:local` before consumer `npm ci`, **or** use registry `^2.2.96` pins in `package.json`/lock for app-only clones (see Railway below).

**Local dev (preferred):** sibling `../shared` + `postinstall`/`prepare` overlay via `ensureDist.mjs` — tarball optional when the monorepo layout is complete and overlay runs on install.

**Registry-only / Railway app-only clones:** monorepo frontend `package.json` pins **`file:../shared/pi-kiosk-shared-2.2.96.tgz`**, so **bare `npm ci` fails** on an app-only checkout (no sibling tarball path). Registry install is remapped by **`prebuildShared.mjs` on `predev` / `prebuild` hooks only** — not during `postinstall`. App-only deploys must either: (a) run build via `npm run prebuild` / `npm run build` so `prebuildShared` rewrites the dependency to registry **`^2.2.96`**, or (b) commit app-only `package.json`/lock with registry pins. Confirm with `npm view pi-kiosk-shared version` at deploy time.

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

1. **DIAGNOSTIC** — `npm pack` a known Node-safe registry tarball (`COLD_VERSION` in `prove-pi-kiosk-shared-cold-overlay.mjs`, currently `2.2.82` — intentional historical diagnostic fixture, not the live pin) in a temp dir and assert COLD_BAD markers (never installs into a consumer with `--ignore-scripts`). Live monorepo source is `shared/package.json` **2.2.96**.
2. **PASS** — wipe that consumer’s `node_modules/pi-kiosk-shared`, then `npm install` with **scripts on** (no package args) so `prepare` / `postinstall` overlays during install; assert Node-safe barrel + `NODE_IMPORT_OK`.

```bash
npm run prove:cold-overlay -- up-backend
npm run prove:cold-overlay -- --all   # serial across all consumers (never parallel)
```

Do **not** use `--ignore-scripts` then hand `npm run prepare` as the heal. Evidence is overwritten as markdown under `.cursor/artifacts/pi-kiosk-shared-cold-overlay-proof*.md` (not `.log`).

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
