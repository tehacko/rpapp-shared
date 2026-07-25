---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Approved
registry: TYPE
---

# Type Registry

| Field | Value |
|-------|-------|
| **Status** | Approved (ADV-TYPE-SCALE-001) |
| **Family owner** | `shared/src/tokens/brand-bridge.css` + admin `design-tokens.css` → `--font-family-primary` |
| **Consumers** | `theme.css`, app STYLING docs, Typography atom (`CMP-0022`) |

**Primary family:** `--font-family-primary` — Tailwind v4 preflight-equivalent system UI stack. Admin defines it in `design-tokens.css` (mirrored on `brand-bridge.css`). Pickup/kiosk may override with Inter/Poppins + webfonts. Display XL forbidden.

**Monospace:** `--font-family-mono` — Tailwind v4 `--font-mono` equivalent.

---

## Size / line scale (frozen)

| Role | Size/line px | CSS var |
|------|--------------|---------|
| Display | 40/48 | `--font-size-display` |
| H1 | 32/40 | `--font-size-h1` |
| H2 | 28/36 | `--font-size-h2` |
| H3 | 24/32 | `--font-size-h3` |
| H4 | 20/28 | `--font-size-h4` |
| Body Large | 18/28 | `--font-size-body-lg` |
| Body | 16/24 | `--font-size-body` |
| Body Small | 14/20 | `--font-size-body-sm` |
| Caption | 12/16 | `--font-size-caption` |
| Label | 14/20 | `--font-size-label` |
| Button | 14/20 | `--font-size-button` |
| Overline | 12/16 | `--font-size-overline` |
| Mono | 13/20 | `--font-size-mono` |

**Line-height:** No separate `--line-height-*` tokens. Typography atom applies **unitless multipliers** from Size/line (e.g. Body 16/24 ? `line-height: 1.5`).

---

## Font-weight roles (Typography only ? no ad-hoc weights)

| Role | Weight |
|------|--------|
| Display, H1?H3 | **700** |
| H4 | **600** |
| Body Large | **400** (same as Body) |
| Body, Body Small, Caption, Mono | **400** |
| Label, Button, Overline | **600** |

Optional CSS (Typography consumers only): `--font-weight-regular: 400`, `--font-weight-semibold: 600`, `--font-weight-bold: 700`.

---

## Legacy ? new map

| Legacy | Action |
|--------|--------|
| `--font-size-xs` | DELETE ? `--font-size-caption` |
| `--font-size-sm` | alias ? `--font-size-caption` |
| `--font-size-base` | alias ? `--font-size-body-sm` |
| `--font-size-md` | DELETE ? `--font-size-body-sm` |
| `--font-size-lg` | alias ? `--font-size-body` |
| `--font-size-xl` | alias ? `--font-size-body-lg` |
| `--font-size-2xl` | alias ? `--font-size-h4` |
| `--font-size-3xl` | alias ? `--font-size-h3` |
| `--font-size-4xl` | alias ? `--font-size-h2` |
