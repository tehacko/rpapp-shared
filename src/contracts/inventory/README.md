# Inventory contracts (`shared/src/contracts/inventory`)

## Source of truth (honest v1)

| Layer | Role |
| --- | --- |
| **Backend Prisma schema** (`up-backend/prisma/schema.prisma`) | Canonical enum set for `ShrinkageReason` and Wave A inventory enums |
| **Backend DTO Zod** (when present) | Canonical request/response field contracts |
| **`enums.ts`** | Prisma-backed enum arrays **synced** by script (not full codegen) |
| **`dtos.ts`** | **Hand-written** wire DTOs — **Deferred-EXC**: no OpenAPI/Zod→TS DTO generator in v1 |
| **`slo.ts`** | Objective rollout SLO thresholds + forensic/anomaly wire types (Part 10) |

Do **not** claim this folder is a fully generated contract artifact. Enum sync + drift/SLO gates exist; DTO shapes are maintained by hand until a generator lands (plan EXC-33 / `shared-contract-pipeline`).

## Sync pipeline (v1 — enums only)

Synced by script (`shared/scripts/sync-inventory-contract-enums.mjs`) for Prisma-backed enums; wire-only unions remain explicit in `enums.ts`.

**What exists today:**

1. Backend enum/schema change updates the sync input (Prisma SoT).
2. `npm run generate:inventory-contract` syncs Prisma-backed enum arrays in `shared/src/contracts/inventory/enums.ts` (check mode in CI).
3. Pickup/admin import **only** from `pi-kiosk-shared/contracts/inventory` (or package root re-exports) for reason/status enums — do not declare parallel `type ShrinkageReason = …` in app-local modules.
4. CI drift gate (`npm run gate:inventory-contract-drift`) first enforces sync (`check:inventory-contract-sync`), then compares Prisma enum value sets with exported const arrays and fails if FE invents parallel inventory enum declarations.
5. CI SLO gate (`npm run gate:inventory-ops-slo-drift`) fails if Part 10 numeric thresholds in `slo.ts` diverge from `up-backend/.../inventoryOpsMetrics.ts` (p95≤1200ms, idempotency≤1%, hold-floor≤5% — no subjective bypass).

**What is deferred (EXC-33):** full DTO generation from backend Zod/OpenAPI into `dtos.ts`, plus CI that fails when hand-written DTO fields drift from BE schemas.

Wire-only unions not yet in Prisma (e.g. checkup concurrency/scope modes) live here as shared placeholders and are included in the FE fork ban; Prisma set-compare skips them until they exist in schema.

## Import path

```ts
import type { ShrinkageReason, InventoryIncidentStatus } from 'pi-kiosk-shared/contracts/inventory';
import {
  INVENTORY_OPS_APPLY_P95_MAX_MS,
  INVENTORY_OPS_FORENSIC_ATTRIBUTION_NOTE,
  INVENTORY_INCIDENT_SHORTAGE_UNITS_THRESHOLD_DEFAULT,
  INVENTORY_CHECKUP_SNAPSHOT_MAX_LINES_DEFAULT,
} from 'pi-kiosk-shared/contracts/inventory';
```

## Drift gates

```powershell
Set-Location shared
npm run gate:inventory-contract-drift
npm run gate:inventory-ops-slo-drift
```

From `up-backend`:

```powershell
npm run gate:inventory-contract-drift
npm run gate:inventory-ops-slo-drift
```

CI: `.github/workflows/hardening-gates.yml` → job `inventory-contract-drift` (both gates).
