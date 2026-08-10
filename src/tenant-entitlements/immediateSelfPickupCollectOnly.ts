import { axesToSimpleState } from './entitlementSimpleStateMapping.js';
import type { EntitlementBlockAxes, EntitlementBlockKey, SimpleEntitlementState } from './types.js';

function isRuntimeActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

function isRuntimeActiveAxes(axes: EntitlementBlockAxes | undefined): boolean {
  return axes !== undefined && (axes.runtimeMode === 'ALWAYS_ON' || axes.runtimeMode === 'ENABLED');
}

/**
 * Collect-only force SSOT: infra counts as inactive when not fully On
 * (`on` / ENABLED+VISIBLE+ALLOW_WRITES). softOff*, off, hardOff, and missing all force.
 */
export function isOrderPickupInfrastructureInactiveForCollectOnlyForce(
  state: SimpleEntitlementState | undefined,
): boolean {
  return state !== 'on';
}

export function isOrderPickupInfrastructureInactiveForCollectOnlyForceAxes(
  axes: EntitlementBlockAxes | undefined,
): boolean {
  if (axes === undefined) {
    return true;
  }
  if (axes.runtimeMode === 'ALWAYS_ON') {
    return !(axes.visibilityMode === 'VISIBLE' && axes.mutationMode === 'ALLOW_WRITES');
  }
  return axesToSimpleState(axes) !== 'on';
}

/** Product collect-only: inactive pickup infra + runtime-active product_vending ⇒ force immediate On. */
export function shouldForceImmediateSelfPickupCollectOnly(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): boolean {
  return (
    isOrderPickupInfrastructureInactiveForCollectOnlyForce(states.order_pickup_infrastructure) &&
    isRuntimeActiveSimpleState(states.product_vending)
  );
}

export function shouldForceImmediateSelfPickupCollectOnlyFromAxes(input: {
  readonly infraAxes: EntitlementBlockAxes | undefined;
  readonly vendingAxes: EntitlementBlockAxes | undefined;
}): boolean {
  return (
    isOrderPickupInfrastructureInactiveForCollectOnlyForceAxes(input.infraAxes) &&
    isRuntimeActiveAxes(input.vendingAxes)
  );
}
