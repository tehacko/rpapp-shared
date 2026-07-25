---
docVersion: 1.0.0
revisionDate: 2026-07-25
promptSource: adriatic-design-remake-v2.3.36-phase-0
---

# Kap6 stub — Versioning & Change Management (Doc6)

| Field | Value |
|-------|-------|
| Status | **Phase 0 process stub** |
| Doc6 chapter | KAPITOLA 6/12 — Versioning & Change Management *(body missing from DESIGN extract; closing summary lists this title)* |
| Full artefact | Deferred to Phase 6 (`VERSIONING.md` under `shared/docs/design/`) |
| Brand ADR | [ADR-FE-BRAND-002](./ADR-FE-BRAND-002.md) |

## Purpose

Placeholder so Phase 0 governance can cite Doc6 Kap6 **process** without inventing a full Versioning & Change Management chapter. Agents **MUST NOT** treat Doc1 dual spacing/radius/elevation numerics as live SoT (see ADV-DOC1-SCALE-001).

## Binding taxonomy (Doc6 — live)

| Layer | Role |
|-------|------|
| Foundation | Brand hexes, space.0–10, radius, elevation 0–4, opacity, border width |
| Semantic | Background / surface / text / action / border / status aliases |
| Component | CMP tokens (Phase 2+) |
| Runtime | Theme / light-dark structure (admin `.dark` Partial; kiosk LIGHT_ONLY) |

**Frozen freezes (Phase 0):** Primary `#1F6F78`; `space.7` = **40px**; Single Brand Foundation only (no MULTI-THEME).

## Process stub (until Phase 6 VERSIONING doc)

1. Brand / token SoT changes require ADR-FE-BRAND-002 amend or successor ADR — **not** Option C reopen.
2. Accepted deviations / deferrals register in [ADV_DEFER_REGISTER.md](./ADV_DEFER_REGISTER.md).
3. Registries under `shared/docs/design/REGISTRIES/` land in Phase 6; Color Approved = frozen palette (E10) — Phase 6 **MUST NOT** reopen Brand SoT.
4. `up-backend/docs/FRONTEND/*` remains pointer-only after DESIGN_CONTRACT rewrite.

## Non-goals (this stub)

- Full DesignOps KPI dashboard
- Full Governance Certificate / ≥95% (waived: ADV-GOV-CONFORMANCE-001)
- Inventing missing Doc6 Kap6 normative statements from memory
