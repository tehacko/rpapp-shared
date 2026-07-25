---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Approved
registry: MOTION
---

# Motion Guidelines Registry

| Field | Value |
|-------|-------|
| **Status** | Approved |
| **Token owner** | `shared/src/tokens/brand-bridge.css` |

Copies frozen easings + duration scale from Foundation (§A). Durations **>500 ms** banned unless ADV.

---

## Easing

| Token | Value |
|-------|-------|
| `--ease-standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` |
| `--ease-emphasized` | `cubic-bezier(0.2, 0.0, 0, 1)` |
| `--ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` |

---

## Duration

| Token | ms |
|-------|-----|
| `--duration-100` | 100 |
| `--duration-200` | 200 |
| `--duration-300` | 300 |
| `--duration-500` | 500 |

---

## Usage notes

- Prefer `--ease-standard` for most transitions; `--ease-emphasized` for enter/focus; `--ease-exit` for dismiss.
- Touch targets remain ≥44 px (kiosk prefer 48) — motion must not reduce hit area.
- Kiosk LIGHT_ONLY — no dark-theme motion variants.
