/**
 * Shared inventory contracts — pickup/admin import path for enums + DTOs + SLO/forensics.
 *
 * Prefer: `import { … } from 'pi-kiosk-shared/contracts/inventory'`
 * or package root re-exports from `pi-kiosk-shared`.
 *
 * Do not fork ShrinkageReason / status enums in app-local types.
 *
 * @generated-style SoT artifact — see ./README.md
 */
export {
  CHECKUP_CONCURRENCY_POLICIES,
  CHECKUP_SCOPE_MODES,
  INVENTORY_CHECKUP_STATUSES,
  INVENTORY_INCIDENT_SEVERITIES,
  INVENTORY_INCIDENT_STATUSES,
  INVENTORY_LEDGER_REASON_CODES,
  INVENTORY_LEDGER_SOURCE_TYPES,
  RESTOCK_BATCH_STATUSES,
  SHRINKAGE_REASONS,
  isCheckupConcurrencyPolicy,
  isCheckupScopeMode,
  isInventoryCheckupStatus,
  isInventoryIncidentSeverity,
  isInventoryIncidentStatus,
  isInventoryLedgerReasonCode,
  isInventoryLedgerSourceType,
  isRestockBatchStatus,
  isShrinkageReason,
  type CheckupConcurrencyPolicy,
  type CheckupScopeMode,
  type InventoryCheckupStatus,
  type InventoryIncidentSeverity,
  type InventoryIncidentStatus,
  type InventoryLedgerReasonCode,
  type InventoryLedgerSourceType,
  type RestockBatchStatus,
  type ShrinkageReason,
} from './enums.js';

export {
  INVENTORY_OPS_ANOMALY_KINDS,
  INVENTORY_OPS_APPLY_P95_MAX_MS,
  INVENTORY_OPS_FORENSIC_ATTRIBUTION_NOTE,
  INVENTORY_OPS_HOLD_FLOOR_CONFLICT_RATE_MAX,
  INVENTORY_OPS_IDEMPOTENCY_CONFLICT_RATE_MAX,
  INVENTORY_INCIDENT_SHORTAGE_UNITS_THRESHOLD_DEFAULT,
  INVENTORY_CHECKUP_SNAPSHOT_MAX_LINES_DEFAULT,
  type InventoryOpsAnomalyFlag,
  type InventoryOpsAnomalyKind,
  type InventoryOpsForensicMetadata,
} from './slo.js';

export type {
  InventoryCheckupDto,
  InventoryCheckupLineDto,
  InventoryIncidentDto,
  InventoryIncidentLineDto,
  InventoryLedgerEntryDto,
  InventorySkuRef,
  RestockBatchDto,
  RestockBatchLineDto,
} from './dtos.js';
