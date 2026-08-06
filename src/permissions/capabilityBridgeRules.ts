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
  [
    'users:admins:create',
    ADMIN_USERS_MANAGE_BRIDGE_TARGETS,
  ],
  ['users:view:read', ['tenant.adminUsers.view']],
  ['tenant.adminUsers.manage', ADMIN_USERS_MANAGE_BRIDGE_TARGETS],
  ['dev:workers:read', ['platform.retentionWorkers.view']],
  ['dev:workers:run', ['platform.retentionWorkers.manage', 'platform.retentionWorkers.view']],
  ['dev:aggregates:read', ['platform.aggregates.view']],
  ['dev:aggregates:run', ['platform.aggregates.manage', 'platform.aggregates.view']],
  ['dev:compliance:audit:read', ['platform.complianceAudit.view']],
  ['dev:compliance:gdpr:read', ['platform.complianceGdpr.view']],
  // Tenant compliance — legacy JWT keys → canonical page/nav SoT
  // system:pii:* also mirrors CapabilityMap includes → system:logs:* (parity with impliesCapability)
  ['system:logs:read', ['tenant.systemLogs.view']],
  ['system:logs:manage', ['tenant.systemLogs.manage', 'tenant.systemLogs.view']],
  ['system:pii:read', ['tenant.systemPii.view', 'tenant.systemLogs.view']],
  [
    'system:pii:manage',
    [
      'tenant.systemPii.manage',
      'tenant.systemPii.view',
      'tenant.systemLogs.manage',
      'tenant.systemLogs.view',
    ],
  ],
  [
    'config:payments:read',
    [
      'tenant.bankAccounts.read',
      'tenant.bankInbox.read',
      'tenant.reconciliation.read',
      'tenant.paymentsIntegration.view',
      'tenant.paymentPreferences.view',
    ],
  ],
  [
    'config:payments:manage',
    [
      'tenant.bankAccounts.manage',
      'tenant.bankAccounts.read',
      'tenant.bankInbox.manage',
      'tenant.bankInbox.read',
      'tenant.paymentClaims.approve',
      'tenant.reconciliation.read',
      'tenant.paymentsIntegration.manage',
      'tenant.paymentsIntegration.view',
      'tenant.paymentPreferences.manage',
      'tenant.paymentPreferences.view',
      'tenant.orders.fulfill.read',
    ],
  ],
  [
    'tenant.paymentPreferences.view',
    ['tenant.bankAccounts.read', 'tenant.bankInbox.read', 'tenant.reconciliation.read'],
  ],
  [
    'tenant.paymentPreferences.manage',
    [
      'tenant.bankAccounts.manage',
      'tenant.bankAccounts.read',
      'tenant.bankInbox.manage',
      'tenant.bankInbox.read',
      'tenant.paymentClaims.approve',
      'tenant.reconciliation.read',
      'tenant.orders.fulfill.read',
    ],
  ],
  [
    'ops:payment-preferences:read',
    ['tenant.bankAccounts.read', 'tenant.bankInbox.read', 'tenant.reconciliation.read'],
  ],
  [
    'ops:payment-preferences:manage',
    [
      'tenant.bankAccounts.manage',
      'tenant.bankAccounts.read',
      'tenant.bankInbox.manage',
      'tenant.bankInbox.read',
      'tenant.paymentClaims.approve',
      'tenant.reconciliation.read',
    ],
  ],
  ['tenant.bankInbox.read', ['tenant.reconciliation.read']],
  ['tenant.bankInbox.manage', ['tenant.reconciliation.read']],
  ['tenant.paymentClaims.approve', ['tenant.reconciliation.read']],
  [
    'tenant.orders.fulfill.update',
    ['tenant.orders.fulfill.read', 'tenant.orders.pickup.scan'],
  ],
  [
    'tenant.orders.pickup.scan',
    [
      'tenant.orders.pickup.refuse',
      'tenant.orders.pickup.hold',
      'tenant.orders.pickup.reprint',
    ],
  ],
  [
    'tenant.kiosks.manage',
    ['tenant.pickupPoints.manage', 'tenant.pickupPoints.read'],
  ],
  [
    'tenant.kiosks.view',
    ['tenant.pickupPoints.read'],
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
  'ops:payment-preferences:read',
  'ops:payment-preferences:manage',
  'tenant.bankInbox.read',
  'tenant.bankInbox.manage',
  'tenant.paymentClaims.approve',
  'tenant.paymentPreferences.view',
  'tenant.paymentPreferences.manage',
  'system:logs:read',
  'system:logs:manage',
  'system:pii:read',
  'system:pii:manage',
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
  'tenant.reconciliation.read',
  'tenant.systemLogs.view',
  'tenant.systemLogs.manage',
  'tenant.systemPii.view',
  'tenant.systemPii.manage',
] as const;
