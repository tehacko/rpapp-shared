/**
 * Simply vs Ent Max READY delta (Plan Visibility G8).
 *
 * Max = blocks where `isEntitlementBlockProductionEnableAllowed`.
 * Simply = blocks where commercial packaging evaluates ALLOW under the given plan.
 * Returns sorted unique Max \ Simply. Never uses seed full-demo simple-state builders.
 */
import {
  evaluateCommercialPackageDecision,
  getCommercialPackagingRule,
} from './commercialPackaging.js';
import { isEntitlementBlockProductionEnableAllowed } from './productCapabilityReadiness.js';
import { ENTITLEMENT_BLOCK_KEYS, type CommercialPlanId, type EntitlementBlockKey } from './types.js';

/**
 * Production-enable-ALLOWED blocks that are not commercially ALLOW under `plan`.
 * Catalog order (stable), unique by construction.
 */
export function computeSimplyVsEntMaxReadyDelta(
  plan: CommercialPlanId,
): EntitlementBlockKey[] {
  const delta: EntitlementBlockKey[] = [];
  for (const blockKey of ENTITLEMENT_BLOCK_KEYS) {
    if (!isEntitlementBlockProductionEnableAllowed(blockKey)) {
      continue;
    }
    const decision = evaluateCommercialPackageDecision(
      plan,
      getCommercialPackagingRule(blockKey),
    );
    if (decision === 'ALLOW') {
      continue;
    }
    delta.push(blockKey);
  }
  return delta;
}
