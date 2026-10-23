# Shared Analytics Catalog Release Train (AN-001 / G-P1-17)

## Purpose

Defines the release process for publishing shared analytics catalog/type updates consumed by backend and frontends.

## Release sequence

1. Update shared analytics catalog/types in `shared/src`.
2. Build and test shared package.
3. Publish/version bump shared package.
4. Update consumers (`up-backend`, `rpapp-admin`, `rpapp-kiosk`, `rpapp-customer`) to the new shared version.
5. Run consumer lint/type-check and targeted analytics tests.

## Compatibility rules

- Runtime ingest contract is `catalogVersion: 1` only.
- Metadata schema evolution remains independent (`ANALYTICS_METADATA_SCHEMA_VERSIONS = [1, 2]`).

## Verification checklist

- Shared build succeeds.
- Shared tests for analytics contracts succeed.
- Consumer packages compile against the published artifacts.

## Related

- `shared/src/analyticsEvents.ts`
- `up-backend/src/domain/analytics/analyticsEventCatalog.ts`

## C-F02 / G1 — shared `2.3.49` + app-only (2026-10-23)

### Monorepo SSOT

| Item | Value |
|------|-------|
| `shared/package.json` version | **2.3.49** |
| Consumer pin (all five apps) | `file:../shared/pi-kiosk-shared-2.3.49.tgz` |
| Local pack artifact | `shared/pi-kiosk-shared-2.3.49.tgz` |

### Registry honesty

npm registry `latest` may still be **2.3.48** until an authenticated OTP publish of **2.3.49** lands. Do **not** invent publish success.

### App-only / Railway — no silent stale

App-only and Railway clones **MUST NOT** silently install registry **2.3.48** while monorepo SSOT is **2.3.49**.

- Contract SSOT: [`up-backend/docs/PACKAGE_C_EVIDENCE/package-c-cf02-app-only-deploy-contract.md`](../../up-backend/docs/PACKAGE_C_EVIDENCE/package-c-cf02-app-only-deploy-contract.md)
- Fail-closed install path: consumer `scripts/prebuildShared.mjs` (file: without `PI_KIOSK_SHARED_REGISTRY_TAG` fails closed; default exact **2.3.49**)
- CI/deploy gate: `scripts/gateAppOnlySharedVersion.mjs` / `npm run gate:shared-app-only` fails if installed shared **< 2.3.49**
- Separate-repo deploy guide: [`up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`](../../up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md)
- Separate-repo template pin: [`up-backend/docs/templates/package.json.separate-repo.example`](../../up-backend/docs/templates/package.json.separate-repo.example) — exact `"pi-kiosk-shared": "2.3.49"` until registry publish

### Operator publish (path a — OTP)

```powershell
cd shared
npm publish --access public --otp=<authenticator-code>
npm view pi-kiosk-shared version   # expect 2.3.49
```

Until `npm view` shows **2.3.49**, prefer monorepo file-tarball pins or sibling `shared` / shipped tarball — not silent registry stale.
