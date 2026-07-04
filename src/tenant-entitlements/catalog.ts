/**
 * Authoritative tenant entitlement block catalog — 44 blocks (§6.3).
 * Code catalogVersion must stay in sync with DB seed (ENT-PR-01).
 */
import type {
  EntitlementBlockCatalogEntry,
  EntitlementBlockKey,
  PaymentReconciliationStrategy,
} from './types.js';
import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
} from './types.js';

const ALWAYS_ON_IMMUTABLE = {
  runtimeMode: 'ALWAYS_ON',
  visibilityMode: 'VISIBLE',
  mutationMode: 'READ_ONLY',
} as const;

const PAYMENT_RECONCILIATION_DEFAULT_STRATEGY: PaymentReconciliationStrategy = {
  allowedModes: ['MODE_1', 'MODE_2'],
};

export const TENANT_ENTITLEMENT_BLOCK_CATALOG: readonly EntitlementBlockCatalogEntry[] = [
  {
    blockKey: 'platform_core',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    immutableDefaults: {
      runtimeMode: 'ALWAYS_ON',
      visibilityMode: 'HIDDEN',
      mutationMode: 'READ_ONLY',
    },
    notes: 'Internal resolver health',
  },
  {
    blockKey: 'dev_entitlement_policy_editor',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    immutableDefaults: ALWAYS_ON_IMMUTABLE,
    notes: 'DEV catalog GET/PUT; cross_tenant_dev exempt',
  },
  {
    blockKey: 'transactions',
    blockClass: 'CORE_REQUIRED',
    parentKeys: [],
    adminNavSectionId: 'transactions',
    notes: 'transactionRoutes',
  },
  {
    blockKey: 'sales_point_management',
    blockClass: 'CORE_REQUIRED',
    parentKeys: [],
    adminNavSectionId: 'kiosks',
    notes: 'Sales points in admin; DEV may HIDDEN+READ_ONLY (D-ENT-26)',
  },
  {
    blockKey: 'catalog_administration',
    blockClass: 'CONDITIONAL',
    parentKeys: ['product_vending'],
    notes:
      'DONATION_ONLY → deny reads; SIMPLE Off → allow GET; HARD_OFF BLOCK_ALL → deny reads',
  },
  {
    blockKey: 'audit_event_collection',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    immutableDefaults: {
      runtimeMode: 'ALWAYS_ON',
      visibilityMode: 'HIDDEN',
      mutationMode: 'BLOCK_ALL',
    },
    notes: 'Workers always collect; mutation BLOCK_ALL',
  },
  {
    blockKey: 'audit_logs_admin_ui',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    adminNavSectionId: 'audit-logs',
    capabilityHint: 'system:logs:read',
    immutableDefaults: ALWAYS_ON_IMMUTABLE,
    notes: 'DEV visibility toggle',
  },
  {
    blockKey: 'gdpr_consent_admin_ui',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    adminNavSectionId: 'consent-management',
    capabilityHint: 'system:pii:read',
    immutableDefaults: ALWAYS_ON_IMMUTABLE,
    notes: 'Not compliance_fiscal_modules',
  },
  {
    blockKey: 'incident_centre_ui',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    routeSuffix: 'success-incident-centre',
    immutableDefaults: ALWAYS_ON_IMMUTABLE,
    notes: 'DEV visibility toggle',
  },
  {
    blockKey: 'payment_processing_runtime',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    immutableDefaults: {
      runtimeMode: 'ALWAYS_ON',
      visibilityMode: 'HIDDEN',
      mutationMode: 'ALLOW_WRITES',
    },
    notes: 'Webhooks; never 403 in-flight',
  },
  {
    blockKey: 'outbox_runtime',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    immutableDefaults: {
      runtimeMode: 'ALWAYS_ON',
      visibilityMode: 'HIDDEN',
      mutationMode: 'ALLOW_WRITES',
    },
    notes: 'Workers always run',
  },
  {
    blockKey: 'product_vending',
    blockClass: 'CONDITIONAL',
    parentKeys: ['sales_point_management'],
    adminNavSectionId: 'products',
    capabilityHint: 'ops:products:read',
  },
  {
    blockKey: 'donation',
    blockClass: 'CONDITIONAL',
    parentKeys: ['sales_point_management'],
    adminNavSectionId: 'donation-projects',
    capabilityHint: 'ops:donation-projects:read',
  },
  {
    blockKey: 'inventory_management',
    blockClass: 'CONDITIONAL',
    parentKeys: ['product_vending', 'sales_point_management'],
    parentOperator: 'AND',
    adminNavSectionId: 'inventory',
    capabilityHint: 'ops:inventory:read',
  },
  {
    blockKey: 'loyalty_program',
    blockClass: 'CONDITIONAL',
    parentKeys: ['product_vending'],
    capabilityHint: 'loyalty:coupons:read',
    notes: 'Parent product_vending only; RETAIN ALL data on disable (§6.5)',
  },
  {
    blockKey: 'payment_rails_strategy',
    blockClass: 'CORE_REQUIRED',
    parentKeys: ['sales_point_management'],
    notes: 'Bank/rails; always on — channel config via payment-entitlements tab',
  },
  {
    blockKey: 'payment_reconciliation',
    blockClass: 'STRATEGY',
    parentKeys: ['payment_rails_strategy'],
    defaultStrategy: PAYMENT_RECONCILIATION_DEFAULT_STRATEGY,
    notes: 'allowedModes MODE_1/MODE_2 (§7.5)',
  },
  {
    blockKey: 'payments_hub_ui',
    blockClass: 'CONDITIONAL',
    parentKeys: ['payment_reconciliation'],
    adminNavSectionId: 'payments-hub',
    capabilityHint: 'tenant.reconciliation.read',
    notes: 'paymentsHub section — UI shell',
  },
  {
    blockKey: 'stripe_integration_strategy',
    blockClass: 'STRATEGY',
    parentKeys: [],
    notes: 'Mirrors Tenant.stripeIntegrationMode',
  },
  {
    blockKey: 'fulfillment_queue',
    blockClass: 'CONDITIONAL',
    parentKeys: ['order_pickup_infrastructure'],
    adminNavSectionId: 'fulfillment',
    capabilityHint: 'tenant.orders.fulfill.*',
    notes: 'fulfillment + orders sections',
  },
  {
    blockKey: 'order_pickup_infrastructure',
    blockClass: 'CONDITIONAL',
    parentKeys: ['surface_kiosk', 'surface_customer'],
    parentOperator: 'OR',
    notes: 'OR-parent §7.3; syncs Tenant PWA/pickup knobs',
  },
  {
    blockKey: 'pickup_points',
    blockClass: 'CONDITIONAL',
    parentKeys: ['order_pickup_infrastructure'],
    adminNavSectionId: 'pickup-points',
    capabilityHint: 'ops:sales-points:read',
    notes: 'Default ENABLED when parent on; auto-mirror (D-ENT-04)',
  },
  {
    blockKey: 'immediate_self_pickup',
    blockClass: 'CONDITIONAL',
    parentKeys: ['order_pickup_infrastructure'],
    notes: 'Mirror mode; syncs Tenant.immediatePickupGraceMinutes',
  },
  {
    blockKey: 'customer_self_collect',
    blockClass: 'CONDITIONAL',
    parentKeys: ['immediate_self_pickup'],
    notes: 'Customer collect flows',
  },
  {
    blockKey: 'scheduled_pickup',
    blockClass: 'CONDITIONAL',
    parentKeys: ['order_pickup_infrastructure'],
    notes: 'Syncs Tenant.scheduledPickup* fields',
  },
  {
    blockKey: 'staff_pickup_scan',
    blockClass: 'CONDITIONAL',
    parentKeys: ['pickup_points'],
    parentOperator: 'OR',
    notes: 'Pickup staff app; pickup_points OR mirror mode (resolved ENT-PR-03)',
  },
  {
    blockKey: 'surface_kiosk',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    notes: 'Kiosk bootstrap',
  },
  {
    blockKey: 'surface_customer',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    notes: 'Customer PWA',
  },
  {
    blockKey: 'realtime_device_transport',
    blockClass: 'CONDITIONAL',
    parentKeys: ['surface_kiosk'],
    notes: 'WS/SSE',
  },
  {
    blockKey: 'customer_auth_pwa',
    blockClass: 'CONDITIONAL',
    parentKeys: ['surface_customer'],
    notes: 'Account routes',
  },
  {
    blockKey: 'analytics',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    notes: 'Parent umbrella',
  },
  {
    blockKey: 'analytics_summary',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics'],
    adminNavSectionId: 'analytics',
    capabilityHint: 'analytics:summary:read',
    notes: 'Summary tab',
  },
  {
    blockKey: 'analytics_detailed',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics'],
    notes: 'Advanced explore',
  },
  {
    blockKey: 'analytics_pii',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics_detailed'],
    capabilityHint: 'analytics:pii:read',
    notes: 'Legacy customer-explore redirect',
  },
  {
    blockKey: 'customer_behavior_funnels',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics_detailed'],
    notes: 'Ingest tier ANALYTICS per CONSENT_TIER_MATRIX',
  },
  {
    blockKey: 'analytics_benchmark',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics'],
    notes: 'Absorbs analytics_benchmark_enabled flag',
  },
  {
    blockKey: 'tax_management',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    adminNavSectionId: 'tax-management',
    capabilityHint: 'config:pricing:read',
  },
  {
    blockKey: 'compliance_fiscal_modules',
    blockClass: 'CONDITIONAL',
    parentKeys: ['tax_management'],
    optionalParentKeys: ['tax_management'],
    notes: 'EET only — EnableComplianceModuleForTenantUseCase; tax optional',
  },
  {
    blockKey: 'comms_governance',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    notes: 'DEV comms-governance tab',
  },
  {
    blockKey: 'permission_management_rbac',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    adminNavSectionId: 'capabilities',
    capabilityHint: 'users:admins:create',
  },
  {
    blockKey: 'tenant_ops_settings',
    blockClass: 'CORE_REQUIRED',
    parentKeys: [],
    adminNavSectionId: 'account-settings',
    notes: 'account-settings + ops-settings tab; always on (DEV policy UI locked)',
  },
  {
    blockKey: 'bank_account_administration',
    blockClass: 'CONDITIONAL',
    parentKeys: ['payment_rails_strategy'],
    notes: 'Bank CRUD APIs',
  },
  {
    blockKey: 'receipt_delivery',
    blockClass: 'CONDITIONAL',
    parentKeys: ['comms_governance'],
    notes: 'Receipt provider overrides',
  },
  {
    blockKey: 'bank_inbox_claims_api',
    blockClass: 'CONDITIONAL',
    parentKeys: ['payment_reconciliation'],
    notes: 'bank-inbox + payment-claims APIs (distinct from payments_hub_ui)',
  },
] as const;

const CATALOG_BY_KEY = new Map<EntitlementBlockKey, EntitlementBlockCatalogEntry>(
  TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => [entry.blockKey, entry]),
);

if (TENANT_ENTITLEMENT_BLOCK_CATALOG.length !== TENANT_ENTITLEMENT_BLOCK_COUNT) {
  throw new Error(
    `Tenant entitlement catalog must contain ${TENANT_ENTITLEMENT_BLOCK_COUNT} blocks; got ${TENANT_ENTITLEMENT_BLOCK_CATALOG.length}`,
  );
}

if (
  TENANT_ENTITLEMENT_BLOCK_CATALOG.length !== ENTITLEMENT_BLOCK_KEYS.length ||
  !ENTITLEMENT_BLOCK_KEYS.every((key, index) => TENANT_ENTITLEMENT_BLOCK_CATALOG[index]?.blockKey === key)
) {
  throw new Error('Tenant entitlement catalog blockKey order must match ENTITLEMENT_BLOCK_KEYS');
}

export function isEntitlementBlockKey(value: string): value is EntitlementBlockKey {
  return CATALOG_BY_KEY.has(value as EntitlementBlockKey);
}

export function getEntitlementBlockCatalogEntry(
  blockKey: EntitlementBlockKey,
): EntitlementBlockCatalogEntry {
  const entry = CATALOG_BY_KEY.get(blockKey);
  if (entry === undefined) {
    throw new Error(`Unknown entitlement blockKey: ${blockKey}`);
  }
  return entry;
}

export {
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  ENTITLEMENT_BLOCK_KEYS,
};
