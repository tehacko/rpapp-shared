---
docVersion: 1.0.0
revisionDate: 2026-07-25
promptSource: adriatic-design-remake-v2.3.36-phase-0
---

# ADR-FE-BRAND-002 — Retail V1 Adriatic Single Brand Foundation

| Field | Value |
|-------|-------|
| **ADR ID** | ADR-FE-BRAND-002 |
| **Status** | **Accepted** |
| **Date** | 2026-07-25 |
| **Topic** | Single Adriatic Brand Foundation hard-cut (all surfaces) |
| **Supersedes** | ADR-FE-BRAND-001; DECISION-1 Option C (Canva Up Above + admin purple dual identity) |

## Context

MFE Option C split consumer Canva Sailor/Mint (`#00203F` / `#ADEFD1`) from admin mockup violet/indigo (`#7C3AED` / `#6366F1`). That dual identity created dual SSOTs, CI/visual debt, and a MULTI-THEME escape path.

Retail V1 Doc1 + Doc6 establish **one** Brand Foundation (Adriatic) and a Doc6 Foundation → Semantic → Component → Runtime token model. Continuing Option C is forbidden.

## Decision

1. **Single Brand Foundation only.** Adriatic is the **sole** authorized brand identity across Customer, Admin (`rpapp/admin-app`), Kiosk, Pickup, and Shared. **MULTI-THEME / dual-theme / dual-SoT brand paths are deleted** — no escape hatch, no “Adriatic or dual-theme,” no dual-brand rollback.
2. **Brand ADR ID = ADR-FE-BRAND-002 only.** Do not publish a competing live brand ADR. ADR-FE-BRAND-001 and Option C appear **only** in Historical / Superseded tables.
3. **Primary hex freeze:** `--color-brand-primary` / Doc6 `color.brand.primary` = **`#1F6F78`** only. `#1F5F78` and soft reopen are banned.
4. **Doc1 six + canvas (frozen):**

   | Role | Hex |
   |------|-----|
   | Primary (Adriatic Teal) | `#1F6F78` |
   | Deep Sea | `#174B52` |
   | Coastal Cyan | `#58A9B5` |
   | Salt Mist | `#EEF6F7` |
   | Graphite Slate | `#2A3136` |
   | Limestone | `#D8D2C8` |
   | Surface default | `#FFFFFF` |
   | Deep gradient start only | `#0F3036` |

5. **Spacing freeze (Doc6):** `space.0`…`space.10` = `{0,4,8,12,16,24,32,40,48,64,80}` px. **`space.7` = 40px** only. Mockup `28px` may alias **only** to `var(--space-7)` — never freeze `space.7` as 28.
6. **Radius / elevation (Doc6):** radius `none/sm/md/lg/xl/full` = `{0,4,8,12,16,999}` px; elevation `0`–`4` only (Doc1 Level 5 Historical via ADV-DOC1-SCALE-001).
7. **Official brand gradients only:** Primary `#174B52→#58A9B5`; Deep `#0F3036→#1F6F78`; Soft `#EEF6F7→#FFFFFF`. CI bans other brand gradients.
8. **Admin rail:** deep background = Deep Sea `#174B52`; rail active + CTA = Primary `#1F6F78`. Coastal Cyan = charts / info / accent **only**. No purple/indigo brand roles.
9. **Status colors** remain semantic and separate from brand teal (must not equal Primary for success/warning/error).
10. **Docs live root:** `shared/docs/design/`. `up-backend/docs/FRONTEND/*` and `admin-app/docs/FRONTEND/*` are **pointers** after rewrite — not a second Brand SoT.
11. **Path freeze:** live admin package path is **`rpapp/admin-app`**. Forbidden as live paths: `rpapp-admin`, `rpappp/` (typo root). Code root = `rpapp/` packages: `shared`, `admin-app`, `rpapp-customer`, `rpapp-kiosk`, `rpapp-pickup`, `up-backend`.

### AUTH-003b (path / RBAC freeze)

| Rule | Lock |
|------|------|
| Visual | Adriatic Brand Foundation wins all surface chrome |
| Product / RBAC scope | Admin cert waves 31–43 win capability inventory |
| UI | **MUST NOT** invent entitlement / capability keys in FE alone |
| Example | Tenant Customers directory requires BE key **`customers:read`**; `dev:customers:read` is **not** a substitute |

AUTH-003b does not reopen brand Option C or MULTI-THEME.

## Rejected Alternatives

| Alternative | Reason rejected |
|-------------|-----------------|
| Keep Option C dual Canva + admin purple | Dual identity; dual SSOT; PLAN-CONFLICT-01 / Q5=A |
| ADR-FE-BRAND-001 v4 as live alternate ID | Brand ADR = ADR-FE-BRAND-002 **only** |
| MULTI-THEME / dual-theme ADR escape | Hard-deleted (AP-04) |
| `space.7` = 28px foundation | Doc6 + Q4; mockup-28 alias only |
| `#1F5F78` as primary candidate | Hex freeze `#1F6F78` only |
| Tenant white-label theme engine this wave | Explicit Non-Goal |

## Business Consequences

| Area | Consequence |
|------|-------------|
| Tokens | Phase 1 rewrites `brand-bridge.css` / `theme.css` / `admin-theme.css` / admin `design-tokens.css` to Adriatic |
| CI | `gate:brand-hex` bans Option C / violet / slate-as-brand kin |
| Docs | `brand-palette.md` + DESIGN_CONTRACT point here; Color Registry Approved frozen (E10) |
| Kiosk | LIGHT_ONLY (ADV-KIOSK-LIGHT-ONLY) — Adriatic light tokens; no dark enable |

## Impacted docs

- [ADV_DEFER_REGISTER.md](./ADV_DEFER_REGISTER.md)
- [KAP6_VERSIONING_CHANGE_MANAGEMENT_STUB.md](./KAP6_VERSIONING_CHANGE_MANAGEMENT_STUB.md)
- [`up-backend/docs/FRONTEND/DESIGN_CONTRACT.md`](../../up-backend/docs/FRONTEND/DESIGN_CONTRACT.md)
- [`up-backend/docs/FRONTEND/brand-palette.md`](../../up-backend/docs/FRONTEND/brand-palette.md)
- [`admin-app/docs/FRONTEND/DESIGN_CONTRACT.md`](../../admin-app/docs/FRONTEND/DESIGN_CONTRACT.md)

## Historical / Superseded

| Artifact | Disposition |
|----------|-------------|
| ADR-FE-BRAND-001 | **Superseded** by this ADR |
| DECISION-1 Option C (Canva + purple) | **Historical only** — cite only in supersession tables |
| MULTI-THEME / dual-theme brand path | **Deleted** — must not reappear as live guidance |
| Violet/indigo admin color cache as Brand SoT | **Historical** — layout IA may remain in mockup cache; colors → Adriatic |

## Acceptance checklist (Phase 0 docs)

- [x] ADR-FE-BRAND-002 published at `shared/docs/design/ADR-FE-BRAND-002.md`
- [x] States Option C / ADR-FE-BRAND-001 superseded; MULTI-THEME deleted
- [x] Primary `#1F6F78`; `space.7` = 40 documented
- [x] Path freeze `rpapp/admin-app`; AUTH-003b row present
- [x] DESIGN_CONTRACT pointers cite this ADR
