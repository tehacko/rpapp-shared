import { TENANT_ENTITLEMENT_BLOCK_CATALOG, getEntitlementBlockCatalogEntry } from './catalog.js';
import type { EntitlementBlockAxes, EntitlementBlockClass, EntitlementBlockKey, SimpleEntitlementState } from './types.js';

const CORE_REQUIRED_ON: SimpleEntitlementState = 'on';

export function axesToSimpleState(axes: EntitlementBlockAxes): SimpleEntitlementState {
  if (
    axes.runtimeMode === 'ENABLED' &&
    axes.visibilityMode === 'VISIBLE' &&
    axes.mutationMode === 'ALLOW_WRITES'
  ) {
    return 'on';
  }
  if (
    axes.runtimeMode === 'ENABLED' &&
    axes.visibilityMode === 'VISIBLE' &&
    axes.mutationMode === 'READ_ONLY'
  ) {
    return 'softOffVisible';
  }
  if (
    axes.runtimeMode === 'ENABLED' &&
    axes.visibilityMode === 'HIDDEN' &&
    axes.mutationMode === 'READ_ONLY'
  ) {
    return 'softOffHidden';
  }
  if (
    axes.runtimeMode === 'DISABLED' &&
    axes.visibilityMode === 'HIDDEN' &&
    axes.mutationMode === 'BLOCK_ALL'
  ) {
    return 'hardOff';
  }
  return 'off';
}

function isCoreImmutableBlock(blockClass: EntitlementBlockClass): boolean {
  return blockClass === 'CORE_IMMUTABLE';
}

export function simpleStatesFromPolicyAxes(
  policies: readonly {
    blockKey: string;
    runtimeMode: EntitlementBlockAxes['runtimeMode'];
    visibilityMode: EntitlementBlockAxes['visibilityMode'];
    mutationMode: EntitlementBlockAxes['mutationMode'];
  }[],
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const byKey = new Map(policies.map((row) => [row.blockKey, row]));
  const states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = {};
  for (const entry of TENANT_ENTITLEMENT_BLOCK_CATALOG) {
    if (entry.immutableDefaults !== undefined || isCoreImmutableBlock(entry.blockClass)) {
      continue;
    }
    const row = byKey.get(entry.blockKey);
    if (row === undefined) {
      continue;
    }
    states[entry.blockKey] = axesToSimpleState(row);
  }
  return states;
}

export function resolveSimpleStateForBlock(
  blockKey: EntitlementBlockKey,
  simpleStates: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): SimpleEntitlementState {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  if (entry.immutableDefaults !== undefined) {
    return axesToSimpleState(entry.immutableDefaults);
  }
  if (entry.blockClass === 'CORE_REQUIRED') {
    return CORE_REQUIRED_ON;
  }
  return simpleStates[blockKey] ?? 'off';
}
