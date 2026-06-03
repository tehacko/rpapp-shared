/**
 * Client-side effective capability checks — mirrors server JWT expansion for UI gates.
 * Prefer capabilities from GET /admin/me (server-expanded); use this as fallback only.
 */
import {
  expandCapabilitiesForClientCheck,
  grantImpliesTarget,
} from './capabilityBridgeRules.js';

export { expandCapabilitiesForClientCheck } from './capabilityBridgeRules.js';

export {
  ADMIN_USERS_MANAGE_BRIDGE_SOURCES,
  ADMIN_USERS_MANAGE_BRIDGE_TARGETS,
  BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS,
  BRIDGE_PARITY_FIXTURE_GRANTS,
  grantImpliesTarget,
} from './capabilityBridgeRules.js';

export function hasEffectiveCapability(
  grants: readonly string[],
  required: string,
): boolean {
  const expanded = expandCapabilitiesForClientCheck(grants);
  if (expanded.has(required)) {
    return true;
  }
  for (const grant of expanded) {
    if (grantImpliesTarget(grant, required)) {
      return true;
    }
  }
  return false;
}

export function hasAnyEffectiveCapability(
  grants: readonly string[],
  required: readonly string[],
): boolean {
  return required.some((cap) => hasEffectiveCapability(grants, cap));
}
