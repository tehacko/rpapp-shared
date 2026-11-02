/**
 * Product CAP-01..CAP-18 → entitlement-block map (plan G8 Kind table + attribution pass).
 *
 * Every catalog block is either:
 * - readiness-mapped to exactly one CAP, or
 * - a readiness-excluded commercial child (display affinity only), or
 * - supporting packs (unattributed) — residual display bucket (none expected after attribution).
 *
 * shipping_light / bank_account_providers stay off CAP-05/CAP-09 readiness maps so
 * HARD_OFF children cannot false-NOT_READY the parent CAP.
 * CAP-15 Partner API has no catalog blocks and must never activate.
 *
 * NEVER import admin-app or up-backend into this module.
 */
import { ENTITLEMENT_BLOCK_KEYS, type EntitlementBlockKey } from './types.js';

export const PRODUCT_CAPABILITY_IDS = [
  'CAP-01',
  'CAP-02',
  'CAP-03',
  'CAP-04',
  'CAP-05',
  'CAP-06',
  'CAP-07',
  'CAP-08',
  'CAP-09',
  'CAP-10',
  'CAP-11',
  'CAP-12',
  'CAP-13',
  'CAP-14',
  'CAP-15',
  'CAP-16',
  'CAP-17',
  'CAP-18',
] as const;

export type ProductCapabilityId = (typeof PRODUCT_CAPABILITY_IDS)[number];

export function isProductCapabilityId(value: string): value is ProductCapabilityId {
  return (PRODUCT_CAPABILITY_IDS as readonly string[]).includes(value);
}

/** CAP-15 Partner API — no entitlement blocks; never-activate. */
export const PARTNER_API_CAPABILITY_ID: ProductCapabilityId = 'CAP-15';

export const NEVER_ACTIVATE_PRODUCT_CAPABILITY_IDS = [
  PARTNER_API_CAPABILITY_ID,
] as const satisfies readonly ProductCapabilityId[];

export function isNeverActivateProductCapability(capabilityId: ProductCapabilityId): boolean {
  return (NEVER_ACTIVATE_PRODUCT_CAPABILITY_IDS as readonly string[]).includes(capabilityId);
}

export const PRODUCT_CAPABILITY_BLOCK_MAP = {
  'CAP-01': [
    'catalog_administration',
    'product_barcode_administration',
    'product_vending',
    'inventory_management',
    'inventory_operations',
    'inventory_incidents',
    // Package E / growth children parented under catalog vending commercially
    'restock_alerts',
    'loyalty_program',
    'promotions_program',
  ],
  'CAP-02': ['donation', 'donation_recurring'],
  'CAP-03': ['surface_customer', 'customer_auth_pwa'],
  'CAP-04': ['surface_kiosk', 'realtime_device_transport'],
  // shipping_light: see PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN
  'CAP-05': ['sales_point_management', 'sales_point_individual_settings'],
  'CAP-06': [
    'fulfillment_queue',
    'order_pickup_infrastructure',
    'pickup_points',
    'staff_pickup_scan',
  ],
  'CAP-07': ['analytics', 'analytics_basic', 'analytics_overview', 'analytics_explore'],
  'CAP-08': [
    'payment_rails_strategy',
    'payment_multi_currency',
    'stripe_integration_strategy',
    'payment_reconciliation',
    'payments_hub_ui',
  ],
  // bank_account_providers: see PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN
  'CAP-09': ['bank_account_administration', 'bank_inbox_claims_api'],
  'CAP-10': ['tenant_brand_kit'],
  'CAP-11': ['tenant_ops_settings', 'tenant_ops_automation'],
  'CAP-12': [
    'team_management_core',
    'permission_management_rbac',
    'admin_mfa',
    'admin_notifications',
  ],
  'CAP-13': ['payment_cash'],
  'CAP-14': ['immediate_self_pickup', 'customer_self_collect', 'scheduled_pickup'],
  'CAP-15': [],
  /** Internal / never-sold foundation — grids stay READY so G8 does not false-deny infra. */
  'CAP-16': [
    'platform_core',
    'dev_entitlement_policy_editor',
    'transactions',
    'payment_processing_runtime',
    'outbox_runtime',
  ],
  'CAP-17': [
    'audit_event_collection',
    'audit_logs_admin_ui',
    'audit_intelligence',
    'gdpr_consent_admin_ui',
    'incident_centre_ui',
    'tax_management',
    'compliance_fiscal_modules',
    'comms_governance',
  ],
  'CAP-18': ['receipt_delivery', 'receipt_provider_overrides'],
} as const satisfies Record<ProductCapabilityId, readonly EntitlementBlockKey[]>;

export const PRODUCT_CAPABILITY_BLOCK_KEYS = PRODUCT_CAPABILITY_BLOCK_MAP;

/**
 * Commercial children nested under a parent CAP for operator UX, but intentionally
 * omitted from PRODUCT_CAPABILITY_BLOCK_MAP so readiness AND does not couple HARD_OFF
 * children to the parent CAP row.
 */
export const PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN = {
  shipping_light: 'CAP-05',
  bank_account_providers: 'CAP-09',
} as const satisfies Readonly<Partial<Record<EntitlementBlockKey, ProductCapabilityId>>>;

export type ProductCapabilityDisplayAttribution =
  | { readonly kind: 'mapped'; readonly capabilityId: ProductCapabilityId }
  | {
      readonly kind: 'readiness_excluded_child';
      readonly parentCapabilityId: ProductCapabilityId;
    }
  | { readonly kind: 'unattributed' };

const ALLOWED_BLOCK_KEYS = new Set<string>(ENTITLEMENT_BLOCK_KEYS);

for (const [capabilityId, blockKeys] of Object.entries(PRODUCT_CAPABILITY_BLOCK_MAP)) {
  for (const blockKey of blockKeys) {
    if (!ALLOWED_BLOCK_KEYS.has(blockKey)) {
      throw new Error(
        `PRODUCT_CAPABILITY_BLOCK_MAP ${capabilityId} lists unknown blockKey ${JSON.stringify(blockKey)}`,
      );
    }
  }
}

for (const [blockKey, parentId] of Object.entries(PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN)) {
  if (!ALLOWED_BLOCK_KEYS.has(blockKey)) {
    throw new Error(
      `PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN lists unknown blockKey ${JSON.stringify(blockKey)}`,
    );
  }
  if (!isProductCapabilityId(parentId)) {
    throw new Error(
      `PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN ${blockKey} parent ${JSON.stringify(parentId)} is not a product capability`,
    );
  }
}

const BLOCK_TO_CAPABILITY: ReadonlyMap<EntitlementBlockKey, ProductCapabilityId> = (() => {
  const map = new Map<EntitlementBlockKey, ProductCapabilityId>();
  for (const capabilityId of PRODUCT_CAPABILITY_IDS) {
    for (const blockKey of PRODUCT_CAPABILITY_BLOCK_MAP[capabilityId]) {
      const existing = map.get(blockKey);
      if (existing !== undefined && existing !== capabilityId) {
        throw new Error(
          `entitlement block ${JSON.stringify(blockKey)} mapped to both ${existing} and ${capabilityId}`,
        );
      }
      map.set(blockKey, capabilityId);
    }
  }
  for (const blockKey of Object.keys(
    PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN,
  ) as EntitlementBlockKey[]) {
    if (map.has(blockKey)) {
      throw new Error(
        `entitlement block ${JSON.stringify(blockKey)} cannot be both readiness-mapped and readiness-excluded`,
      );
    }
  }
  return map;
})();

export function entitlementBlockKeysForProductCapability(
  capabilityId: ProductCapabilityId,
): readonly EntitlementBlockKey[] {
  return PRODUCT_CAPABILITY_BLOCK_MAP[capabilityId];
}

export function getProductCapabilityBlockKeys(
  capabilityId: ProductCapabilityId,
): readonly EntitlementBlockKey[] {
  return entitlementBlockKeysForProductCapability(capabilityId);
}

export function productCapabilityIdForEntitlementBlock(
  blockKey: EntitlementBlockKey,
): ProductCapabilityId | undefined {
  return BLOCK_TO_CAPABILITY.get(blockKey);
}

export function readinessExcludedParentCapabilityIdForEntitlementBlock(
  blockKey: EntitlementBlockKey,
): ProductCapabilityId | undefined {
  if (
    !Object.prototype.hasOwnProperty.call(
      PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN,
      blockKey,
    )
  ) {
    return undefined;
  }
  return PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN[
    blockKey as keyof typeof PRODUCT_CAPABILITY_READINESS_EXCLUDED_CHILDREN
  ];
}

/**
 * Operator-facing attribution for every catalog block (mapped CAP, excluded child, or
 * Supporting packs / unattributed residual).
 */
export function productCapabilityDisplayForEntitlementBlock(
  blockKey: EntitlementBlockKey,
): ProductCapabilityDisplayAttribution {
  const mapped = productCapabilityIdForEntitlementBlock(blockKey);
  if (mapped !== undefined) {
    return { kind: 'mapped', capabilityId: mapped };
  }
  const parent = readinessExcludedParentCapabilityIdForEntitlementBlock(blockKey);
  if (parent !== undefined) {
    return { kind: 'readiness_excluded_child', parentCapabilityId: parent };
  }
  return { kind: 'unattributed' };
}
