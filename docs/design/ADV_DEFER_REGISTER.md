---
docVersion: 1.0.0
revisionDate: 2026-07-25
promptSource: adriatic-design-remake-v2.3.36-phase-0
---

# ADV / DEFER Register — Adriatic Design Remake (Phase 0)

| Field | Value |
|-------|-------|
| Status | **Published** (Phase 0 seed) |
| Date | 2026-07-25 |
| Program | Adriatic Retail V1 Design Remake v2.3.36 |
| Brand ADR | [ADR-FE-BRAND-002](./ADR-FE-BRAND-002.md) |
| Customer IA ADR | [`rpapp-customer/docs/retail-v1/adr/ADR-018.md`](../../rpapp-customer/docs/retail-v1/adr/ADR-018.md) |
| SoT | Plan PART I locks + PART II ADV supersession banners |

## Schema

| Column | Required |
|--------|----------|
| id | ADV-* or DEFER-* |
| kind | ADV \| DEFER |
| scope | short text |
| status | Open \| Accepted \| Historical \| Deferred |
| expires_on | ISO date or `program-end` |
| residual_risk / note | short |

---

## ADV pack (Accepted Deviations for this program)

| id | kind | scope | status | expires_on | note |
|----|------|-------|--------|------------|------|
| ADV-GOV-CONFORMANCE-001 | ADV | Doc5/6 ≥95% + Design Conformance Certificate | Accepted | program-end | **NOT in DoD.** Waives certificate / ≥95% release gate for this program only. |
| ADV-DOC4-KPI-ROW-001 | ADV | Doc4 max-4 KPI row | Accepted | program-end | Ship **6-up** retail TCC KPIs (Q1 / E8). |
| ADV-DOC4-LAYOUT-001 | ADV | Doc4 retail home layout | Accepted | program-end | Remove default ops HealthBand / Incidents / Quick Actions / Top Kiosks from retail TCC home. |
| ADV-DOC4-ROLE-DASH-001 | ADV | Doc4 role-specific dashboards | Accepted | program-end | Role dashboards / experience modes = **NON-GOAL** this wave. |
| ADV-NAV-DEMOTION-CATEGORIES | ADV | Doc4 Categories nav | Accepted | program-end | No new primary `categories` section; category UX stays under Products / System-More. |
| ADV-NAV-DEMOTION-USERS | ADV | Doc4 Users nav | Accepted | program-end | Demote to System/More → Settings Users & Roles / capabilities. |
| ADV-NAV-DEMOTION-ROLES | ADV | Doc4 Roles nav | Accepted | program-end | Demote to System/More → Settings Users & Roles / capabilities. |
| ADV-NAV-DEMOTION-PAYMENTS | ADV | Doc4 Payments primary | Accepted | program-end | Demote Payments primary to System/More (`paymentsHub` overflow). |
| ADV-ADMIN-MOBILE-SETTINGS-001 | ADV | Admin mobile Settings | Accepted | program-end | Mobile Admin Settings = full usable companion (Q22=A) — not desktop-only. |
| ADV-A11Y-WCAG-22 | ADV | WCAG 2.2 product certificate | Accepted | program-end | Contrast tooling may remain WCAG **2.1** this wave; registries **target** 2.2; **no** product-wide WCAG 2.2 AA certificate claim. |
| ADV-IMG-001 | ADV | Doc1 photography / illustration program | Accepted | program-end | Doc1 imagery program = **NON-GOAL** (Q18=A). |
| ADV-BP-DOC5-TAILWIND-001 | ADV | Doc5 Visual Blueprint ↔ Tailwind map | Accepted | program-end | BP / gallery-lite map may lag full Doc5 aspirational atlas; Tailwind token adopt remains binding. |
| ADV-BRAND-SLOGAN-001 | ADV | Welcome slogan chrome | Accepted | program-end | Canonical EN: `QR-First • Simple • Fast • Smart` (U+2022 `•`, not middle-dot). |
| ADV-KIOSK-LIGHT-ONLY | ADV | Kiosk theme | Accepted | program-end | Kiosk = Adriatic **LIGHT_ONLY**; no dark enable. **Code:** `KioskThemeToggle` is a no-op; chrome mounts language only (dark path removed 2026-07-25). |
| ADV-PICKUP-SELECT-RADIX-001 | ADV | Pickup Select | Accepted | program-end | Q24=C: shared Select API wrapper; **Radix OK behind CMP**; no public PickupSelect API for new code after Phase 2 remount. |
| ADV-DOC1-SCALE-001 | ADV | Doc1 spacing/radius/elevation Level-5 | Historical | program-end | Doc1 dual numerics **Historical**; Doc6 / Q4 wins (`space.7`=**40**, radius XL=16, elevation 0–4 only). |
| ADV-OOS-008 | ADV | Orders Remold Path STATUS-API | Accepted | program-end | Promote PA-OOS-008 this wave; Options A/B deleted. |

---

## DEFER pack (explicit non-ships)

| id | kind | scope | status | note |
|----|------|-------|--------|------|
| DEFER-CU-SCAN-PATTERN-F-FULL | DEFER | Scanner Pattern F full atlas | Deferred | Phase 3 ships minimal (denied/empty/camera error) only. |
| DEFER-CU-SHARE-RECEIPT | DEFER | Share Receipt | Deferred | NON-GOAL; download/view remains. |
| DEFER-CU-PDP-FAV-SHARE | DEFER | PDP favorites / share | Deferred | Hide; no ghost placeholders. |
| DEFER-CU-WALLET-APPLE | DEFER | Apple Pay row | Deferred | Omit entirely (E1). |
| DEFER-CU-WALLET-GOOGLE | DEFER | Google Pay row | Deferred | Omit entirely (E1). |
| DEFER-CU-GIFT-CARD | DEFER | Gift card row | Deferred | Omit entirely (E1). |
| DEFER-CU-ACCOUNT-PAYMENT-METHODS | DEFER | Account payment methods hub | Deferred | Out of remold DoD. |
| DEFER-CU-ACCOUNT-SAVED-RECEIPTS | DEFER | Saved receipts productization | Deferred | Out of remold DoD. |
| DEFER-ADMIN-CHANNEL-VIZ | DEFER | Revenue-by-Channel on TCC | Deferred | Not on TCC; Analytics later (Q21=A). |
| DEFER-ADMIN-CUSTOMER-DETAIL | DEFER | Admin customer detail | Deferred | Directory REAL; detail deferred. |
| DEFER-TAX-L3 | DEFER | Full L3 tax token matrix | Deferred | Explicit Non-Goal. |
| DEFER-CMP-SEARCH | DEFER | SearchField CMP-0020 remount Done | Deferred | Seed Deferred only. |
| DEFER-CMP-DIVIDER | DEFER | Divider CMP | Deferred | Seed Deferred; not locked L1. |
| DEFER-OPS-STORYBOOK | DEFER | Storybook this wave | Deferred | Registry `tests` optional; Storybook NON-GOAL. |

---

## Forbidden reintroductions

Do **not** use ADV keep-paths to revive:

- MULTI-THEME / dual-theme / dual-SoT brand
- Keep-ADR-003 (superseded by ADR-018 only)
- Option C / Canva / Sailor / admin purple as live Brand SoT
- Claiming ≥95% conformance or WCAG 2.2 AA product certificate this wave

## Related

- [ADR-FE-BRAND-002.md](./ADR-FE-BRAND-002.md)
- [KAP6_VERSIONING_CHANGE_MANAGEMENT_STUB.md](./KAP6_VERSIONING_CHANGE_MANAGEMENT_STUB.md)
- Admin ADV seed (cert): [`admin-app/docs/governance/ADV_REGISTER.md`](../../admin-app/docs/governance/ADV_REGISTER.md) — separate cert register; this file is the **design remake** ADV/DEFER pack.
