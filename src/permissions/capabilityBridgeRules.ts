/**
 * Shared capability bridge rules — single source for client JWT fallback checks.
 * Server uses the same helpers from pi-kiosk-shared in PermissionInheritanceResolver.
 */

export const ADMIN_USERS_MANAGE_BRIDGE_SOURCES: readonly string[] = [
  'users:admins:create',
  'tenant.adminUsers.manage',
];

export const ADMIN_USERS_MANAGE_BRIDGE_TARGETS: readonly string[] = [
  'users:admins:create',
  'tenant.adminUsers.manage',
  'tenant.adminUsers.view',
  'tenant.adminUserCapabilities.view',
  'tenant.adminUserCapabilities.manage',
];

const BRIDGE_SOURCE_SET = new Set<string>(ADMIN_USERS_MANAGE_BRIDGE_SOURCES);

/**
 * Forward-only implication used by client expansion and server bridge checks.
 */
export function grantImpliesTarget(granted: string, target: string): boolean {
  if (granted === target) {
    return true;
  }

  if (BRIDGE_SOURCE_SET.has(granted) && ADMIN_USERS_MANAGE_BRIDGE_TARGETS.includes(target)) {
    return true;
  }

  if (granted.endsWith('.manage') && target === `${granted.slice(0, -'.manage'.length)}.view`) {
    return true;
  }

  if (granted.endsWith(':manage') && target === granted.replace(/:manage$/, ':read')) {
    return true;
  }

  if (granted.endsWith(':write') && target === granted.replace(/:write$/, ':read')) {
    return true;
  }

  return false;
}

/**
 * Expands grants with bridge rules and manage→view / manage→read (no reverse implications).
 */
export function expandCapabilitiesForClientCheck(grants: readonly string[]): Set<string> {
  const result = new Set<string>(grants);

  const addGrantClosure = (grant: string): void => {
    if (result.has(grant)) {
      return;
    }
    result.add(grant);
    for (const target of ADMIN_USERS_MANAGE_BRIDGE_TARGETS) {
      if (grantImpliesTarget(grant, target)) {
        result.add(target);
      }
    }
    if (grant.endsWith(':manage')) {
      result.add(grant.replace(/:manage$/, ':read'));
    } else if (grant.endsWith(':write')) {
      result.add(grant.replace(/:write$/, ':read'));
    } else if (grant.endsWith('.manage')) {
      result.add(`${grant.slice(0, -'.manage'.length)}.view`);
    }
  };

  for (const grant of grants) {
    addGrantClosure(grant);
    for (const expanded of [...result]) {
      addGrantClosure(expanded);
    }
  }

  return result;
}

/** Parity fixture — both backend and shared tests must satisfy. */
export const BRIDGE_PARITY_FIXTURE_GRANTS = ['users:admins:create'] as const;

export const BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS = [
  'tenant.adminUserCapabilities.view',
  'tenant.adminUserCapabilities.manage',
  'tenant.adminUsers.manage',
] as const;
