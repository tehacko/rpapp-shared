/**
 * Authoritative tenant entitlement block catalog — 48 blocks (§6.3).
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
    blockKey: 'sales_point_individual_settings',
    blockClass: 'CONDITIONAL',
    parentKeys: ['sales_point_management'],
    notes:
      'Per sales-point Mobilní obchod / mobile shop channel editor on Prodejní kanály. Default OFF — full-demo (railway-cafe / *-max) On',
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
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    adminNavSectionId: 'audit-logs',
    capabilityHint: 'tenant.systemLogs.view',
    notes: 'Tenant admin Audit logs UI — DEV Feature Policy allow/deny (not CORE_IMMUTABLE)',
  },
  {
    blockKey: 'gdpr_consent_admin_ui',
    blockClass: 'CORE_IMMUTABLE',
    parentKeys: [],
    capabilityHint: 'tenant.systemPii.view',
    immutableDefaults: ALWAYS_ON_IMMUTABLE,
    notes: 'API/entitlement block only; admin UI is platform DEV /dev/compliance',
  },
  {
    blockKey: 'incident_centre_ui',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    routeSuffix: 'success-incident-centre',
    notes:
      'Commercial tenant Události tab/nav/SIC APIs only — default OFF (FULL_DEMO_ALWAYS_OFF, not DEFAULT_OFF_ROLLOUT). Not an outbox grant ceiling. Platform /dev/success-incident-centre is capability-only (platform.successIncident.*). Platform /dev/inbox uses platform /me ALLOW of this key ∧ capability — not commercial Feature Policy',
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
    blockKey: 'inventory_incidents',
    blockClass: 'CONDITIONAL',
    parentKeys: ['inventory_management'],
    adminNavSectionId: 'inventory-incidents',
    capabilityHint: 'ops:inventory:read',
    notes:
      'Child of inventory_management — parent must be On to enable; parent Off/HardOff forces child Off/HardOff (PARENT-01). Child On does not imply parent On. Seed: hardOff for min/bookstore; On for full-demo/max',
  },
  {
    blockKey: 'loyalty_program',
    blockClass: 'CONDITIONAL',
    parentKeys: ['product_vending'],
    capabilityHint: 'loyalty:coupons:read',
    notes: 'Parent product_vending only; RETAIN ALL data on disable (§6.5)',
  },
  {
    blockKey: 'promotions_program',
    blockClass: 'CONDITIONAL',
    parentKeys: ['product_vending'],
    capabilityHint: 'promo:rewards:read',
    notes: 'Commerce promos bounded context; parent product_vending only; RETAIN ALL data on disable (§6.5)',
  },
  {
    blockKey: 'payment_rails_strategy',
    blockClass: 'CORE_REQUIRED',
    parentKeys: ['sales_point_management'],
    notes: 'Bank/rails; always on — channel config via payment-entitlements tab',
  },
  {
    blockKey: 'payment_cash',
    blockClass: 'CONDITIONAL',
    parentKeys: ['payment_rails_strategy'],
    notes:
      'Cash channel ceiling; seeded ENABLED; Dev may DISABLED — when DISABLED cash never contributes to payReady / cash offer / cash create. Reserved (docs only, not a catalog key): payment_card_present',
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
    notes:
      'Master switch for pickup ops cluster (fulfillment_queue/pickup_points/staff_pickup_scan); SIMPLE Off forces scheduled_pickup Off; scheduled_pickup syncs Tenant.scheduledPickupEnabled via side-effects',
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
    parentKeys: [],
    notes:
      'Independent of order_pickup_infrastructure (core NOW collect). Collect-only: inactive infra (off/hardOff/softOff*/missing) + product_vending active ⇒ SIMPLE/resolver/validator force On. Tenant.immediatePickupGraceMinutes is a Dev tenant setting (not entitlement side-effect sync)',
  },
  {
    blockKey: 'customer_self_collect',
    blockClass: 'CONDITIONAL',
    parentKeys: ['immediate_self_pickup', 'order_pickup_infrastructure'],
    notes:
      'Optional post-purchase self-collect ack/verify (not core NOW checkout collect). Requires immediate_self_pickup AND order_pickup_infrastructure — aligns with assertCustomerSelfCollectWriteEntitled',
  },
  {
    blockKey: 'scheduled_pickup',
    blockClass: 'CONDITIONAL',
    parentKeys: ['order_pickup_infrastructure'],
    notes:
      'Syncs Tenant.scheduledPickupEnabled only; Off-only parent denial when infra Off',
  },
  {
    blockKey: 'staff_pickup_scan',
    blockClass: 'CONDITIONAL',
    parentKeys: ['pickup_points', 'immediate_self_pickup'],
    parentOperator: 'OR',
    requiredParentKeys: ['order_pickup_infrastructure'],
    notes:
      'Pickup staff scan ops; requires order_pickup_infrastructure ∧ (pickup_points ∨ immediate_self_pickup) — ENT-PR-03 OR + infra (PICKUP_ENTITLEMENT optional surfaces)',
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
    parentKeys: ['surface_kiosk', 'surface_customer'],
    parentOperator: 'OR',
    notes:
      'WS/SSE for kiosk and customer shop catalog live updates — entitled when either surface is on',
  },
  {
    blockKey: 'customer_auth_pwa',
    blockClass: 'CORE_REQUIRED',
    parentKeys: ['surface_customer'],
    notes:
      'Customer registration, login, and account routes — mandatory when customer PWA is entitled; DEV policy UI locked On',
  },
  {
    blockKey: 'analytics',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    notes: 'Parent umbrella',
  },
  {
    blockKey: 'analytics_overview',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics'],
    adminNavSectionId: 'mission-control',
    capabilityHint: 'analytics:mission-control:read',
    notes: 'Přehled — Tenant Command Center / Mission Control (replaces analytics_summary + mission_control)',
  },
  {
    blockKey: 'analytics_explore',
    blockClass: 'CONDITIONAL',
    parentKeys: ['analytics'],
    adminNavSectionId: 'analytics',
    capabilityHint: 'analytics:summary:read',
    notes:
      'Analytika — all in-page analytics tabs; detailed/PII/benchmark/funnels gated by RBAC capabilities only',
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
    blockKey: 'tenant_brand_kit',
    blockClass: 'CONDITIONAL',
    parentKeys: ['tenant_ops_settings'],
    capabilityHint: 'account.self.manage',
    notes:
      'Advanced brand kit: wordmark, receipt footer, apply-to receipts/emails + editable apply toggles. Default OFF — without it, square logo still auto-applies to customer PWA + admin login; receipts/emails stay off.',
  },
  {
    blockKey: 'admin_mfa',
    blockClass: 'CONDITIONAL',
    parentKeys: ['tenant_ops_settings'],
    capabilityHint: 'account.self.manage',
    notes:
      'Admin TOTP authenticator enroll/login/step-up. Default OFF (rollout flag) — enable per tenant. Email OTP is never used for admin.',
  },
  {
    blockKey: 'admin_notifications',
    blockClass: 'CONDITIONAL',
    parentKeys: [],
    routeSuffix: 'inbox',
    // Inbox routes use admin:outbox:read RBAC; CapMap outbox grants are entitlementExempt
    // (independent of this pack). Do not equate outbox grants with Události.
    capabilityHint: 'admin:outbox:read',
    notes:
      'In-app admin inbox: header bell, account notification prefs, tenant /inbox — default OFF. Not Události (incident_centre_ui); CapMap does not couple admin:outbox grants to this pack.',
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
    parentKeys: ['transactions'],
    notes: 'Receipt provider overrides (independent of comms_governance / tenant credentials)',
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
