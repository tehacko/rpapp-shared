---
docVersion: 1.0.0
revisionDate: 2026-07-25
status: Approved
registry: ICON
---

# Icon Library Spec

| Field | Value |
|-------|-------|
| **Status** | Approved |
| **Component** | `shared/src/ui/Icon` (`CMP-0012`) |
| **Library** | Lucide (wrapper only) |

---

## Stroke

**Stroke width = Lucide default `2`.** Do not invent alternate stroke scales for product icons.

---

## Sizes (allowed)

| px | Use |
|----|-----|
| 16 | Dense UI / inline |
| 20 | Default compact |
| 24 | Default |
| 32 | Emphasized |
| 48 | Hero / empty state |
| 64 | Large empty / marketing chrome |

**Forbidden:** mid-sizes outside this set; own color/shadow/gradient; geometric deform.

---

## Fill

Filled variants via **Lucide fill props only** — no hand-rolled fill CSS for brand icons.

---

## Ownership

| Kind | Rule |
|------|------|
| Product UI icons | Shared `Icon` / Lucide map only |
| Payment provider marks | `ProviderIcon` = payment-provider **only** |
| Feature imports of `lucide-react` | Zero direct feature-import Done (admin+customer P2; kiosk+pickup P5) |

Migration: ADV-ICON-MAP-MIGRATE-001 if deadline missed (default end = Phase 5 merge).
