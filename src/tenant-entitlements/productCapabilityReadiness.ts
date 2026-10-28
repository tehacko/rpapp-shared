/**
 * Product-capability readiness (FR-03 / I-01).
 *
 * Catalog is 60 entitlement blocks at catalogVersion 14.
 * SIMPLE on/softOffVisible/softOffHidden/off/hardOff collapse to READY vs NOT_READY.
 * Declared 15×4 grids are plan G8 production / test-mode (`explicitDevEnable`).
 * CAP-15 Partner API is always NOT_READY (never-activate) on every surface.
 *
 * NEVER import admin-app or up-backend into this module.
 */
import { getEntitlementBlockCatalogEntry } from './catalog.js';
import type {
  EntitlementBlockKey,
  EntitlementRuntimeMode,
  SimpleEntitlementState,
} from './types.js';
import {
  entitlementBlockKeysForProductCapability,
  isNeverActivateProductCapability,
  productCapabilityIdForEntitlementBlock,
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
    // Admin catalog / products / inventory APIs are shipped — PARTIAL here
    // false-403s ENFORCE admin reads while commercial policy ALLOW (nav shows, API denies).
    admin_staff_ops: 'READY',
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
    // Pickup ops cluster (OPI / queue / points / staff scan) ships — READY so FREE
    // default baseline keeps all service modes on after needs-wizard retirement.
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'n_a',
    customer_mobile_shop: 'n_a',
    pickup_staff_ops: 'READY',
  },
  'CAP-07': {
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'NOT_READY',
    customer_mobile_shop: 'NOT_READY',
    pickup_staff_ops: 'NOT_READY',
  },
  'CAP-08': {
    // Bank QR / gateway checkout + admin rail wiring ship — PARTIAL false-403s ENFORCE
    // on `payment_rails_strategy` while tenantEntitlementPolicy blocks are ENABLED (e2e-commerce).
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
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
    // Pickup LATER / pickup-slots / self-collect ship — PARTIAL false-403s ENFORCE reads
    // while tenantEntitlementPolicy scheduled_pickup is ENABLED (ENV-03 / e2e-commerce).
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'READY',
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
    admin_staff_ops: 'READY',
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
    admin_staff_ops: 'READY',
    kiosk_kiosk_device: 'READY',
    customer_mobile_shop: 'READY',
    pickup_staff_ops: 'READY',
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
  /**
   * Platform DEV readiness override (merged via `mergeReadinessCell` before collapse).
   * Null/undefined → code-declared grid only.
   */
  readonly override?: ProductCapabilityGridCell | null;
};

/**
 * Effective G8 cell (code default merged with optional platform override) AND optional
 * SIMPLE `on` for every mapped block. CAP-15 is NOT_READY even when SIMPLE is `on`
 * and test-mode is on.
 */
export function evaluateProductCapabilityReadiness(
  input: EvaluateProductCapabilityReadinessInput,
): ProductCapabilityReadiness {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    return 'NOT_READY';
  }
  const effectiveCell = getProductCapabilityReadiness({
    capabilityId: input.capabilityId,
    surface: input.surface,
    mode: input.mode,
    explicitDevEnable: input.explicitDevEnable,
    override: input.override,
  });
  const explicitDevEnable =
    input.explicitDevEnable === true || input.mode === 'test';
  const collapsed = collapseProductCapabilityGridCell(effectiveCell, { explicitDevEnable });
  if (collapsed === 'NOT_READY') {
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
  /** Platform DEV override — merged with declared cell via `mergeReadinessCell`. */
  readonly override?: ProductCapabilityGridCell | null;
}): ProductCapabilityReadinessState {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    return 'NOT_READY';
  }
  const declared = getDeclaredProductCapabilityGridCell(input.capabilityId, input.surface, {
    mode: input.mode,
    explicitDevEnable: input.explicitDevEnable,
  });
  const merged = mergeReadinessCell({
    capabilityId: input.capabilityId,
    declared,
    override: input.override,
  });
  return merged.cell;
}

/**
 * Production-activable iff collapsed readiness is READY.
 * PARTIAL / NOT_READY / n_a never activate. TEST activates only in explicit test mode
 * (`mode: 'test'` or `explicitDevEnable: true`) via the same collapse as
 * `evaluateProductCapabilityReadiness`.
 */
export function isProductCapabilityActivable(input: {
  readonly capabilityId: ProductCapabilityId;
  readonly surface: ProductCapabilitySurface | ProductReadinessSurface;
  readonly mode?: ProductReadinessMode;
  readonly explicitDevEnable?: boolean;
  /** Platform DEV override — merged before READY collapse. */
  readonly override?: ProductCapabilityGridCell | null;
}): boolean {
  return evaluateProductCapabilityReadiness(input) === 'READY';
}

/**
 * Wire deny kind for a non-activable G8 cell (Package F / F-AC-42).
 * PARTIAL / TEST → READINESS (product not production-ready).
 * NOT_READY / n_a / never-activate → TECHNICAL (rollout / surface N/A).
 */
export type ProductCapabilityAccessDenyKind = 'READINESS' | 'TECHNICAL';

export function clientAccessDenyKindForProductCapabilityGridCell(
  cell: ProductCapabilityGridCell,
): ProductCapabilityAccessDenyKind {
  if (cell === 'PARTIAL' || cell === 'TEST') {
    return 'READINESS';
  }
  return 'TECHNICAL';
}

/**
 * Pre-union readiness/technical axis for an entitlement block (same signal as
 * `isBlockReadinessDenied` in requireEntitled). Unmapped blocks → undefined
 * (no readiness axis). Activable → undefined. Otherwise READINESS or TECHNICAL.
 */
export function resolveBlockProductCapabilityDenyKind(input: {
  readonly blockKey: EntitlementBlockKey;
  readonly surface: ProductCapabilitySurface | ProductReadinessSurface;
  readonly mode?: ProductReadinessMode;
  readonly explicitDevEnable?: boolean;
  /** Platform DEV override for this capability×surface×mode. */
  readonly override?: ProductCapabilityGridCell | null;
}): ProductCapabilityAccessDenyKind | undefined {
  const capabilityId = productCapabilityIdForEntitlementBlock(input.blockKey);
  if (capabilityId === undefined) {
    return undefined;
  }
  if (
    isProductCapabilityActivable({
      capabilityId,
      surface: input.surface,
      mode: input.mode,
      explicitDevEnable: input.explicitDevEnable,
      override: input.override,
    })
  ) {
    return undefined;
  }
  if (isNeverActivateProductCapability(capabilityId)) {
    return 'TECHNICAL';
  }
  const cell = getProductCapabilityReadiness({
    capabilityId,
    surface: input.surface,
    mode: input.mode,
    explicitDevEnable: input.explicitDevEnable,
    override: input.override,
  });
  return clientAccessDenyKindForProductCapabilityGridCell(cell);
}

export type ResolveProductCapabilityReadinessOverride = (
  surface: ProductReadinessSurface,
) => ProductCapabilityGridCell | null | undefined;

/**
 * Production persist/create/editor may ENABLE a capability only when at least one
 * G8 production cell is READY (`isProductCapabilityActivable` / mode production).
 * PARTIAL / TEST / NOT_READY / n_a / CAP-15 never persist as ENABLE.
 */
export function isProductCapabilityProductionEnableAllowed(
  capabilityId: ProductCapabilityId,
  options?: {
    readonly resolveOverride?: ResolveProductCapabilityReadinessOverride;
  },
): boolean {
  if (isNeverActivateProductCapability(capabilityId)) {
    return false;
  }
  return PRODUCT_READINESS_SURFACES.some((surface) =>
    isProductCapabilityActivable({
      capabilityId,
      surface,
      mode: 'production',
      override: options?.resolveOverride?.(surface) ?? null,
    }),
  );
}

/** Unmapped leftover blocks stay persistable; mapped blocks follow G8 READY-only. */
export function isEntitlementBlockProductionEnableAllowed(
  blockKey: EntitlementBlockKey,
  options?: {
    readonly resolveOverride?: ResolveProductCapabilityReadinessOverride;
  },
): boolean {
  const capabilityId = productCapabilityIdForEntitlementBlock(blockKey);
  if (capabilityId === undefined) {
    return true;
  }
  const blockClass = getEntitlementBlockCatalogEntry(blockKey).blockClass;
  if (blockClass === 'CORE_REQUIRED' || blockClass === 'CORE_IMMUTABLE') {
    return true;
  }
  return isProductCapabilityProductionEnableAllowed(capabilityId, options);
}

/**
 * Test-mode / pretest Max-On enable: at least one G8 **test-grid** cell collapses to READY
 * (READY, or TEST→READY via OR synonym `mode:'test'` + `explicitDevEnable:true`).
 * PARTIAL / NOT_READY / n_a / CAP-15 never enable.
 */
export function isProductCapabilityTestModeEnableAllowed(
  capabilityId: ProductCapabilityId,
  options?: {
    readonly resolveOverride?: ResolveProductCapabilityReadinessOverride;
  },
): boolean {
  if (isNeverActivateProductCapability(capabilityId)) {
    return false;
  }
  return PRODUCT_READINESS_SURFACES.some((surface) =>
    isProductCapabilityActivable({
      capabilityId,
      surface,
      mode: 'test',
      explicitDevEnable: true,
      override: options?.resolveOverride?.(surface) ?? null,
    }),
  );
}

/** Unmapped leftover blocks stay enable-allowed; mapped blocks follow test-grid collapse. */
export function isEntitlementBlockTestModeEnableAllowed(
  blockKey: EntitlementBlockKey,
  options?: {
    readonly resolveOverride?: ResolveProductCapabilityReadinessOverride;
  },
): boolean {
  const capabilityId = productCapabilityIdForEntitlementBlock(blockKey);
  if (capabilityId === undefined) {
    return true;
  }
  const blockClass = getEntitlementBlockCatalogEntry(blockKey).blockClass;
  if (blockClass === 'CORE_REQUIRED' || blockClass === 'CORE_IMMUTABLE') {
    return true;
  }
  return isProductCapabilityTestModeEnableAllowed(capabilityId, options);
}

export type MergeReadinessCellRejectReason = 'CAP_15_NEVER_ACTIVATE' | 'N_A_IMMUTABLE';

export type MergeReadinessCellResult =
  | { readonly ok: true; readonly cell: ProductCapabilityGridCell }
  | {
      readonly ok: false;
      readonly reason: MergeReadinessCellRejectReason;
      readonly cell: ProductCapabilityGridCell;
    };

/**
 * Merge a platform readiness override into a declared G8 cell.
 * CAP-15 is always NOT_READY (never-activate) — any non-NOT_READY override is rejected.
 * Declared `n_a` is surface-scoped immutable — any non-`n_a` override is rejected.
 * When override is null/undefined, returns the declared cell (CAP-15 forced to NOT_READY).
 */
export function mergeReadinessCell(input: {
  readonly capabilityId: ProductCapabilityId;
  readonly declared: ProductCapabilityGridCell;
  readonly override?: ProductCapabilityGridCell | null;
}): MergeReadinessCellResult {
  if (isNeverActivateProductCapability(input.capabilityId)) {
    const override = input.override;
    if (override !== undefined && override !== null && override !== 'NOT_READY') {
      return { ok: false, reason: 'CAP_15_NEVER_ACTIVATE', cell: 'NOT_READY' };
    }
    return { ok: true, cell: 'NOT_READY' };
  }

  if (input.declared === 'n_a') {
    const override = input.override;
    if (override !== undefined && override !== null && override !== 'n_a') {
      return { ok: false, reason: 'N_A_IMMUTABLE', cell: 'n_a' };
    }
    return { ok: true, cell: 'n_a' };
  }

  if (input.override === undefined || input.override === null) {
    return { ok: true, cell: input.declared };
  }

  return { ok: true, cell: input.override };
}

export function clampSimpleStatesToProductionEnableAllowed(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  let changed = false;
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };
  for (const [rawKey, state] of Object.entries(result)) {
    const blockKey = rawKey as EntitlementBlockKey;
    if (state !== 'on') {
      continue;
    }
    // CAP-02 PARTIAL: donation must clamp to off even though it is a purpose-axis key.
    // product_vending stays on via CAP-01 READY — do not exempt the whole purpose axis.
    if (isEntitlementBlockProductionEnableAllowed(blockKey)) {
      continue;
    }
    result[blockKey] = 'off';
    changed = true;
  }
  return changed ? result : states;
}

export type ProductionEnableDeniedPolicyRow = {
  readonly blockKey: EntitlementBlockKey;
  readonly runtimeMode: EntitlementRuntimeMode;
  readonly capabilityId: ProductCapabilityId;
};

export function collectDeniedProductionEnablePolicyRows(
  policies: readonly {
    readonly blockKey: EntitlementBlockKey;
    readonly runtimeMode: EntitlementRuntimeMode;
  }[],
): readonly ProductionEnableDeniedPolicyRow[] {
  const denied: ProductionEnableDeniedPolicyRow[] = [];
  for (const row of policies) {
    if (row.runtimeMode !== 'ENABLED' && row.runtimeMode !== 'ALWAYS_ON') {
      continue;
    }
    if (isEntitlementBlockProductionEnableAllowed(row.blockKey)) {
      continue;
    }
    const capabilityId = productCapabilityIdForEntitlementBlock(row.blockKey);
    if (capabilityId === undefined) {
      continue;
    }
    denied.push({
      blockKey: row.blockKey,
      runtimeMode: row.runtimeMode,
      capabilityId,
    });
  }
  return denied;
}
