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

- Catalog changes must be backwards-compatible unless coordinated version gate is in place.
- Ingest/backend dual-version support must be confirmed before frontend emitters rely on new schema-only fields.

## Verification checklist

- Shared build succeeds.
- Shared tests for analytics contracts succeed.
- Consumer packages compile against the published artifacts.

## Related

- `shared/src/analyticsEvents.ts`
- `shared/src/analyticsCatalogVersion.ts`
- `up-backend/src/domain/analytics/analyticsEventCatalog.ts`
