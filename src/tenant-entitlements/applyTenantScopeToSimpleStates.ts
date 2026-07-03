import { applySimpleStateDependencyImplications } from './applySimpleStateDependencyImplications.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';
import type { TenantAllowedPurposes, TenantSurfaceScope } from './tenantScopeTypes.js';

const ON: SimpleEntitlementState = 'on';
const OFF: SimpleEntitlementState = 'off';
const HARD_OFF: SimpleEntitlementState = 'hardOff';

/** Blocks controlled exclusively by tenant scope pickers (not editable in SIMPLE profile). */
export const TENANT_AXIS_CONTROLLED_BLOCK_KEYS = [
  'product_vending',
  'donation',
  'surface_kiosk',
  'surface_customer',
] as const satisfies readonly EntitlementBlockKey[];

export type TenantAxisControlledBlockKey = (typeof TENANT_AXIS_CONTROLLED_BLOCK_KEYS)[number];

function isRuntimeActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

/** Default non-axis SIMPLE blocks for new tenants (both commerce + both surfaces). */
export function buildDefaultTenantScopeBaseline(): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  return {
    sales_point_management: ON,
    order_pickup_infrastructure: ON,
    pickup_points: ON,
    immediate_self_pickup: ON,
    scheduled_pickup: OFF,
    staff_pickup_scan: ON,
    analytics_summary: ON,
    comms_governance: ON,
    tenant_ops_settings: ON,
    inventory_management: OFF,
    loyalty_program: OFF,
  };
}

export function isAxisControlledEntitlementBlock(blockKey: EntitlementBlockKey): blockKey is TenantAxisControlledBlockKey {
  return (TENANT_AXIS_CONTROLLED_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey);
}

export function stripAxisControlledSimpleStates(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };
  for (const key of TENANT_AXIS_CONTROLLED_BLOCK_KEYS) {
    delete result[key];
  }
  return result;
}

function applyAllowedPurposesToStates(
  allowedPurposes: TenantAllowedPurposes,
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result = { ...states };
  switch (allowedPurposes) {
    case 'PRODUCT_ONLY':
      result.product_vending = ON;
      result.donation = OFF;
      break;
    case 'DONATION_ONLY':
      result.product_vending = OFF;
      result.donation = ON;
      result.inventory_management = OFF;
      result.loyalty_program = OFF;
      result.catalog_administration = HARD_OFF;
      result.analytics_summary = OFF;
      result.pickup_points = OFF;
      break;
    case 'BOTH':
      result.product_vending = ON;
      result.donation = ON;
      result.analytics_summary = ON;
      result.pickup_points = ON;
      break;
  }
  return result;
}

function applySurfaceScopeToStates(
  surfaceScope: TenantSurfaceScope,
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result = { ...states };
  switch (surfaceScope) {
    case 'KIOSK_ONLY':
      result.surface_kiosk = ON;
      result.surface_customer = OFF;
      result.customer_auth_pwa = OFF;
      result.realtime_device_transport = ON;
      break;
    case 'CUSTOMER_ONLY':
      result.surface_kiosk = OFF;
      result.surface_customer = ON;
      result.customer_auth_pwa = ON;
      result.realtime_device_transport = OFF;
      break;
    case 'BOTH':
      result.surface_kiosk = ON;
      result.surface_customer = ON;
      result.customer_auth_pwa = ON;
      result.realtime_device_transport = ON;
      break;
  }
  return result;
}

/** Applies tenant commerce + surface scope onto SIMPLE states (axis blocks overwritten). */
export function applyTenantScopeToSimpleStates(
  allowedPurposes: TenantAllowedPurposes,
  surfaceScope: TenantSurfaceScope,
  current?: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const base = {
    ...buildDefaultTenantScopeBaseline(),
    ...current,
  };
  const withCommerce = applyAllowedPurposesToStates(allowedPurposes, base);
  const withSurfaces = applySurfaceScopeToStates(surfaceScope, withCommerce);
  return applySimpleStateDependencyImplications(withSurfaces);
}

export function inferAllowedPurposesFromSimpleStates(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): TenantAllowedPurposes {
  const productOn = isRuntimeActiveSimpleState(states.product_vending);
  const donationOn = isRuntimeActiveSimpleState(states.donation);
  if (productOn && donationOn) {
    return 'BOTH';
  }
  if (donationOn) {
    return 'DONATION_ONLY';
  }
  if (productOn) {
    return 'PRODUCT_ONLY';
  }
  return 'BOTH';
}

export function inferSurfaceScopeFromSimpleStates(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): TenantSurfaceScope {
  const kioskOn = isRuntimeActiveSimpleState(states.surface_kiosk);
  const customerOn = isRuntimeActiveSimpleState(states.surface_customer);
  if (kioskOn && customerOn) {
    return 'BOTH';
  }
  if (kioskOn) {
    return 'KIOSK_ONLY';
  }
  if (customerOn) {
    return 'CUSTOMER_ONLY';
  }
  return 'BOTH';
}
