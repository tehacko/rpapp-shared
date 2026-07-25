---
docVersion: 1.1.0
revisionDate: 2026-07-25
status: Published
promptSource: p2-cmp-table-remount
---

# Component Registry (Level-1)

| Field | Value |
|-------|-------|
| **Live path** | `shared/docs/design/COMPONENT_REGISTRY.md` |
| **Promote target root** | `shared/src/ui/` |
| **Tokens** | [REGISTRIES/COLOR.md](./REGISTRIES/COLOR.md) + Foundation scales |
| **Gallery** | [GALLERY.md](./GALLERY.md) · entries dir [GALLERY/](./GALLERY/) |

Remount **Done** = Target exists under `shared/src/ui/` **and** every import site inside the **explicit Remount package list** greppably uses `pi-kiosk-shared/ui` (or a one-line re-export of it). Forbidden soft language: “as consumed”, “if used”, “any other consumer”.

| Status | Meaning |
|--------|---------|
| **Done** | Shared Target exists + full Remount list greppably remounted |
| **Partial** | Shared Target exists; remount incomplete vs Remount list |
| **Shipped** | Shared Target exists; Remount list empty or greenfield not yet remounted |
| **Deferred** | Explicit DEFER — never mark Done |

DEFER-OPS-STORYBOOK. **DEFER-CMP-DIVIDER** seed OK. ADV-GOV-CONFORMANCE-001 **not** in DoD.

---

## CMP table (0001–0027)

| CMP ID | Name | Target | Remount packages | Status | Notes |
|--------|------|--------|------------------|--------|-------|
| CMP-0001 | Button | `shared/src/ui/Button` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Shared SoT; customer shim files deleted → `surfacePrimitives` |
| CMP-0002 | Card | `shared/src/ui/Card` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Same as Button |
| CMP-0003 | FormField | `shared/src/ui/FormField` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Same as Button |
| CMP-0004 | Input | `shared/src/ui/Input` | admin-app + rpapp-pickup only | Partial | Shared created; app-local Input still present |
| CMP-0005 | Select | `shared/src/ui/Select` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Prior shared Select |
| CMP-0006 | Checkbox | `shared/src/ui/Checkbox` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Shipped | Greenfield shared; remount TBD |
| CMP-0007 | Radio | `shared/src/ui/Radio` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Shipped | Greenfield shared; remount TBD |
| CMP-0008 | Switch | `shared/src/ui/Switch` | admin-app only | Partial | Shared created; admin Switch still local |
| CMP-0009 | Badge | `shared/src/ui/Badge` | admin-app + rpapp-pickup only | Partial | Shared created; app Badge still local |
| CMP-0010 | Dialog | `shared/src/ui/Dialog` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Shipped | Radix-free shell; admin AppModal stays Radix PRIMARY |
| CMP-0011 | Toast | `shared/src/ui/Toast` | admin-app + rpapp-pickup only | Shipped | Presentational item; admin Radix viewport stays local |
| CMP-0012 | Icon | `shared/src/ui/Icon` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Customer BottomNavIcons remounted via Icon |
| CMP-0013 | Loader | `shared/src/ui/Loader` | admin-app + rpapp-kiosk only | Shipped | Spinner alias exported |
| CMP-0014 | Skeleton | `shared/src/ui/Skeleton` | admin-app + rpapp-pickup only | Partial | Shared created; pickup Skeleton still local |
| CMP-0015 | ScreenState | `shared/src/ui/ScreenState` | admin-app + rpapp-customer + rpapp-pickup only | Done | Q12 `loading \| error \| empty \| offline \| success` |
| CMP-0016 | QuantityStepper | `shared/src/ui/QuantityStepper` | rpapp-pickup + rpapp-customer | Partial | Pickup remounted; customer remount TBD |
| CMP-0017 | BottomSheet | `shared/src/ui/BottomSheet` | rpapp-customer + admin-app | Shipped | Drawer alias exported |
| CMP-0018 | IconButton | `shared/src/ui/IconButton` | rpapp-pickup + rpapp-customer | Partial | Pickup remounted; customer remount TBD |
| CMP-0019 | FilterChip | `shared/src/ui/FilterChip` | rpapp-pickup + rpapp-customer + **admin-app** | Partial | Shared prior; admin Orders uses shared FilterChip |
| CMP-0020 | SearchField | `shared/src/ui/SearchField` | — | Deferred | **DEFER-CMP-SEARCH** — no remount Done |
| CMP-0021 | SegmentTabs | `shared/src/ui/SegmentTabs` | admin-app (P2) + rpapp-customer (P3 History); pickup OOS | Done | Overflow in shared; admin Orders + AccountOrdersPage remounted |
| CMP-0022 | Typography | `shared/src/ui/Typography` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Shared prior |
| CMP-0023 | Textarea | `shared/src/ui/Textarea` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Shipped | Greenfield |
| CMP-0024 | FAB | `shared/src/ui/FAB` | admin-app only | Shipped | Greenfield |
| CMP-0025 | Avatar | `shared/src/ui/Avatar` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Admin `CustomersDirectoryPage` remounted; other Remount packages TBD |
| CMP-0026 | Breadcrumbs | `shared/src/ui/Breadcrumbs` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Admin dashboard chrome (near `CommandPaletteHost`) remounted; other Remount packages TBD |
| CMP-0027 | NavStepper | `shared/src/ui/NavStepper` | admin-app + rpapp-customer + rpapp-kiosk + rpapp-pickup | Partial | Customer checkout remounted; customer-local fork deleted |

---

## Deferred seeds

| ID / ADV | Item | Disposition |
|----------|------|-------------|
| DEFER-CMP-DIVIDER | Divider | Deferred — seed OK; not Level-1 Done |
| DEFER-CMP-SEARCH | SearchField (CMP-0020) | Deferred — no remount Done |
| DEFER-OPS-STORYBOOK | Storybook | Not in V1 DoD |

---

## ID migration notes

Icon **0012** · Loader **0013** (Spinner alias) · Skeleton **0014** · Divider DEFER · Drawer = BottomSheet alias only · QuantityStepper **0016** · BottomSheet **0017** · IconButton **0018**.
