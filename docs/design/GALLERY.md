---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Published
promptSource: adriatic-design-remake-phase-6
---

# Gallery Lite — Index

| Field | Value |
|-------|-------|
| **Live root** | `shared/docs/design/` |
| **Brand / Color** | [REGISTRIES/COLOR.md](./REGISTRIES/COLOR.md) — **Approved frozen** (no re-arbitration) |
| **Components** | [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) |
| **Storybook** | DEFER-OPS-STORYBOOK — not required for V1 DoD |

Gallery lite maps shipped CORE_V1 routes/sections to Visual Blueprint (VB) lite IDs. Full Doc5 field packages and Storybook are **out of scope**.

---

## Authority

| Layer | Document |
|-------|----------|
| L1 Brand | [ADR-FE-BRAND-002](./ADR-FE-BRAND-002.md) + Color Registry |
| L2 Tokens | `shared/src/tokens/brand-bridge.css` |
| L3 Registries | [REGISTRIES/](./REGISTRIES/) |
| L4 Screens | This gallery index + optional VB lite entries |

`up-backend/docs/FRONTEND/*` = **pointers only** — not a second gallery root.

---

## CJ / AF flow ID register (lite)

Index-only. Prefer existing product flow IDs; do not invent Doc5-full blueprints here.

| Flow family | ID pattern | Notes |
|-------------|------------|-------|
| Customer journey | `CJ-*` | Shop / cart / checkout / account |
| Admin flow | `AF-*` | TCC / orders / products / reports / settings |
| Shared empty/loading | `VB-SHARED-*` | ScreenState exemplars |

Publish a machine index later as `GALLERY/FLOW_ID_REGISTER_LITE.json` if needed; this markdown is the Phase 6 lite SoT.

---

## VB lite status vocabulary

| Status | Meaning |
|--------|---------|
| `mapped` | Route/section linked to VB lite ID |
| `approved-lite` | Fields complete + Design Authority / PO delegate sign-off |
| `blocked-product` | Explicit product block with owner |
| `GALLERY-GAP-*` | Doc5-only / unmapped until product promotes |

**Approved-lite ≠** Design Conformance Certificate (ADV-GOV-CONFORMANCE-001 **not** in DoD).

---

## Screen ID conventions

| Prefix | Surface |
|--------|---------|
| `MS-*` | Customer / mobile screens |
| `ADM-SCR-*` | Admin screens |
| `GALLERY-GAP-*` | Temporary until product promotes |

Every shipped CORE_V1 route/section SHALL have ≤1 VB lite with `status ∈ {mapped, approved-lite}` **or** an explicit `blocked-product` / `GALLERY-GAP` row with owner.

---

## Exemplar slots (scaffold)

| Slot | Intent | Status |
|------|--------|--------|
| Customer exemplar | One shop or checkout host | Scaffold — fill per surface waves |
| Admin exemplar | One TCC or list host | Scaffold — fill per surface waves |
| Shared empty/loading | ScreenState states | Align with `CMP-0015` |

VB entry directory: [`GALLERY/`](./GALLERY/) (scaffolded). This `GALLERY.md` remains the index SoT.

---

## Non-goals

- Violet MOCKUP visual cache as SoT
- Full Pattern F / Doc5 Flow Blueprint packages
- Storybook required before Released
- Imagery program (ADV-IMG-001 NON-GOAL)
