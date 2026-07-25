---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Approved
registry: SPACING
---

# Spacing Registry

| Field | Value |
|-------|-------|
| **Status** | Approved (Doc6 / Q4 freeze) |
| **Token owner** | `shared/src/tokens/brand-bridge.css` |
| **Brand ADR** | [ADR-FE-BRAND-002](../ADR-FE-BRAND-002.md) |

Doc1 dual spacing numerics are **Historical** (ADV-DOC1-SCALE-001). Live scale = Doc6 below. **`space.7` = 40px only** — never freeze as 28.

---

## Scale

| Token | CSS | px |
|-------|-----|----|
| space.0 | `--space-0` | 0 |
| space.1 | `--space-1` | 4 |
| space.2 | `--space-2` | 8 |
| space.3 | `--space-3` | 12 |
| space.4 | `--space-4` | 16 |
| space.5 | `--space-5` | 24 |
| space.6 | `--space-6` | 32 |
| space.7 | `--space-7` | **40** |
| space.8 | `--space-8` | 48 |
| space.9 | `--space-9` | 64 |
| space.10 | `--space-10` | 80 |

---

## Aliases / deletes

| Name | Rule |
|------|------|
| `--space-mockup-28` | `var(--space-7)` only — mockup 28px may alias; never redefine `space.7` as 28 |
| `--spacing-3xl` | **DELETE** — rewrite refs to `var(--space-7)` |

---

## Opacity Foundation (adjacent scale)

Index order frozen: `0, 0.04, 0.08, 0.12, 0.16, 0.24, 0.40, 0.64, 0.80, 1` → `--opacity-0` … `--opacity-9`.
