import { applyCatalogParentDenialImplications } from './catalogParentSatisfaction.js';
import { shouldForceImmediateSelfPickupCollectOnly } from './immediateSelfPickupCollectOnly.js';
import { applyPickupOperationsClusterSync } from './pickupOperationsCluster.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';

const ANALYTICS_UMBRELLA_CHILD_KEYS = [
  'analytics_overview',
  'analytics_explore',
] as const satisfies readonly EntitlementBlockKey[];

function isRuntimeActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

function applyAnalyticsClusterImplications(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };

  const anyAnalyticsChildActive = ANALYTICS_UMBRELLA_CHILD_KEYS.some((blockKey) =>
    isRuntimeActiveSimpleState(result[blockKey]),
  );
  if (anyAnalyticsChildActive) {
    result.analytics = 'on';
  }

  return result;
}

/**
 * Applies commerce-cluster implications (plan §7.2 V-02, V-03, LOY-V01) before SIMPLE → axis mapping.
 * Keeps hidden blocks (e.g. catalog_administration, product_barcode_administration)
 * consistent with visible SIMPLE toggles.
 */
export function applySimpleStateDependencyImplications(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };

  const vendingActive = isRuntimeActiveSimpleState(result.product_vending);
  const loyaltyActive = isRuntimeActiveSimpleState(result.loyalty_program);
  const promotionsActive = isRuntimeActiveSimpleState(result.promotions_program);

  // inventory_incidents is a catalog child of inventory_management (PARENT-01 cascade-off).
  // Child On must not imply parent On — inventory_management stays purpose-locked.
  const inventoryActive = isRuntimeActiveSimpleState(result.inventory_management);

  if (inventoryActive) {
    if (!vendingActive) {
      result.product_vending = 'on';
    }
    result.sales_point_management = 'on';
  }

  if (loyaltyActive && !isRuntimeActiveSimpleState(result.product_vending)) {
    result.product_vending = 'on';
  }

  if (promotionsActive && !isRuntimeActiveSimpleState(result.product_vending)) {
    result.product_vending = 'on';
  }

  const vendingActiveAfterImplied = isRuntimeActiveSimpleState(result.product_vending);
  const donationActiveAfterImplied = isRuntimeActiveSimpleState(result.donation);

  if (vendingActiveAfterImplied) {
    const catalog = result.catalog_administration;
    if (catalog === undefined || catalog === 'off' || catalog === 'hardOff') {
      result.catalog_administration = 'on';
    }
    const barcode = result.product_barcode_administration;
    if (barcode === undefined || barcode === 'off' || barcode === 'hardOff') {
      result.product_barcode_administration = 'on';
    }
  } else if (donationActiveAfterImplied) {
    const catalog = result.catalog_administration;
    if (catalog === undefined || catalog === 'off') {
      result.catalog_administration = 'hardOff';
    }
    const barcode = result.product_barcode_administration;
    if (barcode === undefined || barcode === 'off') {
      result.product_barcode_administration = 'hardOff';
    }
  }

  const withAnalytics = applyAnalyticsClusterImplications(result);
  const withPickup = applyPickupOperationsClusterSync(withAnalytics);

  // Collect-only path: inactive pickup-ops infra (off/hardOff/softOff*/missing) must not
  // leave product tenants without a handoff. Force immediate On (not a child of infra).
  if (shouldForceImmediateSelfPickupCollectOnly(withPickup)) {
    withPickup.immediate_self_pickup = 'on';
  }

  // Last: catalog parent gates — children cannot stay runtime-active when parents are Off.
  return applyCatalogParentDenialImplications(withPickup);
}
