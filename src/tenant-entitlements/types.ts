/**
 * Tenant entitlement policy — shared axis types and strategy shapes (ENT-PR-00).
 * Authoritative block list lives in catalog.ts (§6.3, 48 blocks).
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
  'catalog_administration',
  'audit_event_collection',
  'audit_logs_admin_ui',
  'gdpr_consent_admin_ui',
  'incident_centre_ui',
  'payment_processing_runtime',
  'outbox_runtime',
  'product_vending',
  'donation',
  'inventory_management',
  'loyalty_program',
  'promotions_program',
  'payment_rails_strategy',
  'payment_cash',
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
  'analytics_summary',
  'analytics_detailed',
  'mission_control',
  'analytics_pii',
  'customer_behavior_funnels',
  'analytics_benchmark',
  'tax_management',
  'compliance_fiscal_modules',
  'comms_governance',
  'permission_management_rbac',
  'tenant_ops_settings',
  'admin_notifications',
  'bank_account_administration',
  'receipt_delivery',
  'bank_inbox_claims_api',
] as const;

export type EntitlementBlockKey = (typeof ENTITLEMENT_BLOCK_KEYS)[number];

export const TENANT_ENTITLEMENT_CATALOG_VERSION = 2 as const;
export const TENANT_ENTITLEMENT_BLOCK_COUNT = ENTITLEMENT_BLOCK_KEYS.length;

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
