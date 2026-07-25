---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Approved
registry: COLOR
promptSource: adriatic-design-remake-phase-6
---

# Color Registry — Adriatic Brand Foundation (Approved · Frozen)

| Field | Value |
|-------|-------|
| **Status** | **Approved** (E10) — **frozen**; Phase 6 must **not** re-arbitrate Brand SoT |
| **Brand ADR** | [ADR-FE-BRAND-002](../ADR-FE-BRAND-002.md) |
| **Token SSOT** | `shared/src/tokens/brand-bridge.css` |
| **Semantics** | `shared/src/tokens/theme.css` / `admin-theme.css` |

**Rule:** Color Approved == Doc1 / PART I palette. No `#1F5F78`, no Option C Sailor/Mint, no admin violet/indigo as live brand roles. MULTI-THEME deleted.

---

## Foundation — Doc1 six + canvas (frozen)

| Role | Hex | CSS var |
|------|-----|---------|
| Primary (Adriatic Teal) | `#1F6F78` | `--color-brand-primary` |
| Deep Sea | `#174B52` | `--color-brand-deep` |
| Coastal Cyan | `#58A9B5` | `--color-brand-accent` |
| Salt Mist | `#EEF6F7` | `--color-brand-soft` |
| Graphite Slate | `#2A3136` | `--color-brand-text` |
| Limestone | `#D8D2C8` | `--color-brand-limestone` |
| Surface default | `#FFFFFF` | `--color-surface-default` |
| Deep gradient start only | `#0F3036` | (gradient stop; also `--color-dark-bg`) |

---

## Semantic map (Foundation → Semantic → CSS)

| Token | CSS var | Hex / binding | Role |
|-------|---------|---------------|------|
| brand.primary | `--color-brand-primary` | `#1F6F78` | CTA / rail active |
| brand.deep | `--color-brand-deep` | `#174B52` | Admin rail deep bg |
| brand.accent | `--color-brand-accent` | `#58A9B5` | Charts / info / accent **only** |
| brand.soft | `--color-brand-soft` | `#EEF6F7` | Salt Mist |
| brand.text | `--color-brand-text` | `#2A3136` | Graphite |
| brand.limestone | `--color-brand-limestone` | `#D8D2C8` | Borders / limestone |
| surface.default | `--color-surface-default` | `#FFFFFF` | Canvas |
| surface.soft | `--color-surface-soft` | ≡ `--color-brand-soft` | Soft surface |
| action.primary | `--color-action-primary` | **alias only** → `--color-brand-primary` | No independent hex |
| text.primary | `--color-text-primary` | `#2A3136` | Body text |
| text.muted | `--color-text-muted` | `#5C656B` | Secondary text |
| border.default | `--color-border-default` | `#D8D2C8` | Default border |
| border.focus | `--color-border-focus` | `#58A9B5` | Focus border |

Status colors: see [STATUS.md](./STATUS.md) (must not equal Primary for success/warning/error).

---

## Neutrals (not brand)

| Token | CSS | Hex | Rule |
|-------|-----|-----|------|
| neutral.950 | `--color-neutral-950` | `#0F172A` | Raw slate hex in feature CSS = **CI fail** |
| neutral.100 | `--color-neutral-100` | `#F1F5F9` | Use token only |
| neutral.200 | `--color-neutral-200` | `#E2E8F0` | Use token only |

---

## Focus

| Token | Value |
|-------|-------|
| `--color-border-focus` | `#58A9B5` |
| `--focus-ring` | `0 0 0 3px rgba(88,169,181,0.35)` |

---

## Official brand gradients only

| Token | CSS |
|-------|-----|
| `--gradient-brand-primary` | `linear-gradient(135deg, #174B52 0%, #58A9B5 100%)` |
| `--gradient-brand-deep` | `linear-gradient(135deg, #0F3036 0%, #1F6F78 100%)` |
| `--gradient-brand-soft` | `linear-gradient(180deg, #EEF6F7 0%, #FFFFFF 100%)` |

CI bans non-official brand gradients.

---

## Admin rail / dark mini (chrome)

| Token | Hex |
|-------|-----|
| `--color-dark-bg` | `#0F3036` |
| `--color-dark-surface` | `#174B52` |
| `--color-dark-text` | `#EEF6F7` |
| `--color-dark-border` | `#2A3136` |
| `--color-dark-rail` | `#174B52` |
| `--color-dark-rail-active` | `#1F6F78` |

Rail deep bg = Deep Sea; rail active + CTA = Primary. Kiosk = LIGHT_ONLY.

---

## Banned (CI / Historical)

`#00203F` · `#ADEFD1` · `#7C3AED` / `#6366F1` / `#1E1B4B` · non-Doc1 primary drift · raw slate as brand · non-official gradients.

Gate: `rpapp/scripts/gate-brand-hex-ban.mjs` · `gate:brand-hex` in `shared/package.json`.

---

## Related

- [STATUS.md](./STATUS.md) · [THEME.md](./THEME.md) · [ADR-FE-BRAND-002](../ADR-FE-BRAND-002.md)
- Pointers: `up-backend/docs/FRONTEND/DESIGN_CONTRACT.md`, `up-backend/docs/FRONTEND/brand-palette.md`
