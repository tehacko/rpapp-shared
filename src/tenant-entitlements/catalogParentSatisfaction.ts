/**
 * Catalog parent satisfaction for SIMPLE entitlement drafts.
 * SSOT for AND/OR + optionalParentKeys + requiredParentKeys — used by editor, save PARENT-01, and runtime resolver.
 */
import { TENANT_ENTITLEMENT_BLOCK_CATALOG, getEntitlementBlockCatalogEntry } from './catalog.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from './types.js';

function isRuntimeActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

/**
 * Whether a parent block counts as runtime-active for catalog parent gates.
 * CORE_REQUIRED / CORE_IMMUTABLE / immutableDefaults are always treated as active
 * (they are not authored as SIMPLE toggles the same way).
 */
export function isEntitlementParentRuntimeActive(
  blockKey: EntitlementBlockKey,
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): boolean {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  if (entry.blockClass === 'CORE_REQUIRED' || entry.blockClass === 'CORE_IMMUTABLE') {
    return true;
  }
  if (entry.immutableDefaults !== undefined) {
    return entry.immutableDefaults.runtimeMode === 'ENABLED' ||
      entry.immutableDefaults.runtimeMode === 'ALWAYS_ON';
  }
  return isRuntimeActiveSimpleState(states[blockKey]);
}

/**
 * Core catalog parent-gate predicate. Callers supply how each parent is considered active
 * (SIMPLE states, axes map, recursive entitled, etc.).
 */
export function areEntitlementBlockParentsSatisfiedBy(
  blockKey: EntitlementBlockKey,
  isParentActive: (parentKey: EntitlementBlockKey) => boolean,
): boolean {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  const alwaysRequired = entry.requiredParentKeys ?? [];
  if (alwaysRequired.length > 0 && !alwaysRequired.every((key) => isParentActive(key))) {
    return false;
  }

  const parentKeys = entry.parentKeys;
  if (parentKeys.length === 0) {
    return true;
  }

  const optional = new Set(entry.optionalParentKeys ?? []);
  const requiredParents = parentKeys.filter((key) => !optional.has(key));

  if (entry.parentOperator === 'OR') {
    return parentKeys.some((key) => isParentActive(key));
  }

  if (requiredParents.length === 0) {
    return true;
  }

  return requiredParents.every((key) => isParentActive(key));
}

/** True when catalog parentKeys (AND/OR + optional) are satisfied for `blockKey`. */
export function areEntitlementBlockParentsSatisfied(
  blockKey: EntitlementBlockKey,
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): boolean {
  return areEntitlementBlockParentsSatisfiedBy(blockKey, (parentKey) =>
    isEntitlementParentRuntimeActive(parentKey, states),
  );
}

function catalogParentDepth(blockKey: EntitlementBlockKey, cache: Map<EntitlementBlockKey, number>): number {
  const cached = cache.get(blockKey);
  if (cached !== undefined) {
    return cached;
  }
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  const allParents = [...entry.parentKeys, ...(entry.requiredParentKeys ?? [])];
  if (allParents.length === 0) {
    cache.set(blockKey, 0);
    return 0;
  }
  let maxParent = 0;
  for (const parentKey of allParents) {
    maxParent = Math.max(maxParent, catalogParentDepth(parentKey, cache));
  }
  const depth = maxParent + 1;
  cache.set(blockKey, depth);
  return depth;
}

function deniedChildSimpleState(
  blockKey: EntitlementBlockKey,
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): SimpleEntitlementState {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  const optional = new Set(entry.optionalParentKeys ?? []);
  const orAndParents =
    entry.parentOperator === 'OR' ? entry.parentKeys : entry.parentKeys.filter((key) => !optional.has(key));
  const parentsToInspect = [...(entry.requiredParentKeys ?? []), ...orAndParents];

  for (const parentKey of parentsToInspect) {
    if (states[parentKey] === 'hardOff') {
      return 'hardOff';
    }
  }
  return 'off';
}

/**
 * Forces runtime-active children Off/HardOff when catalog parents are not satisfied.
 * Processes shallow parents before deeper children so cascades settle in one pass.
 */
export function applyCatalogParentDenialImplications(
  states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const result: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = { ...states };
  const depthCache = new Map<EntitlementBlockKey, number>();
  const ordered = [...TENANT_ENTITLEMENT_BLOCK_CATALOG].sort(
    (left, right) =>
      catalogParentDepth(left.blockKey, depthCache) - catalogParentDepth(right.blockKey, depthCache),
  );

  for (const entry of ordered) {
    const current = result[entry.blockKey];
    if (!isRuntimeActiveSimpleState(current)) {
      continue;
    }
    if (areEntitlementBlockParentsSatisfied(entry.blockKey, result)) {
      continue;
    }
    result[entry.blockKey] = deniedChildSimpleState(entry.blockKey, result);
  }

  return result;
}
