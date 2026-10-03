/**
 * Product CAP-01..CAP-15 → entitlement-block map (plan G8 Kind table).
 *
 * Implementation-detail / leftover_keep_key blocks are intentionally unmapped.
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
    'inventory_incidents',
  ],
  'CAP-02': ['donation'],
  'CAP-03': ['surface_customer', 'customer_auth_pwa'],
  'CAP-04': ['surface_kiosk', 'realtime_device_transport'],
  'CAP-05': ['sales_point_management', 'sales_point_individual_settings'],
  'CAP-06': [
    'fulfillment_queue',
    'order_pickup_infrastructure',
    'pickup_points',
    'staff_pickup_scan',
  ],
  'CAP-07': ['analytics', 'analytics_overview', 'analytics_explore'],
  'CAP-08': [
    'payment_rails_strategy',
    'payment_multi_currency',
    'stripe_integration_strategy',
  ],
  'CAP-09': ['bank_account_administration', 'bank_inbox_claims_api'],
  'CAP-10': ['tenant_brand_kit'],
  'CAP-11': ['tenant_ops_settings'],
  'CAP-12': ['permission_management_rbac', 'admin_mfa', 'admin_notifications'],
  'CAP-13': ['payment_cash'],
  'CAP-14': ['immediate_self_pickup', 'customer_self_collect', 'scheduled_pickup'],
  'CAP-15': [],
} as const satisfies Record<ProductCapabilityId, readonly EntitlementBlockKey[]>;

export const PRODUCT_CAPABILITY_BLOCK_KEYS = PRODUCT_CAPABILITY_BLOCK_MAP;

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
