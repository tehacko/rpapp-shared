/**
 * Stable tailwind-variants ^0.3 API gate for pi-kiosk-shared primitive recipes.
 *
 * Shared primitives import from here — not from `tailwind-variants` directly.
 * Admin may import `pi-kiosk-shared/ui/tvShim` when code must match the 0.3 recipe
 * contract; admin-local components continue using tv ^3.2.
 *
 * @see docs/FRONTEND/ADR-FE-TV-001-DECISION.md
 */
export { tv, type VariantProps } from 'tailwind-variants';
