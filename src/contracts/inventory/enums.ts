/**
 * @generated-style inventory wire enums (batch restock / checkup / incidents / ledger).
 *
 * SOURCE OF TRUTH: `up-backend/prisma/schema.prisma` (Prisma-backed members below).
 * This file is the frontend-consumed artifact path for the inventory contract pipeline
 * (v1: hand-synced to match generator output shape; CI drift gate enforces parity).
 *
 * Do not fork these enums in admin-app / rpapp-pickup — import from
 * `pi-kiosk-shared/contracts/inventory` (or package root re-exports).
 *
 * @see ./README.md — generator / sync pipeline + drift gate
 */

/** Prisma `ShrinkageReason` — checkup/incident line shrink codes. */
export const SHRINKAGE_REASONS = [
  'EXPIRED',
  'DAMAGED',
  'LOST',
  'STOLEN',
  'OTHER',
] as const;

export type ShrinkageReason = (typeof SHRINKAGE_REASONS)[number];

export function isShrinkageReason(value: unknown): value is ShrinkageReason {
  return (
    typeof value === 'string' &&
    (SHRINKAGE_REASONS as readonly string[]).includes(value)
  );
}

/** Prisma `RestockBatchStatus`. */
export const RESTOCK_BATCH_STATUSES = [
  'DRAFT',
  'APPLIED',
  'CANCELLED',
] as const;

export type RestockBatchStatus = (typeof RESTOCK_BATCH_STATUSES)[number];

export function isRestockBatchStatus(value: unknown): value is RestockBatchStatus {
  return (
    typeof value === 'string' &&
    (RESTOCK_BATCH_STATUSES as readonly string[]).includes(value)
  );
}

/** Prisma `InventoryCheckupStatus`. */
export const INVENTORY_CHECKUP_STATUSES = [
  'DRAFT',
  'IN_PROGRESS',
  'APPLIED',
  'CANCELLED',
] as const;

export type InventoryCheckupStatus = (typeof INVENTORY_CHECKUP_STATUSES)[number];

export function isInventoryCheckupStatus(
  value: unknown,
): value is InventoryCheckupStatus {
  return (
    typeof value === 'string' &&
    (INVENTORY_CHECKUP_STATUSES as readonly string[]).includes(value)
  );
}

/** Prisma `InventoryIncidentStatus`. */
export const INVENTORY_INCIDENT_STATUSES = [
  'OPEN',
  'RESOLVED',
  'DISMISSED',
] as const;

export type InventoryIncidentStatus = (typeof INVENTORY_INCIDENT_STATUSES)[number];

export function isInventoryIncidentStatus(
  value: unknown,
): value is InventoryIncidentStatus {
  return (
    typeof value === 'string' &&
    (INVENTORY_INCIDENT_STATUSES as readonly string[]).includes(value)
  );
}

/** Prisma `InventoryIncidentSeverity`. */
export const INVENTORY_INCIDENT_SEVERITIES = [
  'SUSPECTED_THEFT',
  'MISMATCH',
] as const;

export type InventoryIncidentSeverity =
  (typeof INVENTORY_INCIDENT_SEVERITIES)[number];

export function isInventoryIncidentSeverity(
  value: unknown,
): value is InventoryIncidentSeverity {
  return (
    typeof value === 'string' &&
    (INVENTORY_INCIDENT_SEVERITIES as readonly string[]).includes(value)
  );
}

/** Prisma `InventoryLedgerSourceType`. */
export const INVENTORY_LEDGER_SOURCE_TYPES = [
  'RESTOCK_BATCH',
  'INVENTORY_CHECKUP',
  'LEGACY_PUT',
  'FULFILLMENT_RESTOCK',
  'OTHER',
] as const;

export type InventoryLedgerSourceType =
  (typeof INVENTORY_LEDGER_SOURCE_TYPES)[number];

export function isInventoryLedgerSourceType(
  value: unknown,
): value is InventoryLedgerSourceType {
  return (
    typeof value === 'string' &&
    (INVENTORY_LEDGER_SOURCE_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Prisma `InventoryLedgerReasonCode`.
 * Shrinkage subset maps 1:1 to {@link ShrinkageReason}.
 */
export const INVENTORY_LEDGER_REASON_CODES = [
  'RESTOCK',
  'CYCLE_COUNT',
  'CORRECTION',
  'EXPIRED',
  'DAMAGED',
  'LOST',
  'STOLEN',
  'OTHER',
  'FOUND_STOCK',
  'FULFILLMENT_RESTOCK',
] as const;

export type InventoryLedgerReasonCode =
  (typeof INVENTORY_LEDGER_REASON_CODES)[number];

export function isInventoryLedgerReasonCode(
  value: unknown,
): value is InventoryLedgerReasonCode {
  return (
    typeof value === 'string' &&
    (INVENTORY_LEDGER_REASON_CODES as readonly string[]).includes(value)
  );
}

/** Checkup concurrency policy (plan Part 3/9 — wire string union). */
export const CHECKUP_CONCURRENCY_POLICIES = [
  'FAIL_IF_MOVED',
  'APPLY_COUNTED_OVERRIDE',
] as const;

export type CheckupConcurrencyPolicy =
  (typeof CHECKUP_CONCURRENCY_POLICIES)[number];

export function isCheckupConcurrencyPolicy(
  value: unknown,
): value is CheckupConcurrencyPolicy {
  return (
    typeof value === 'string' &&
    (CHECKUP_CONCURRENCY_POLICIES as readonly string[]).includes(value)
  );
}

/** Checkup scope mode (plan Part 3). */
export const CHECKUP_SCOPE_MODES = ['ACTIVE_STOCK', 'PRODUCT_IDS'] as const;

export type CheckupScopeMode = (typeof CHECKUP_SCOPE_MODES)[number];

export function isCheckupScopeMode(value: unknown): value is CheckupScopeMode {
  return (
    typeof value === 'string' &&
    (CHECKUP_SCOPE_MODES as readonly string[]).includes(value)
  );
}
