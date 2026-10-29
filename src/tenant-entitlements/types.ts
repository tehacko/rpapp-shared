/**
 * Tenant entitlement policy — shared axis types and strategy shapes (ENT-PR-00).
 * Authoritative block list lives in catalog.ts (§6.3, 60 blocks / catalogVersion 14).
 */

export const ENTITLEMENT_RUNTIME_MODES = ['ALWAYS_ON', 'ENABLED', 'DISABLED'] as const;
export type EntitlementRuntimeMode = (typeof ENTITLEMENT_RUNTIME_MODES)[number];

export const ENTITLEMENT_VISIBILITY_MODES = ['VISIBLE', 'HIDDEN'] as const;
export type EntitlementVisibilityMode = (typeof ENTITLEMENT_VISIBILITY_MODES)[number];

export const ENTITLEMENT_MUTATION_MODES = ['ALLOW_WRITES', 'READ_ONLY', 'BLOCK_ALL'] as const;
export type EntitlementMutationMode = (typeof ENTITLEMENT_MUTATION_MODES)[number];

export const ENTITLEMENT_BLOCK_CLASSES = [
  'CORE_IMMUTABLE',
  'CORE_REQUIRED',
  'CONDITIONAL',
  'STRATEGY',
] as const;
export type EntitlementBlockClass = (typeof ENTITLEMENT_BLOCK_CLASSES)[number];

export const ENTITLEMENT_PARENT_OPERATORS = ['AND', 'OR'] as const;
export type EntitlementParentOperator = (typeof ENTITLEMENT_PARENT_OPERATORS)[number];

/** SIMPLE profile → three-axis mapping (§6.4). */
export const SIMPLE_ENTITLEMENT_STATES = [
  'on',
  'softOffVisible',
  'softOffHidden',
  'off',
  'hardOff',
] as const;
export type SimpleEntitlementState = (typeof SIMPLE_ENTITLEMENT_STATES)[number];

export const RECONCILIATION_MODES = ['MODE_1', 'MODE_2'] as const;
export type ReconciliationMode = (typeof RECONCILIATION_MODES)[number];

/** STRATEGY block: payment_reconciliation allowedModes (§7.5). */
export interface PaymentReconciliationStrategy {
  readonly allowedModes: readonly ReconciliationMode[];
}

/** STRATEGY block: stripe_integration_strategy mirrors Tenant.stripeIntegrationMode. */
export interface StripeIntegrationStrategy {
  readonly integrationMode: string;
}

export type EntitlementStrategyJson =
  | PaymentReconciliationStrategy
  | StripeIntegrationStrategy
  | Record<string, unknown>;

/** Per-block three-axis posture stored on tenant policy rows. */
export interface EntitlementBlockAxes {
  readonly runtimeMode: EntitlementRuntimeMode;
  readonly visibilityMode: EntitlementVisibilityMode;
  readonly mutationMode: EntitlementMutationMode;
}

/** Read/write + nav visibility derived from axes (§6.1, §11.0). */
export interface EvaluatedEntitlementPosture {
  readonly visible: boolean;
  readonly allowReads: boolean;
  readonly allowWrites: boolean;
}

export interface EntitlementBlockCatalogEntry {
  readonly blockKey: EntitlementBlockKey;
  readonly blockClass: EntitlementBlockClass;
  readonly parentKeys: readonly EntitlementBlockKey[];
  readonly parentOperator?: EntitlementParentOperator;
  /** Parents that may be absent without blocking entitlement (e.g. tax_management for fiscal). */
  readonly optionalParentKeys?: readonly EntitlementBlockKey[];
  /**
   * Always-AND parents evaluated before parentKeys/parentOperator.
   * Use when a block needs infra ∧ (A ∨ B) without nested parent expressions
   * (e.g. staff_pickup_scan: order_pickup_infrastructure ∧ (pickup_points ∨ immediate_self_pickup)).
   * Catalog-runtime SSOT only — not a Prisma catalog column.
   */
  readonly requiredParentKeys?: readonly EntitlementBlockKey[];
  readonly adminNavSectionId?: string;
  readonly routeSuffix?: string;
  readonly capabilityHint?: string;
  readonly immutableDefaults?: EntitlementBlockAxes;
  readonly defaultStrategy?: PaymentReconciliationStrategy;
  readonly notes?: string;
}

export const ENTITLEMENT_BLOCK_KEYS = [
  'platform_core',
  'dev_entitlement_policy_editor',
  'transactions',
  'sales_point_management',
  'sales_point_individual_settings',
  'shipping_light',
  'catalog_administration',
  'product_barcode_administration',
  'audit_event_collection',
  'audit_logs_admin_ui',
  'audit_intelligence',
  'gdpr_consent_admin_ui',
  'incident_centre_ui',
  'payment_processing_runtime',
  'outbox_runtime',
  'product_vending',
  'restock_alerts',
  'donation',
  'donation_recurring',
  'inventory_management',
  'inventory_operations',
  'inventory_incidents',
  'loyalty_program',
  'promotions_program',
  'payment_rails_strategy',
  'payment_cash',
  'payment_multi_currency',
  'payment_reconciliation',
  'payments_hub_ui',
  'stripe_integration_strategy',
  'fulfillment_queue',
  'order_pickup_infrastructure',
  'pickup_points',
  'immediate_self_pickup',
  'customer_self_collect',
  'scheduled_pickup',
  'staff_pickup_scan',
  'surface_kiosk',
  'surface_customer',
  'realtime_device_transport',
  'customer_auth_pwa',
  'analytics',
  'analytics_basic',
  'analytics_overview',
  'analytics_explore',
  'tax_management',
  'compliance_fiscal_modules',
  'comms_governance',
  'team_management_core',
  'permission_management_rbac',
  'tenant_ops_settings',
  'tenant_ops_automation',
  'tenant_brand_kit',
  'admin_mfa',
  'admin_notifications',
  'bank_account_administration',
  'bank_account_providers',
  'receipt_delivery',
  'receipt_provider_overrides',
  'bank_inbox_claims_api',
] as const;

export type EntitlementBlockKey = (typeof ENTITLEMENT_BLOCK_KEYS)[number];

export const TENANT_ENTITLEMENT_CATALOG_VERSION = 14 as const;
export const TENANT_ENTITLEMENT_BLOCK_COUNT = ENTITLEMENT_BLOCK_KEYS.length;

/** Self-serve commercial plan ladder (Package A). Organization/Enterprise is not in this enum. */
export const COMMERCIAL_PLAN_IDS = ['FREE', 'PRO', 'GROWTH'] as const;
export type CommercialPlanId = (typeof COMMERCIAL_PLAN_IDS)[number];

/** Product placement axis — list, not single value (Package A §3.1). */
export const COMMERCIAL_PLACEMENT_IDS = [
  'FREE',
  'PRO',
  'GROWTH',
  'NON_COMMERCIAL',
  'SEPARATE_PRODUCT',
] as const;
export type CommercialPlacementId = (typeof COMMERCIAL_PLACEMENT_IDS)[number];

/** Technical block alignment to a single product boundary (Package A §3.2). */
export const COMMERCIAL_ALIGNMENT_STATUSES = ['ALIGNED', 'REFACTOR_REQUIRED'] as const;
export type CommercialAlignmentStatus = (typeof COMMERCIAL_ALIGNMENT_STATUSES)[number];

/**
 * Sellability axis (Package A §3.3). DO_NOT_SELL / VALIDATE are not placements.
 * VALIDATE = secondary packaging hold (same DEFER family as DO_NOT_SELL) until cleared.
 * Not a substitute for runtime readiness READY/TEST/PARTIAL/NOT READY.
 */
export const SELLABILITY_STATUSES = [
  'NOT_APPLICABLE',
  'OPEN',
  'DO_NOT_SELL',
  'VALIDATE',
] as const;
export type SellabilityStatus = (typeof SELLABILITY_STATUSES)[number];

/** Three-axis commercial packaging rule for one entitlement block key. */
export interface CommercialPackagingRule {
  readonly commercialPlacements: readonly CommercialPlacementId[];
  readonly alignmentStatus: CommercialAlignmentStatus;
  readonly sellabilityStatus: SellabilityStatus;
  readonly rationale: string;
}

/** Preflight-only commercial package decision (Package A §3.4). Never used for HTTP deny. */
export const COMMERCIAL_PACKAGE_DECISIONS = ['ALLOW', 'DENY', 'DEFER'] as const;
export type CommercialPackageDecision = (typeof COMMERCIAL_PACKAGE_DECISIONS)[number];

/**
 * Commercial Free/Pro/Growth ceiling — always ENFORCE (product truth).
 * off/shadow rollout axis retired; not env-settable.
 */
export const COMMERCIAL_PROJECTION_MODES = ['enforce'] as const;
export type CommercialProjectionMode = (typeof COMMERCIAL_PROJECTION_MODES)[number];

/**
 * Package G §8.2 — opaque access invalidator string.
 * Wire form: `ar1:<64 lowercase hex SHA-256>`. Clients compare as opaque string only.
 */
declare const AccessRevisionBrand: unique symbol;
export type AccessRevision = string & { readonly [AccessRevisionBrand]: typeof AccessRevisionBrand };

/**
 * Additive entitlement snapshot wire fields (documentation contract).
 * - `accessRevision`: opaque `ar1:…` invalidator; plan / packaging / projection / build changes
 *   bump this — **not** `entitlementPolicyRevision` / technical policy revision alone.
 * - `commercialDeniedBlockKeys`: authoritative commercial DENY block keys (ceiling always ENFORCE).
 * Evaluated decisions still come from shared `evaluateCommercialPackageDecision` (SSOT).
 */
export interface CommercialProjectionSnapshotFields {
  readonly accessRevision?: AccessRevision;
  readonly commercialDeniedBlockKeys?: readonly EntitlementBlockKey[];
  readonly commercialProjectionMode?: CommercialProjectionMode;
}

export const TENANT_SURFACE_PRESET_IDS = [
  'KIOSK_ONLY',
  'CUSTOMER_ONLY',
  'BOTH_SURFACES',
  'DONATION_ONLY',
  'VENDING_ONLY',
] as const;
export type TenantSurfacePresetId = (typeof TENANT_SURFACE_PRESET_IDS)[number];

/** Maps SIMPLE UI state to three-axis posture (§6.4). */
export function simpleEntitlementStateToAxes(
  state: SimpleEntitlementState,
): EntitlementBlockAxes {
  switch (state) {
    case 'on':
      return {
        runtimeMode: 'ENABLED',
        visibilityMode: 'VISIBLE',
        mutationMode: 'ALLOW_WRITES',
      };
    case 'softOffVisible':
      return {
        runtimeMode: 'ENABLED',
        visibilityMode: 'VISIBLE',
        mutationMode: 'READ_ONLY',
      };
    case 'softOffHidden':
      return {
        runtimeMode: 'ENABLED',
        visibilityMode: 'HIDDEN',
        mutationMode: 'READ_ONLY',
      };
    case 'off':
      return {
        runtimeMode: 'DISABLED',
        visibilityMode: 'HIDDEN',
        mutationMode: 'READ_ONLY',
      };
    case 'hardOff':
      return {
        runtimeMode: 'DISABLED',
        visibilityMode: 'HIDDEN',
        mutationMode: 'BLOCK_ALL',
      };
  }
}
