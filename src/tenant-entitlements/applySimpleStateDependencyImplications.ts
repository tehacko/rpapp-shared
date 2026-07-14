import { applyPickupOperationsClusterSync } from './pickupOperationsCluster.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';

const ANALYTICS_UMBRELLA_CHILD_KEYS = [
  'analytics_summary',
  'analytics_detailed',
  'analytics_benchmark',
  'mission_control',
  'analytics_pii',
  'customer_behavior_funnels',
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

  if (isRuntimeActiveSimpleState(result.mission_control)) {
    result.analytics_detailed = 'on';
  }

  if (!isRuntimeActiveSimpleState(result.analytics_detailed)) {
    result.mission_control = 'off';
    result.analytics_pii = 'off';
    result.customer_behavior_funnels = 'off';
  }

  return result;
}

/**
 * Applies commerce-cluster implications (plan §7.2 V-02, V-03, LOY-V01) before SIMPLE → axis mapping.
 * Keeps hidden blocks (e.g. catalog_administration) consistent with visible SIMPLE toggles.
 */
export function applySimpleStateDependencyImplications(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };

  const vendingActive = isRuntimeActiveSimpleState(result.product_vending);
  const inventoryActive = isRuntimeActiveSimpleState(result.inventory_management);
  const loyaltyActive = isRuntimeActiveSimpleState(result.loyalty_program);

  if (inventoryActive) {
    if (!vendingActive) {
      result.product_vending = 'on';
    }
    result.sales_point_management = 'on';
  }

  if (loyaltyActive && !isRuntimeActiveSimpleState(result.product_vending)) {
    result.product_vending = 'on';
  }

  const vendingActiveAfterImplied = isRuntimeActiveSimpleState(result.product_vending);
  const donationActiveAfterImplied = isRuntimeActiveSimpleState(result.donation);

  if (vendingActiveAfterImplied) {
    const catalog = result.catalog_administration;
    if (catalog === undefined || catalog === 'off' || catalog === 'hardOff') {
      result.catalog_administration = 'on';
    }
  } else if (donationActiveAfterImplied) {
    const catalog = result.catalog_administration;
    if (catalog === undefined || catalog === 'off') {
      result.catalog_administration = 'hardOff';
    }
  }

  const withAnalytics = applyAnalyticsClusterImplications(result);
  return applyPickupOperationsClusterSync(withAnalytics);
}
