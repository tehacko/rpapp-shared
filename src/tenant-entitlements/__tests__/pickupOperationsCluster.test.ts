import { applySimpleStateDependencyImplications } from '../applySimpleStateDependencyImplications.js';
import { applyTenantScopeToSimpleStates } from '../applyTenantScopeToSimpleStates.js';
import {
  isPickupOperationsClusterFollower,
  PICKUP_OPERATIONS_CLUSTER_LEADER,
} from '../pickupOperationsCluster.js';

describe('pickup operations cluster', () => {
  it('syncs follower blocks from order_pickup_infrastructure leader', () => {
    const states = applySimpleStateDependencyImplications({
      order_pickup_infrastructure: 'off',
      fulfillment_queue: 'on',
      pickup_points: 'on',
      staff_pickup_scan: 'on',
    });

    expect(states.fulfillment_queue).toBe('off');
    expect(states.pickup_points).toBe('off');
    expect(states.staff_pickup_scan).toBe('off');
  });

  it('keeps followers on when leader is on', () => {
    const states = applySimpleStateDependencyImplications({
      order_pickup_infrastructure: 'on',
      fulfillment_queue: 'off',
      pickup_points: 'off',
      staff_pickup_scan: 'off',
    });

    expect(states.fulfillment_queue).toBe('on');
    expect(states.pickup_points).toBe('on');
    expect(states.staff_pickup_scan).toBe('on');
  });

  it('marks followers as non-leader cluster members', () => {
    expect(isPickupOperationsClusterFollower(PICKUP_OPERATIONS_CLUSTER_LEADER)).toBe(false);
    expect(isPickupOperationsClusterFollower('fulfillment_queue')).toBe(true);
    expect(isPickupOperationsClusterFollower('pickup_points')).toBe(true);
    expect(isPickupOperationsClusterFollower('staff_pickup_scan')).toBe(true);
  });

  it('forces fulfillment_queue off for DONATION_ONLY scope', () => {
    const states = applyTenantScopeToSimpleStates('DONATION_ONLY', 'BOTH');
    expect(states.fulfillment_queue).toBe('off');
    expect(states.order_pickup_infrastructure).toBe('off');
  });
});
