# Shared Analytics Catalog Release Train (AN-001 / G-P1-17)

## Purpose

Defines the release process for publishing shared analytics catalog/type updates consumed by backend and frontends.

## Release sequence

1. Update shared analytics catalog/types in `shared/src`.
2. Build and test shared package.
3. Publish/version bump shared package (`npm publish --access public --otp=…`).
4. Update consumers (`up-backend`, `admin-app`, `rpapp-kiosk`, `rpapp-customer`, `rpapp-pickup`) to `^<newVersion>` and refresh locks from the **npm registry** (no monorepo `file:*.tgz` pins).
5. Run consumer lint/type-check and targeted analytics tests.
6. Align `BAKED_SSOT_FLOOR` / `DEFAULT_REGISTRY_TARGET` in `gateAppOnlySharedVersion.mjs` / `prebuildShared.mjs` with the new floor.

## Compatibility rules

- Runtime ingest contract is `catalogVersion: 1` only.
- Metadata schema evolution remains independent (`ANALYTICS_METADATA_SCHEMA_VERSIONS = [1, 2]`).

## Verification checklist

- Shared build succeeds.
- Shared tests for analytics contracts succeed.
- Consumer packages compile against the published artifacts.
- `npm view pi-kiosk-shared version` matches `shared/package.json`.
- `npm run gate:shared-app-only` green on consumers.

## Related

- `shared/src/analyticsEvents.ts`
- `up-backend/src/domain/analytics/analyticsEventCatalog.ts`

## C-F02 / G1 — shared `2.3.50` + registry (2026-10-24)

### Monorepo / registry SSOT

| Item | Value |
|------|-------|
| `shared/package.json` version | **2.3.50** |
| npm registry | **2.3.50** |
| Consumer pin (all five apps) | `"pi-kiosk-shared": "^2.3.50"` |
| File tarball pins | **None** (removed) |

### App-only / Railway

- Contract: `up-backend/docs/PACKAGE_C_EVIDENCE/package-c-cf02-app-only-deploy-contract.md`
- Gate: `npm run gate:shared-app-only` fails if installed **&lt; 2.3.50**
- Deploy guide: `up-backend/docs/DEPLOYMENT/DEPLOY_SEPARATE_REPOS.md`

### Operator publish

```powershell
cd shared
npm publish --access public --otp=<authenticator-code>
npm view pi-kiosk-shared version
```