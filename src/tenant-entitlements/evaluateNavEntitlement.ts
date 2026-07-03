/**
 * Admin nav entitlement ∩ RBAC evaluation (§11.0).
 *
 * effectiveNavVisible = entitlement.visible(block) AND rbacHasCap(item.cap)
 */
import { hasEffectiveCapability } from '../permissions/effectiveCapabilities.js';
import type { EntitlementBlockAxes } from './types.js';
import { isEntitlementVisible } from './evaluatePosture.js';

export interface EvaluateNavEntitlementInput {
  readonly blockAxes: EntitlementBlockAxes;
  readonly grants: readonly string[];
  readonly requiredCapability: string;
}

export interface EvaluateNavEntitlementFromVisibleInput {
  readonly entitlementVisible: boolean;
  readonly grants: readonly string[];
  readonly requiredCapability: string;
}

export function evaluateNavEntitlementFromVisible(
  input: EvaluateNavEntitlementFromVisibleInput,
): boolean {
  return (
    input.entitlementVisible &&
    hasEffectiveCapability(input.grants, input.requiredCapability)
  );
}

export function evaluateNavEntitlement(input: EvaluateNavEntitlementInput): boolean {
  return evaluateNavEntitlementFromVisible({
    entitlementVisible: isEntitlementVisible(input.blockAxes),
    grants: input.grants,
    requiredCapability: input.requiredCapability,
  });
}
