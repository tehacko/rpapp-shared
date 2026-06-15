/**
 * Shared capability bridge rules — single source for client JWT fallback checks.
 * Server uses the same helpers from pi-kiosk-shared in PermissionInheritanceResolver.
 * Forward-only: legacy → canonical; never canonical view → manage cluster.
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

export const DEV_COMPLIANCE_AUDIT_BRIDGE_SOURCES: readonly string[] = [
  'dev:compliance:audit:read',
];

export const DEV_COMPLIANCE_GDPR_BRIDGE_SOURCES: readonly string[] = [
  'dev:compliance:gdpr:read',
];

const ADMIN_BRIDGE_SOURCE_SET = new Set<string>(ADMIN_USERS_MANAGE_BRIDGE_SOURCES);

/** Forward-only legacy → canonical (no canonical → full cluster). */
const BRIDGE_TARGET_BY_SOURCE = new Map<string, readonly string[]>([
  ['users:admins:create', ADMIN_USERS_MANAGE_BRIDGE_TARGETS],
  ['tenant.adminUsers.manage', ADMIN_USERS_MANAGE_BRIDGE_TARGETS],
  ['dev:workers:read', ['platform.retentionWorkers.view']],
  ['dev:workers:run', ['platform.retentionWorkers.manage', 'platform.retentionWorkers.view']],
  ['dev:aggregates:read', ['platform.aggregates.view']],
  ['dev:aggregates:run', ['platform.aggregates.manage', 'platform.aggregates.view']],
  ['dev:compliance:audit:read', ['platform.complianceAudit.view']],
  ['dev:compliance:gdpr:read', ['platform.complianceGdpr.view']],
  [
    'tenant.paymentPreferences.view',
    ['tenant.bankAccounts.read', 'tenant.bankInbox.read'],
  ],
  [
    'tenant.paymentPreferences.manage',
    [
      'tenant.bankAccounts.manage',
      'tenant.bankAccounts.read',
      'tenant.bankInbox.manage',
      'tenant.bankInbox.read',
      'tenant.paymentClaims.approve',
      'tenant.orders.fulfill.read',
    ],
  ],
  [
    'ops:payment-preferences:read',
    ['tenant.bankAccounts.read', 'tenant.bankInbox.read'],
  ],
  [
    'ops:payment-preferences:manage',
    [
      'tenant.bankAccounts.manage',
      'tenant.bankAccounts.read',
      'tenant.bankInbox.manage',
      'tenant.bankInbox.read',
      'tenant.paymentClaims.approve',
    ],
  ],
  [
    'tenant.orders.fulfill.update',
    ['tenant.orders.fulfill.read'],
  ],
  [
    'tenant.orders.complete',
    ['tenant.orders.fulfill.read', 'tenant.orders.fulfill.update'],
  ],
]);

/**
 * Forward-only implication used by client expansion and server bridge checks.
 */
export function grantImpliesTarget(granted: string, target: string): boolean {
  if (granted === target) {
    return true;
  }

  const bridgeTargets = BRIDGE_TARGET_BY_SOURCE.get(granted);
  if (bridgeTargets?.includes(target)) {
    return true;
  }

  if (ADMIN_BRIDGE_SOURCE_SET.has(granted) && ADMIN_USERS_MANAGE_BRIDGE_TARGETS.includes(target)) {
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

function impliedTargetsFromGrant(grant: string): readonly string[] {
  const implied: string[] = [];
  const bridgeTargets = BRIDGE_TARGET_BY_SOURCE.get(grant);
  if (bridgeTargets) {
    implied.push(...bridgeTargets);
  }
  if (grant.endsWith(':manage')) {
    implied.push(grant.replace(/:manage$/, ':read'));
  } else if (grant.endsWith(':write')) {
    implied.push(grant.replace(/:write$/, ':read'));
  } else if (grant.endsWith('.manage')) {
    implied.push(`${grant.slice(0, -'.manage'.length)}.view`);
  }
  return implied;
}

/**
 * Expands grants with bridge rules and manage→view / manage→read (no reverse implications).
 */
export function expandCapabilitiesForClientCheck(grants: readonly string[]): Set<string> {
  const result = new Set<string>();
  const pending = [...grants];

  while (pending.length > 0) {
    const grant = pending.pop();
    if (grant === undefined || result.has(grant)) {
      continue;
    }
    result.add(grant);
    for (const target of impliedTargetsFromGrant(grant)) {
      if (!result.has(target)) {
        pending.push(target);
      }
    }
  }

  return result;
}

/** Parity fixture — both backend and shared tests must satisfy. */
export const BRIDGE_PARITY_FIXTURE_GRANTS = [
  'users:admins:create',
  'dev:workers:read',
  'dev:workers:run',
  'dev:aggregates:read',
  'dev:aggregates:run',
  'dev:compliance:audit:read',
  'dev:compliance:gdpr:read',
] as const;

export const BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS = [
  'tenant.adminUserCapabilities.view',
  'tenant.adminUserCapabilities.manage',
  'tenant.adminUsers.manage',
  'platform.retentionWorkers.view',
  'platform.retentionWorkers.manage',
  'platform.aggregates.view',
  'platform.aggregates.manage',
  'platform.complianceAudit.view',
  'platform.complianceGdpr.view',
] as const;
