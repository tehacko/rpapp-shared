import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';

/** Pickup ops blocks that share one SIMPLE preset (leader drives followers). */
export const PICKUP_OPERATIONS_CLUSTER_BLOCK_KEYS = [
  'order_pickup_infrastructure',
  'fulfillment_queue',
  'pickup_points',
  'staff_pickup_scan',
] as const satisfies readonly EntitlementBlockKey[];

export const PICKUP_OPERATIONS_CLUSTER_LEADER: EntitlementBlockKey = 'order_pickup_infrastructure';

export function isPickupOperationsClusterBlock(blockKey: EntitlementBlockKey): boolean {
  return (PICKUP_OPERATIONS_CLUSTER_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey);
}

export function isPickupOperationsClusterFollower(blockKey: EntitlementBlockKey): boolean {
  return isPickupOperationsClusterBlock(blockKey) && blockKey !== PICKUP_OPERATIONS_CLUSTER_LEADER;
}

/** Mirrors leader SIMPLE state onto fulfillment_queue, pickup_points, staff_pickup_scan. */
export function applyPickupOperationsClusterSync(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result = { ...states };
  const leaderState = result[PICKUP_OPERATIONS_CLUSTER_LEADER];
  if (leaderState === undefined) {
    return result;
  }
  for (const blockKey of PICKUP_OPERATIONS_CLUSTER_BLOCK_KEYS) {
    if (blockKey !== PICKUP_OPERATIONS_CLUSTER_LEADER) {
      result[blockKey] = leaderState;
    }
  }
  return result;
}
