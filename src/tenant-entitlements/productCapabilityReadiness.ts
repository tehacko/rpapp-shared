/**
 * Product-capability readiness (FR-03 / I-01).
 *
 * Catalog is 50 entitlement blocks at catalogVersion 10.
 * SIMPLE on/softOffVisible/softOffHidden/off/hardOff collapse to READY vs NOT_READY.
 * Declared 15×4 grids are plan G8 production / test-mode (`explicitDevEnable`).
 * CAP-15 Partner API is always NOT_READY (never-activate) on every surface.
 *
 * NEVER import admin-app or up-backend into this module.
 */
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';
import {
  entitlementBlockKeysForProductCapability,
  isNeverActivateProductCapability,
  type ProductCapabilityId,
} from './productCapabilityMap.js';

export type ProductCapabilityReadiness = 'READY' | 'NOT_READY';

export const PRODUCT_CAPABILITY_SURFACES = [
  'admin_staff_ops',
  'kiosk_kiosk_device',
  'customer_mobile_shop',
  'pickup_staff_ops',
] as const;

export type ProductCapabilitySurface = (typeof PRODUCT_CAPABILITY_SURFACES)[number];

/** Short aliases matching G8 column order (admin / kiosk / customer / pickup). */
export const PRODUCT_READINESS_SURFACES = ['admin', 'kiosk', 'customer', 'pickup'] as const;
export type ProductReadinessSurface = (typeof PRODUCT_READINESS_SURFACES)[number];

export type ProductReadinessMode = 'production' | 'test';

export const PRODUCT_CAPABILITY_GRID_CELLS = [
  'READY',
  'PARTIAL',
  'TEST',
  'NOT_READY',
  'n_a',
] as const;

export type ProductCapabilityGridCell = (typeof PRODUCT_CAPABILITY_GRID_CELLS)[number];
export type ProductCapabilityReadinessState = ProductCapabilityGridCell;

type ProductCapabilityGridRow = Record<ProductCapabilitySurface, ProductCapabilityGridCell>;

const SHORT_TO_PLAN_SURFACE: Record<ProductReadinessSurface, ProductCapabilitySurface> = {
  admin: 'admin_staff_ops',
  kiosk: 'kiosk_kiosk_device',
  customer: 'customer_mobile_shop',
  pickup: 'pickup_staff_ops',
};

export function normalizeProductCapabilitySurface(
  surface: ProductCapabilitySurface | ProductReadinessSurface,
): ProductCapabilitySurface {
  if (surface === 'admin' || surface === 'kiosk' || surface === 'customer' || surface === 'pickup') {
    return SHORT_TO_PLAN_SURFACE[surface];
  }
  return surface;
}

/** Plan G8 production 15×4. */
export const PRODUCT_CAPABILITY_PRODUCTION_GRID = {
  'CAP-01': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-02': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'PARTIAL',
    customer_mobile_shop: 'PARTIAL',
    pickup_staff_ops: 'n_a',
  },
  'CAP-03': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'n_a',
  },
  'CAP-04': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'n_a',
  },
  'CAP-05': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'n_a',
  },
  'CAP-06': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-07': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'NOT_READY',
    customer_mobile_shop: 'NOT_READY',
    pickup_staff_ops: 'NOT_READY',
  },
  'CAP-08': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'PARTIAL',
    customer_mobile_shop: 'PARTIAL',
    pickup_staff_ops: 'n_a',
  },
  'CAP-09': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-10': {
    admin_staff_ops: 'TEST',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'TEST',
    pickup_staff_ops: 'n_a',
  },
  'CAP-11': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-12': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-13': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'READY',
  },
  'CAP-14': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'PARTIAL',
    customer_mobile_shop: 'PARTIAL',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-15': {
    admin_staff_ops: 'NOT_READY',
    kiosk_kiosk_device: 'NOT_READY',
    customer_mobile_shop: 'NOT_READY',
    pickup_staff_ops: 'NOT_READY',
  },
} as const satisfies Record<ProductCapabilityId, ProductCapabilityGridRow>;

/** Plan G8 test-mode 15×4 (`explicitDevEnable`). */
export const PRODUCT_CAPABILITY_TEST_MODE_GRID = {
  'CAP-01': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-02': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'PARTIAL',
    customer_mobile_shop: 'PARTIAL',
    pickup_staff_ops: 'n_a',
  },
  'CAP-03': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'n_a',
  },
  'CAP-04': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'n_a',
  },
  'CAP-05': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'TEST',
    pickup_staff_ops: 'n_a',
  },
  'CAP-06': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-07': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'NOT_READY',
    customer_mobile_shop: 'NOT_READY',
    pickup_staff_ops: 'NOT_READY',
  },
  'CAP-08': {
    admin_staff_ops: 'TEST',
    kiosk_kiosk_device: 'TEST',
    customer_mobile_shop: 'TEST',
    pickup_staff_ops: 'n_a',
  },
  'CAP-09': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-10': {
    admin_staff_ops: 'TEST',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'TEST',
    pickup_staff_ops: 'n_a',
  },
  'CAP-11': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-12': {
    admin_staff_ops: 'TEST',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'n_a',
  },
  'CAP-13': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'READY',
  },
  'CAP-14': {
    admin_staff_ops: 'PARTIAL',
    kiosk_kiosk_device: 'PARTIAL',
    customer_mobile_shop: 'PARTIAL',
    pickup_staff_ops: 'PARTIAL',
  },
  'CAP-15': {
    admin_staff_ops: 'NOT_READY',
    kiosk_kiosk_device: 'NOT_READY',
    customer_mobile_shop: 'NOT_READY',
    pickup_staff_ops: 'NOT_READY',
  },
} as const satisfies Record<ProductCapabilityId, ProductCapabilityGridRow>;

export function simpleEntitlementStateToProductReadiness(
  state: SimpleEntitlementState,
): ProductCapabilityReadiness {
  return state === 'on' ? 'READY' : 'NOT_READY';
}

export function collapseProductCapabilityGridCell(
  cell: ProductCapabilityGridCell,
  options?: { readonly explicitDevEnable?: boolean },
): ProductCapabilityReadiness {
  if (cell === 'READY') {
    return 'READY';
  }
  if (cell === 'TEST' && options?.explicitDevEnable === true) {
    return 'READY';
  }
  return 'NOT_READY';
}

export function resolveProductReadinessMode(
  explicitDevEnable: boolean | undefined,
): ProductReadinessMode {
  return explicitDevEnable === true ? 'test' : 'production';
}

export function getDeclaredProductCapabilityGridCell(
  capabilityId: ProductCapabilityId,
  surface: ProductCapabilitySurface | ProductReadinessSurface,
  options?: { readonly explicitDevEnable?: boolean; readonly mode?: ProductReadinessMode },
): ProductCapabilityGridCell {
  const mode = options?.mode ?? resolveProductReadinessMode(options?.explicitDevEnable);
  const grid = mode === 'test' ? PRODUCT_CAPABILITY_TEST_MODE_GRID : PRODUCT_CAPABILITY_PRODUCTION_GRID;
  return grid[capabilityId][normalizeProductCapabilitySurface(surface)];
}

export function declaredProductCapabilityReadiness(
  capabilityId: ProductCapabilityId,
  surface: ProductCapabilitySurface | ProductReadinessSurface,
  options?: { readonly explicitDevEnable?: boolean; readonly mode?: ProductReadinessMode },
): ProductCapabilityReadiness {
  if (isNeverActivateProductCapability(capabilityId)) {
    return 'NOT_READY';
  }
  const explicitDevEnable =
    options?.explicitDevEnable === true || options?.mode === 'test';
  return collapseProductCapabilityGridCell(
    getDeclaredProductCapabilityGridCell(capabilityId, surface, options),
    { explicitDevEnable },
  );
}

function mappedBlocksAreSimpleOn(
  capabilityId: ProductCapabilityId,
  simpleStates: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): boolean {
  const blockKeys = entitlementBlockKeysForProductCapability(capabilityId);
  if (blockKeys.length === 0) {
    return false;
  }
  return blockKeys.every((blockKey) => simpleStates[blockKey] === 'on');
}

export type EvaluateProductCapabilityReadinessInput = {
  readonly capabilityId: ProductCapabilityId;
  readonly surface: ProductCapabilitySurface | ProductReadinessSurface;
  readonly explicitDevEnable?: boolean;
  readonly mode?: ProductReadinessMode;
  readonly simpleStates?: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>;
};

/**
 * Declared G8 grid (production vs test-mode) AND optional SIMPLE `on` for every
 * mapped block. CAP-15 is NOT_READY even when SIMPLE is `on` and test-mode is on.
 */
export function evaluateProductCapabilityReadiness(
  input: EvaluateProductCapabilityReadinessInput,
): ProductCapabilityReadiness {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    return 'NOT_READY';
  }
  const declared = declaredProductCapabilityReadiness(input.capabilityId, input.surface, {
    explicitDevEnable: input.explicitDevEnable,
    mode: input.mode,
  });
  if (declared === 'NOT_READY') {
    return 'NOT_READY';
  }
  if (input.simpleStates !== undefined && !mappedBlocksAreSimpleOn(input.capabilityId, input.simpleStates)) {
    return 'NOT_READY';
  }
  return 'READY';
}

export function isPartnerApiNeverActivate(capabilityId: ProductCapabilityId): boolean {
  return isNeverActivateProductCapability(capabilityId);
}

export function getProductCapabilityReadiness(input: {
  readonly capabilityId: ProductCapabilityId;
  readonly surface: ProductCapabilitySurface | ProductReadinessSurface;
  readonly mode?: ProductReadinessMode;
  readonly explicitDevEnable?: boolean;
}): ProductCapabilityReadinessState {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    return 'NOT_READY';
  }
  return getDeclaredProductCapabilityGridCell(input.capabilityId, input.surface, {
    mode: input.mode,
    explicitDevEnable: input.explicitDevEnable,
  });
}

export function isProductCapabilityActivable(input: {
  readonly capabilityId: ProductCapabilityId;
  readonly surface: ProductCapabilitySurface | ProductReadinessSurface;
  readonly mode?: ProductReadinessMode;
  readonly explicitDevEnable?: boolean;
}): boolean {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    return false;
  }
  const state = getProductCapabilityReadiness(input);
  if (state === 'n_a' || state === 'NOT_READY') {
    return false;
  }
  if (state === 'TEST') {
    const mode = input.mode ?? resolveProductReadinessMode(input.explicitDevEnable);
    return mode === 'test';
  }
  return state === 'READY' || state === 'PARTIAL';
}
