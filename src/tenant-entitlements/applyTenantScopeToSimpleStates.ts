import { applySimpleStateDependencyImplications } from './applySimpleStateDependencyImplications.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';
import type { TenantAllowedPurposes, TenantSurfaceScope } from './tenantScopeTypes.js';

const ON: SimpleEntitlementState = 'on';
const OFF: SimpleEntitlementState = 'off';
const HARD_OFF: SimpleEntitlementState = 'hardOff';

/** Purpose axis — always locked; top „Povolené účely“ picker is the source of truth. */
export const TENANT_PURPOSE_AXIS_BLOCK_KEYS = [
  'product_vending',
  'donation',
] as const satisfies readonly EntitlementBlockKey[];

/** Surface axis — always locked; top „Aplikace zákazník a kiosk“ picker is the source of truth. */
export const TENANT_SURFACE_AXIS_BLOCK_KEYS = [
  'surface_kiosk',
  'surface_customer',
] as const satisfies readonly EntitlementBlockKey[];

/** Blocks whose SIMPLE values are overwritten by tenant scope pickers (never stored in user draft when locked). */
export const TENANT_AXIS_CONTROLLED_BLOCK_KEYS = [
  ...TENANT_PURPOSE_AXIS_BLOCK_KEYS,
  ...TENANT_SURFACE_AXIS_BLOCK_KEYS,
] as const satisfies readonly EntitlementBlockKey[];

export type TenantAxisControlledBlockKey = (typeof TENANT_AXIS_CONTROLLED_BLOCK_KEYS)[number];

function isRuntimeActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

/** Whether SIMPLE state counts as runtime-active (Zapnuto bucket in DEV policy UI). */
export function isRuntimeActiveSimpleEntitlementState(state: SimpleEntitlementState | undefined): boolean {
  return isRuntimeActiveSimpleState(state);
}

/** Default non-axis SIMPLE blocks for new tenants (both commerce + both surfaces). */
export function buildDefaultTenantScopeBaseline(): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  return {
    sales_point_management: ON,
    payment_rails_strategy: ON,
    payment_cash: ON,
    payment_reconciliation: ON,
    payments_hub_ui: ON,
    bank_inbox_claims_api: ON,
    order_pickup_infrastructure: ON,
    fulfillment_queue: ON,
    pickup_points: ON,
    immediate_self_pickup: ON,
    scheduled_pickup: OFF,
    staff_pickup_scan: ON,
    analytics_summary: ON,
    mission_control: ON,
    comms_governance: ON,
    tenant_ops_settings: ON,
    audit_logs_admin_ui: ON,
    inventory_management: OFF,
    inventory_incidents: HARD_OFF,
    loyalty_program: OFF,
    promotions_program: OFF,
  };
}

export function isAxisControlledEntitlementBlock(blockKey: EntitlementBlockKey): blockKey is TenantAxisControlledBlockKey {
  return (TENANT_AXIS_CONTROLLED_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey);
}

/** Product-commerce blocks forced off and locked when allowedPurposes is DONATION_ONLY. */
const DONATION_ONLY_PRODUCT_PICKUP_BLOCK_KEYS = [
  'order_pickup_infrastructure',
  'fulfillment_queue',
  'pickup_points',
  'immediate_self_pickup',
  'scheduled_pickup',
  'staff_pickup_scan',
  'customer_self_collect',
] as const satisfies readonly EntitlementBlockKey[];

/** Product-commerce blocks locked ON whenever product vending is part of tenant allowed purposes. */
export const TENANT_PRODUCT_PURPOSE_LOCKED_BLOCK_KEYS = [
  'inventory_management',
] as const satisfies readonly EntitlementBlockKey[];

export type TenantProductPurposeLockedBlockKey =
  (typeof TENANT_PRODUCT_PURPOSE_LOCKED_BLOCK_KEYS)[number];

export function isProductCommerceAllowed(allowedPurposes: TenantAllowedPurposes): boolean {
  return allowedPurposes === 'BOTH' || allowedPurposes === 'PRODUCT_ONLY';
}

/** SIMPLE-profile blocks forced by allowedPurposes (beyond axis product/donation). */
const DONATION_ONLY_PURPOSE_LOCKED_BLOCK_KEYS = [
  'catalog_administration',
  'inventory_management',
  'inventory_incidents',
  'loyalty_program',
  'promotions_program',
  'analytics_summary',
  'mission_control',
  'tax_management',
  'compliance_fiscal_modules',
  ...DONATION_ONLY_PRODUCT_PICKUP_BLOCK_KEYS,
] as const satisfies readonly EntitlementBlockKey[];

/** SIMPLE-profile blocks forced by surfaceScope (beyond axis kiosk/customer). */
const SURFACE_SCOPE_LOCKED_BLOCK_KEYS = [
  'customer_auth_pwa',
  'realtime_device_transport',
] as const satisfies readonly EntitlementBlockKey[];

/**
 * True when SIMPLE state is fully determined by tenant scope pickers (not editable in DEV policy UI).
 */
export function isTenantScopeLockedBlock(
  blockKey: EntitlementBlockKey,
  allowedPurposes: TenantAllowedPurposes,
  _surfaceScope: TenantSurfaceScope,
): boolean {
  if ((TENANT_PURPOSE_AXIS_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey)) {
    return true;
  }
  if ((TENANT_SURFACE_AXIS_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey)) {
    return true;
  }
  if (allowedPurposes === 'DONATION_ONLY') {
    return (DONATION_ONLY_PURPOSE_LOCKED_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey);
  }
  if (isProductCommerceAllowed(allowedPurposes)) {
    return (TENANT_PRODUCT_PURPOSE_LOCKED_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(
      blockKey,
    );
  }
  return (SURFACE_SCOPE_LOCKED_BLOCK_KEYS as readonly EntitlementBlockKey[]).includes(blockKey);
}

export function stripAxisControlledSimpleStates(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
  scope?: {
    readonly allowedPurposes: TenantAllowedPurposes;
    readonly surfaceScope: TenantSurfaceScope;
  },
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };
  for (const key of TENANT_AXIS_CONTROLLED_BLOCK_KEYS) {
    if (scope === undefined || isTenantScopeLockedBlock(key, scope.allowedPurposes, scope.surfaceScope)) {
      delete result[key];
    }
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
      result.inventory_management = ON;
      break;
    case 'DONATION_ONLY':
      result.product_vending = OFF;
      result.donation = ON;
      result.inventory_management = OFF;
      result.inventory_incidents = HARD_OFF;
      result.loyalty_program = OFF;
      result.promotions_program = OFF;
      result.catalog_administration = HARD_OFF;
      result.analytics_summary = OFF;
      result.mission_control = OFF;
      result.tax_management = OFF;
      result.compliance_fiscal_modules = OFF;
      for (const blockKey of DONATION_ONLY_PRODUCT_PICKUP_BLOCK_KEYS) {
        result[blockKey] = OFF;
      }
      break;
    case 'BOTH':
      result.product_vending = ON;
      result.donation = ON;
      result.analytics_summary = ON;
      result.mission_control = ON;
      result.pickup_points = ON;
      result.inventory_management = ON;
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
      // Customer shop catalog SSE (/events/:salesPointId) needs live transport
      // without enabling the kiosk surface (bookstore / payment-only tenants).
      result.realtime_device_transport = ON;
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
