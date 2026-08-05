/**
 * @generated-style inventory ops forensics + objective rollout SLO thresholds.
 *
 * SoT for Part 10 / Wave F–G gates — CI drift gate fails if backend metrics
 * constants diverge from these exports.
 *
 * @see ./README.md
 */

/** p95 apply latency for restock/checkup (canary tenant load profile), ms. */
export const INVENTORY_OPS_APPLY_P95_MAX_MS = 1200 as const;

/** Idempotency conflict rate over rolling canary window (conflicts / applies). */
export const INVENTORY_OPS_IDEMPOTENCY_CONFLICT_RATE_MAX = 0.01 as const;

/** Hold-floor conflict rate of checkup apply attempts (conflicts / checkup applies). */
export const INVENTORY_OPS_HOLD_FLOOR_CONFLICT_RATE_MAX = 0.05 as const;

/** Canonical default used when backend env override is not provided. */
export const INVENTORY_INCIDENT_SHORTAGE_UNITS_THRESHOLD_DEFAULT = 3 as const;

/** Deterministic snapshot freeze upper bound for checkup start. */
export const INVENTORY_CHECKUP_SNAPSHOT_MAX_LINES_DEFAULT = 500 as const;

export const INVENTORY_OPS_ANOMALY_KINDS = [
  'repeated_large_shortage',
  'high_frequency_apply',
  'high_frequency_revert_pattern',
] as const;

export type InventoryOpsAnomalyKind = (typeof INVENTORY_OPS_ANOMALY_KINDS)[number];

/**
 * Display copy for admin incident forensics panel.
 * Shared PIN attribution — not individual human identity.
 */
export const INVENTORY_OPS_FORENSIC_ATTRIBUTION_NOTE =
  'shared PIN attribution, not individual identity.' as const;

/**
 * Minimum forensic metadata contract (apply/report accountability mitigation).
 * Wire optional fields when session/device/network context is available.
 */
export interface InventoryOpsForensicMetadata {
  readonly tenantId: number;
  readonly salesPointId: number;
  readonly occurredAt: string;
  readonly pickupSessionId?: string | null;
  readonly deviceCode?: string | null;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
  readonly correlationId?: string | null;
  readonly actorLabel?: string | null;
}

/** Anomaly flag payload for admin incident detail warning banner. */
export interface InventoryOpsAnomalyFlag {
  readonly kind: InventoryOpsAnomalyKind;
  readonly detail?: string | null;
}
