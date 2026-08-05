/**
 * Hand-written inventory DTO placeholders for pickup/admin wire contracts (v1).
 *
 * Enums/status unions MUST come from `./enums.js` (Prisma-aligned SoT via sync + drift gate).
 * Full DTO codegen from backend Zod/OpenAPI is Deferred-EXC (EXC-33) — do not claim
 * this file is generated.
 *
 * @see ./README.md
 */
import type {
  CheckupConcurrencyPolicy,
  CheckupScopeMode,
  InventoryCheckupStatus,
  InventoryIncidentSeverity,
  InventoryIncidentStatus,
  InventoryLedgerReasonCode,
  InventoryLedgerSourceType,
  RestockBatchStatus,
  ShrinkageReason,
} from './enums.js';
import type {
  InventoryOpsAnomalyFlag,
  InventoryOpsForensicMetadata,
} from './slo.js';

/** Product/variant grain shared by restock + checkup lines. */
export interface InventorySkuRef {
  readonly productId: number;
  readonly variantId: number | null;
}

/** Restock batch document (list/detail summary). */
export interface RestockBatchDto {
  readonly id: string;
  readonly tenantId: number;
  readonly salesPointId: number;
  readonly status: RestockBatchStatus;
  readonly version: number;
  readonly title: string | null;
  readonly preparedByLabel: string | null;
  readonly clientDraftKey: string;
  readonly appliedAt: string | null;
  readonly cancelledAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RestockBatchLineDto extends InventorySkuRef {
  readonly id: string;
  readonly batchId: string;
  readonly delta: number;
  readonly note: string | null;
}

/** Inventory checkup document. */
export interface InventoryCheckupDto {
  readonly id: string;
  readonly tenantId: number;
  readonly salesPointId: number;
  readonly status: InventoryCheckupStatus;
  readonly version: number;
  readonly concurrencyPolicy: CheckupConcurrencyPolicy;
  readonly scopeMode: CheckupScopeMode;
  readonly clientDraftKey: string;
  readonly startedAt: string | null;
  readonly appliedAt: string | null;
  readonly cancelledAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InventoryCheckupLineDto extends InventorySkuRef {
  readonly id: string;
  readonly checkupId: string;
  readonly expectedQuantity: number;
  readonly expectedStockOnHold: number;
  readonly countedQuantity: number | null;
  readonly included: boolean;
  readonly shrinkageReason: ShrinkageReason | null;
  readonly note: string | null;
}

/**
 * Admin/pickup inventory incident row.
 * `suspectedUnits` = shortage-only units (never overage / net delta).
 */
export interface InventoryIncidentDto {
  readonly id: string;
  readonly tenantId: number;
  readonly salesPointId: number;
  /** Null for report-only incidents (no checkup document). */
  readonly checkupId: string | null;
  readonly status: InventoryIncidentStatus;
  readonly severity: InventoryIncidentSeverity;
  readonly title: string;
  readonly summary: string;
  readonly suspectedUnits: number;
  readonly openedAt: string;
  readonly resolvedAt: string | null;
  readonly resolvedByAdminId: number | null;
  readonly resolutionNote: string | null;
  /**
   * Forensic bag for apply/report accountability (shared PIN attribution).
   * Prefer audit enrichment; may be minimal (tenant/salesPoint/occurredAt) when only entity fields exist.
   */
  readonly forensics?: InventoryOpsForensicMetadata | null;
  /** When set, admin incident detail must show an anomaly warning banner. */
  readonly anomalyFlag?: InventoryOpsAnomalyFlag | null;
}

export interface InventoryIncidentLineDto extends InventorySkuRef {
  readonly id: string;
  readonly incidentId: string;
  readonly expectedQuantity: number;
  readonly countedQuantity: number;
  readonly varianceUnits: number;
  readonly shrinkageReason: ShrinkageReason | null;
}

/** Append-only ledger entry (admin product timeline / forensics). */
export interface InventoryLedgerEntryDto extends InventorySkuRef {
  readonly id: string;
  readonly tenantId: number;
  readonly salesPointId: number;
  readonly sourceType: InventoryLedgerSourceType;
  readonly sourceId: string;
  readonly reasonCode: InventoryLedgerReasonCode;
  readonly deltaQuantity: number;
  readonly quantityAfter: number;
  readonly createdAt: string;
}
