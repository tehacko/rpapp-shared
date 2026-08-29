/**
 * CORE_REQUIRED policy axes — unconditional vs parent-gated (e.g. customer_auth_pwa).
 */
import { getEntitlementBlockCatalogEntry } from './catalog.js';
import { areEntitlementBlockParentsSatisfied } from './catalogParentSatisfaction.js';
import { simpleEntitlementStateToAxes } from './types.js';
import type { EntitlementBlockAxes, EntitlementBlockKey, SimpleEntitlementState } from './types.js';

const CORE_REQUIRED_ON: SimpleEntitlementState = 'on';

/** Inactive axes for parent-gated CORE_REQUIRED when catalog parents are unsatisfied (KIOSK_ONLY). */
export const CATALOG_DEFAULT_DISABLED_CORE_REQUIRED_CHILD_AXES: EntitlementBlockAxes = {
  runtimeMode: 'DISABLED',
  visibilityMode: 'HIDDEN',
  mutationMode: 'READ_ONLY',
};

export function isParentGatedCoreRequiredBlock(blockKey: EntitlementBlockKey): boolean {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  return entry.blockClass === 'CORE_REQUIRED' && entry.parentKeys.length > 0;
}

export function resolveCoreRequiredPolicyAxesForBlock(
  blockKey: EntitlementBlockKey,
  simpleStates: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>>,
): EntitlementBlockAxes {
  const entry = getEntitlementBlockCatalogEntry(blockKey);
  if (entry.blockClass !== 'CORE_REQUIRED') {
    throw new Error(`resolveCoreRequiredPolicyAxesForBlock: ${blockKey} is not CORE_REQUIRED`);
  }
  if (
    entry.parentKeys.length > 0 &&
    !areEntitlementBlockParentsSatisfied(blockKey, simpleStates)
  ) {
    return CATALOG_DEFAULT_DISABLED_CORE_REQUIRED_CHILD_AXES;
  }
  return simpleEntitlementStateToAxes(CORE_REQUIRED_ON);
}
