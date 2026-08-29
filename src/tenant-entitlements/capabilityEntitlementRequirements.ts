/**
 * Capability → entitlement-block grant requirements (commercial RBAC ceiling map).
 *
 * Authoring tokens use PIPE / SLASH / GLOB / LITERAL per expandAuthoringTokens.
 * Runtime CAPABILITY_ENTITLEMENT_REQUIREMENTS stores expanded literals only.
 *
 * NEVER import admin-app or up-backend into this module.
 */

import type { EntitlementBlockKey } from './types.js';

/** Copied PAYMENTS_HUB_NAV_ENTITLEMENT_ALL_OF literals (do not import admin-app). */
export const PAYMENTS_HUB_NAV_ENTITLEMENT_ALL_OF = [
  'payments_hub_ui',
  'bank_inbox_claims_api',
] as const satisfies readonly EntitlementBlockKey[];

/** Advanced explore tab — Analytika entitlement only; PII is RBAC capability-gated. */
export const EXPLORE_ENTITLEMENT_ALL_OF = [
  'analytics_explore',
] as const satisfies readonly EntitlementBlockKey[];

/**
 * Catalog CORE_IMMUTABLE keys — CI fails if any grant row lists these as requiredBlockKeys.
 * Do NOT list CONDITIONAL blocks here (they must remain requirable for fail-closed
 * grant ceilings when a pack is off). Commercial admin:outbox:* / tenant.outbox.* are
 * entitlementExempt — Události visibility is route-gated via incident_centre_ui only;
 * outbox_runtime stays CORE_IMMUTABLE ALWAYS_ON (workers), never a grant requirement.
 */
export const NEVER_REQUIRED_BLOCK_KEYS = [
  'platform_core',
  'dev_entitlement_policy_editor',
  'audit_event_collection',
  'gdpr_consent_admin_ui',
  'payment_processing_runtime',
  'outbox_runtime',
] as const satisfies readonly EntitlementBlockKey[];

export type CapabilityEntitlementMatch = 'ALL' | 'ANY';

export type CapabilityEntitlementRequirement = {
  readonly capabilityKeys: readonly string[];
  readonly entitlementExempt?: true;
  readonly requiredBlockKeys?: readonly EntitlementBlockKey[];
  readonly match: CapabilityEntitlementMatch;
};

export type CapabilityEntitlementLookup =
  | { readonly kind: 'exempt' }
  | {
      readonly kind: 'blocks';
      readonly blockKeys: readonly EntitlementBlockKey[];
      readonly match: CapabilityEntitlementMatch;
    }
  | { readonly kind: 'unmapped' };

export type EvaluateCapabilityEntitlementResult = {
  readonly allowed: boolean;
  readonly missingBlockKeys: readonly EntitlementBlockKey[];
};

type AuthoringRequirementSeed = {
  readonly authoringTokens: readonly string[];
  readonly entitlementExempt?: true;
  readonly requiredBlockKeys?: readonly EntitlementBlockKey[];
  readonly match: CapabilityEntitlementMatch;
};

const FORBIDDEN_INVENTORY_GLOB = 'ops:inventory:*';

function lastSeparatorIndex(segmentBeforeSlash: string): number {
  return Math.max(segmentBeforeSlash.lastIndexOf('.'), segmentBeforeSlash.lastIndexOf(':'));
}

function isIllegalFinanceOrSystemPipeShorthand(token: string): boolean {
  const legalFinance = 'finance:view:*|finance:detailed:*|finance:pii:*|finance:export:*';
  const legalSystem = 'system:health:*|system:feature-flags:*|system:secrets:*';
  if (token === legalFinance || token === legalSystem) {
    return false;
  }
  if (!(token.startsWith('finance:') || token.startsWith('system:'))) {
    return false;
  }
  // Reject finance:view|detailed|pii|export:* and system:health|feature-flags|secrets:*
  if (/^finance:view\|/.test(token) || /^system:health\|/.test(token)) {
    return true;
  }
  const pieces = token.split('|');
  return pieces.some((piece) => !piece.includes(':') && !piece.includes('.'));
}

function expandSingleToken(token: string, liveIds: ReadonlySet<string>): string[] {
  if (token === FORBIDDEN_INVENTORY_GLOB) {
    throw new Error(
      'expandAuthoringTokens: forbids ops:inventory:* (would pull incident_review_high_impact onto inventory_management); use ops:inventory:read/manage',
    );
  }

  if (token.includes('|')) {
    if (/\([^)]*\|[^)]*\)/.test(token)) {
      throw new Error(
        `expandAuthoringTokens: illegal nested pipe group in ${JSON.stringify(token)}`,
      );
    }
    if (isIllegalFinanceOrSystemPipeShorthand(token)) {
      throw new Error(
        `expandAuthoringTokens: illegal pipe shorthand ${JSON.stringify(token)}; use fully-qualified unions (finance:view:*|finance:detailed:*|finance:pii:*|finance:export:* or system:health:*|system:feature-flags:*|system:secrets:*)`,
      );
    }

    const out = new Set<string>();
    for (const piece of token.split('|')) {
      for (const key of expandSingleToken(piece, liveIds)) {
        out.add(key);
      }
    }
    return [...out];
  }

  if (token.includes('/')) {
    if (token.includes('*')) {
      throw new Error(
        `expandAuthoringTokens: mixed / and glob on one token: ${JSON.stringify(token)}`,
      );
    }
    const firstSlash = token.indexOf('/');
    const beforeSlash = token.slice(0, firstSlash);
    const sepIdx = lastSeparatorIndex(beforeSlash);
    if (sepIdx < 0) {
      throw new Error(
        `expandAuthoringTokens: slash token missing . or : prefix: ${JSON.stringify(token)}`,
      );
    }
    const prefix = token.slice(0, sepIdx + 1);
    const forks = token.slice(sepIdx + 1).split('/');
    const out: string[] = [];
    for (const fork of forks) {
      const key = `${prefix}${fork}`;
      if (!liveIds.has(key)) {
        throw new Error(
          `expandAuthoringTokens: slash fork ${JSON.stringify(key)} not in liveIds (from ${JSON.stringify(token)})`,
        );
      }
      out.push(key);
    }
    return out;
  }

  if (token.endsWith('.*') || token.endsWith(':*')) {
    const separator = token.endsWith('.*') ? '.' : ':';
    const prefix = token.slice(0, -2);
    const fullPrefix = `${prefix}${separator}`;
    const out: string[] = [];
    for (const id of liveIds) {
      if (!id.startsWith(fullPrefix)) continue;
      const rest = id.slice(fullPrefix.length);
      if (rest.length === 0) continue;
      // One-level only — never recursive
      if (rest.includes('.') || rest.includes(':')) continue;
      out.push(id);
    }
    if (out.length === 0) {
      throw new Error(
        `expandAuthoringTokens: glob ${JSON.stringify(token)} matched no liveIds`,
      );
    }
    return out;
  }

  if (!liveIds.has(token)) {
    throw new Error(
      `expandAuthoringTokens: literal ${JSON.stringify(token)} not in liveIds`,
    );
  }
  return [token];
}

/**
 * Expand authoring tokens to sorted unique capability literals.
 * Algorithm: PIPE → SLASH → GLOB (one-level) → LITERAL. Pure; CI passes real LIVE_IDS.
 */
export function expandAuthoringTokens(
  tokens: readonly string[],
  liveIds: readonly string[],
): readonly string[] {
  const liveSet = new Set(liveIds);
  const out = new Set<string>();
  for (const token of tokens) {
    for (const key of expandSingleToken(token, liveSet)) {
      out.add(key);
    }
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}

/**
 * LIVE_IDS snapshot for in-module authoring expansion only.
 * CI gate-capability-entitlement-requirements must assert equality with
 * getAllCanonicalRecords ∪ getAllCapabilityNames.
 */
export const CAPABILITY_ENTITLEMENT_LIVE_IDS_SNAPSHOT: readonly string[] = [
    "account.self.manage",
    "admin:outbox:manage",
    "admin:outbox:read",
    "analytics:benchmark:read",
    "analytics:detailed:manage",
    "analytics:detailed:read",
    "analytics:mission-control:export",
    "analytics:mission-control:read",
    "analytics:pii:manage",
    "analytics:pii:read",
    "analytics:summary:manage",
    "analytics:summary:read",
    "config:payments:manage",
    "config:payments:read",
    "config:pricing:kiosk:override",
    "config:pricing:manage",
    "config:pricing:read",
    "config:tenant:manage",
    "config:tenant:read",
    "dev:aggregates:read",
    "dev:aggregates:run",
    "dev:analytics:explore:export",
    "dev:analytics:explore:read",
    "dev:analytics:mission-control:export",
    "dev:analytics:mission-control:read",
    "dev:analytics:read",
    "dev:analytics:run",
    "dev:compliance:audit:read",
    "dev:compliance:gdpr:read",
    "dev:outbox:approve:replay",
    "dev:outbox:manage",
    "dev:outbox:operate:abandon",
    "dev:outbox:operate:replay:dryrun",
    "dev:outbox:operate:replay:execute",
    "dev:outbox:operate:retry",
    "dev:outbox:read",
    "dev:overview:manage",
    "dev:overview:read",
    "dev:reconciliation:manage",
    "dev:reconciliation:read",
    "dev:retention:manage",
    "dev:retention:read",
    "dev:tenants:create",
    "dev:tenants:delete",
    "dev:tenants:manage",
    "dev:tenants:payments:manage",
    "dev:tenants:read",
    "dev:users:manage",
    "dev:users:read",
    "dev:workers:read",
    "dev:workers:resolve-refund-candidate",
    "dev:workers:run",
    "exceptions.complianceSensitiveAccess",
    "exceptions.crossTenantReplayExecute",
    "exceptions.refundResolve",
    "exceptions.tenantPermanentDelete",
    "finance:detailed:manage",
    "finance:detailed:read",
    "finance:export:manage",
    "finance:export:read",
    "finance:pii:manage",
    "finance:pii:read",
    "finance:refunds:manage",
    "finance:refunds:read",
    "finance:settlements:manage",
    "finance:settlements:read",
    "finance:view:manage",
    "finance:view:read",
    "hold_floor_override",
    "loyalty:campaigns:manage",
    "loyalty:campaigns:read",
    "loyalty:config:manage",
    "loyalty:config:read",
    "loyalty:coupons:activate",
    "loyalty:coupons:read",
    "loyalty:enrollment:manage",
    "loyalty:platform-campaigns:manage",
    "loyalty:profiling:consent",
    "loyalty:reports:read",
    "loyalty:wallet:read",
    "ops:branding:manage",
    "ops:branding:read",
    "ops:donation-projects:manage",
    "ops:donation-projects:read",
    "ops:donation-templates:manage",
    "ops:donation-templates:read",
    "ops:inventory:checkup.hold_floor_override",
    "ops:inventory:incident_review_high_impact",
    "ops:inventory:manage",
    "ops:inventory:read",
    "ops:orders:complete",
    "ops:orders:fulfill:read",
    "ops:orders:fulfill:update",
    "ops:products:manage",
    "ops:products:read",
    "ops:sales-points:donation:amounts",
    "ops:sales-points:donation:assign",
    "ops:sales-points:manage",
    "ops:sales-points:provider-slots:read",
    "ops:sales-points:read",
    "ops:transactions:manage",
    "ops:transactions:read",
    "permissionsCatalog.view",
    "pickup_devices:read",
    "pickup_devices:write",
    "platform.aggregates.manage",
    "platform.aggregates.view",
    "platform.analyticsExplore.manage",
    "platform.analyticsExplore.view",
    "platform.analyticsPipeline.manage",
    "platform.analyticsPipeline.view",
    "platform.auditFinalizeIncident.manage",
    "platform.categories.manage",
    "platform.categories.view",
    "platform.complianceAudit.view",
    "platform.complianceGdpr.view",
    "platform.complianceRetentionDelete.manage",
    "platform.devUsers.manage",
    "platform.devUsers.view",
    "platform.hardeningMetrics.view",
    "platform.httpStorm.manage",
    "platform.httpStorm.view",
    "platform.outbox.manage",
    "platform.outbox.view",
    "platform.outboxReplay.approvalRequestApprove",
    "platform.outboxReplay.approvalRequestCreate",
    "platform.outboxReplay.approvalRequestRevoke",
    "platform.outboxReplay.dryRun",
    "platform.outboxReplay.execute",
    "platform.overview.manage",
    "platform.overview.view",
    "platform.reconciliation.manage",
    "platform.reconciliation.view",
    "platform.retention.manage",
    "platform.retention.view",
    "platform.retentionWorkers.manage",
    "platform.retentionWorkers.view",
    "platform.successIncident.manage",
    "platform.successIncident.view",
    "platform.tenantPayments.manage",
    "platform.tenants.manage",
    "platform.tenants.view",
    "platform.userCapabilities.manage",
    "platform.userCapabilities.view",
    "platform.userTenantAssignments.manage",
    "platform.userTenantAssignments.view",
    "platform.users.manage",
    "platform.users.view",
    "principal.view",
    "promo:events:enroll",
    "promo:events:manage",
    "promo:rewards:activate",
    "promo:rewards:read",
    "system:feature-flags:manage",
    "system:feature-flags:read",
    "system:health:manage",
    "system:health:read",
    "system:logs:manage",
    "system:logs:read",
    "system:pii:manage",
    "system:pii:read",
    "system:secrets:manage",
    "system:secrets:read",
    "tenant.adminEvents.subscribe",
    "tenant.adminUserCapabilities.manage",
    "tenant.adminUserCapabilities.view",
    "tenant.adminUsers.manage",
    "tenant.adminUsers.view",
    "tenant.analyticsBenchmark.view",
    "tenant.analyticsDetailed.manage",
    "tenant.analyticsDetailed.view",
    "tenant.analyticsPii.manage",
    "tenant.analyticsPii.view",
    "tenant.analyticsSummary.manage",
    "tenant.analyticsSummary.view",
    "tenant.bankAccounts.manage",
    "tenant.bankAccounts.read",
    "tenant.bankInbox.manage",
    "tenant.bankInbox.read",
    "tenant.branding.manage",
    "tenant.branding.view",
    "tenant.comms.credentials.read",
    "tenant.comms.credentials.write",
    "tenant.configPricing.manage",
    "tenant.configPricing.view",
    "tenant.configTenant.manage",
    "tenant.configTenant.view",
    "tenant.donationProjects.manage",
    "tenant.donationProjects.view",
    "tenant.donationTemplates.manage",
    "tenant.donationTemplates.view",
    "tenant.financeApproveSettlement.manage",
    "tenant.financeDetailed.manage",
    "tenant.financeDetailed.view",
    "tenant.financeExport.manage",
    "tenant.financeExport.view",
    "tenant.financePii.manage",
    "tenant.financePii.view",
    "tenant.financeRefunds.manage",
    "tenant.financeRefunds.view",
    "tenant.financeSettlements.manage",
    "tenant.financeSettlements.view",
    "tenant.financeView.manage",
    "tenant.financeView.view",
    "tenant.inventory.incidentHighImpact.review",
    "tenant.inventory.manage",
    "tenant.inventory.view",
    "tenant.kioskDonationAmounts.manage",
    "tenant.kioskDonationAssign.manage",
    "tenant.kiosks.manage",
    "tenant.kiosks.view",
    "tenant.orders.complete",
    "tenant.orders.fulfill.read",
    "tenant.orders.fulfill.update",
    "tenant.orders.pickup.hold",
    "tenant.orders.pickup.holdFloorOverride",
    "tenant.orders.pickup.refuse",
    "tenant.orders.pickup.reprint",
    "tenant.orders.pickup.scan",
    "tenant.outbox.manage",
    "tenant.outbox.view",
    "tenant.paymentClaims.approve",
    "tenant.paymentCredentials.manage",
    "tenant.paymentCredentials.view",
    "tenant.paymentPreferences.manage",
    "tenant.paymentPreferences.view",
    "tenant.paymentsIntegration.manage",
    "tenant.paymentsIntegration.view",
    "tenant.pickupDevices.manage",
    "tenant.pickupDevices.read",
    "tenant.pickupPoints.manage",
    "tenant.pickupPoints.read",
    "tenant.policyApproval.manage",
    "tenant.pricingKioskOverride.manage",
    "tenant.products.manage",
    "tenant.products.view",
    "tenant.reconciliation.read",
    "tenant.systemFeatureFlags.manage",
    "tenant.systemFeatureFlags.view",
    "tenant.systemHealth.manage",
    "tenant.systemHealth.view",
    "tenant.systemLogs.manage",
    "tenant.systemLogs.view",
    "tenant.systemPii.manage",
    "tenant.systemPii.view",
    "tenant.systemSecrets.manage",
    "tenant.systemSecrets.view",
    "tenant.transactions.manage",
    "tenant.transactions.view",
    "users:admins:create",
    "users:view:manage",
    "users:view:read",
  ];

const AUTHORING_REQUIREMENT_SEED: readonly AuthoringRequirementSeed[] = [
  // RBAC / users
  {
    authoringTokens: [
      "tenant.adminUsers.view/manage",
      "users:view:read",
      "users:admins:create",
      "users:view:manage",
    ],
    requiredBlockKeys: [
      "permission_management_rbac",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // RBAC / users
  {
    authoringTokens: [
      "tenant.adminUserCapabilities.view/manage",
    ],
    requiredBlockKeys: [
      "permission_management_rbac",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // RBAC / users
  {
    authoringTokens: [
      "permissionsCatalog.view",
    ],
    requiredBlockKeys: [
      "permission_management_rbac",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // RBAC / users
  {
    authoringTokens: [
      "tenant.policyApproval.manage",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.products.*",
      "ops:products:read/manage",
    ],
    requiredBlockKeys: [
      "product_vending",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.kiosks.*",
      "ops:sales-points:read/manage",
    ],
    requiredBlockKeys: [
      "sales_point_management",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.inventory.view/manage",
      "ops:inventory:read/manage",
    ],
    requiredBlockKeys: [
      "inventory_management",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.inventory.incidentHighImpact.review",
      "ops:inventory:incident_review_high_impact",
    ],
    requiredBlockKeys: [
      "inventory_incidents",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.donationProjects.*",
      "ops:donation-projects:read/manage",
    ],
    requiredBlockKeys: [
      "donation",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.donationTemplates.*",
      "ops:donation-templates:read/manage",
    ],
    requiredBlockKeys: [
      "donation",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.kioskDonationAssign.manage",
      "tenant.kioskDonationAmounts.manage",
      "ops:sales-points:donation:assign/amounts",
    ],
    requiredBlockKeys: [
      "donation",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Catalog
  {
    authoringTokens: [
      "tenant.branding.*",
      "ops:branding:read/manage",
    ],
    requiredBlockKeys: [
      "tenant_ops_settings",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.orders.complete",
      "ops:orders:complete",
    ],
    requiredBlockKeys: [
      "fulfillment_queue",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.orders.fulfill.read/update",
      "ops:orders:fulfill:read/update",
    ],
    requiredBlockKeys: [
      "fulfillment_queue",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.orders.pickup.scan/refuse/hold/reprint",
    ],
    requiredBlockKeys: [
      "staff_pickup_scan",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.orders.pickup.holdFloorOverride",
      "hold_floor_override",
      "ops:inventory:checkup.hold_floor_override",
    ],
    requiredBlockKeys: [
      "inventory_management",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.pickupPoints.*",
    ],
    requiredBlockKeys: [
      "pickup_points",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Orders
  {
    authoringTokens: [
      "tenant.pickupDevices.*",
      "pickup_devices:read/write",
    ],
    requiredBlockKeys: [
      "fulfillment_queue",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.paymentCredentials.*",
      "tenant.paymentsIntegration.*",
      "config:payments:read/manage",
    ],
    requiredBlockKeys: [
      "payment_rails_strategy",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.paymentPreferences.*",
    ],
    requiredBlockKeys: [
      "tenant_ops_settings",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.bankAccounts.*",
    ],
    requiredBlockKeys: [
      "bank_account_administration",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.bankInbox.*",
      "tenant.paymentClaims.approve",
    ],
    requiredBlockKeys: [
      "bank_inbox_claims_api",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments — copy PAYMENTS_HUB_NAV_ENTITLEMENT_ALL_OF
  {
    authoringTokens: [
      "tenant.reconciliation.read",
    ],
    requiredBlockKeys: [...PAYMENTS_HUB_NAV_ENTITLEMENT_ALL_OF],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.transactions.*",
      "ops:transactions:read/manage",
    ],
    requiredBlockKeys: [
      "transactions",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments — hub chrome (same ALL_OF as reconciliation)
  {
    authoringTokens: [
      "tenant.financeView.*",
      "tenant.financeDetailed.*",
      "tenant.financePii.*",
      "tenant.financeExport.*",
      "finance:view:*|finance:detailed:*|finance:pii:*|finance:export:*",
    ],
    requiredBlockKeys: [...PAYMENTS_HUB_NAV_ENTITLEMENT_ALL_OF],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.financeSettlements.*",
      "finance:settlements:*",
    ],
    requiredBlockKeys: [
      "payment_reconciliation",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.financeRefunds.*",
      "finance:refunds:*",
    ],
    requiredBlockKeys: [
      "transactions",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "tenant.financeApproveSettlement.manage",
    ],
    requiredBlockKeys: [
      "payment_reconciliation",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Payments
  {
    authoringTokens: [
      "exceptions.refundResolve",
    ],
    requiredBlockKeys: [
      "transactions",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Comms
  {
    authoringTokens: [
      "tenant.comms.credentials.*",
    ],
    requiredBlockKeys: [
      "comms_governance",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Comms — commercial admin:outbox / tenant.outbox caps are entitlementExempt.
  // Události tab/nav/SIC APIs gate solely via incident_centre_ui (route registry).
  // Inbox routes gate via admin_notifications. Do NOT couple outbox grants to SIC.
  // Platform platform.successIncident.* / platform.outbox.* / dev:outbox:* stay
  // entitlementExempt (SUPER_DEV_ONLY) via other rows.
  {
    authoringTokens: [
      "tenant.outbox.*",
      "admin:outbox:read/manage",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Comms
  {
    authoringTokens: [
      "tenant.adminEvents.subscribe",
    ],
    requiredBlockKeys: [
      "tenant_ops_settings",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Analytics
  {
    authoringTokens: [
      "tenant.analyticsSummary.*",
      "analytics:summary:read/manage",
    ],
    requiredBlockKeys: [
      "analytics_explore",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Analytics — detailed views (RBAC tier inside Analytika)
  {
    authoringTokens: [
      "tenant.analyticsDetailed.*",
      "analytics:detailed:read/manage",
    ],
    requiredBlockKeys: [
      "analytics_explore",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Analytics — PII explore (entitlement + capability)
  {
    authoringTokens: [
      "tenant.analyticsPii.*",
      "analytics:pii:read/manage",
    ],
    requiredBlockKeys: [...EXPLORE_ENTITLEMENT_ALL_OF],
    match: 'ALL',
  },
  // Analytics — benchmark tab (RBAC tier inside Analytika)
  {
    authoringTokens: [
      "tenant.analyticsBenchmark.view",
      "analytics:benchmark:read",
    ],
    requiredBlockKeys: [
      "analytics_explore",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Analytics — Mission Control / Přehled
  {
    authoringTokens: [
      "analytics:mission-control:read/export",
    ],
    requiredBlockKeys: [
      "analytics_overview",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "tenant.configPricing.*",
      "tenant.pricingKioskOverride.manage",
      "config:pricing:*",
      "config:pricing:kiosk:override",
    ],
    requiredBlockKeys: [
      "tax_management",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "tenant.configTenant.*",
      "config:tenant:read/manage",
    ],
    requiredBlockKeys: [
      "tenant_ops_settings",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "tenant.systemHealth.*",
      "tenant.systemFeatureFlags.*",
      "tenant.systemSecrets.*",
      "system:health:*|system:feature-flags:*|system:secrets:*",
    ],
    requiredBlockKeys: [
      "tenant_ops_settings",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "tenant.systemLogs.*",
      "system:logs:*",
    ],
    requiredBlockKeys: [
      "audit_logs_admin_ui",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "tenant.systemPii.*",
      "system:pii:*",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "exceptions.complianceSensitiveAccess",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Tax/config
  {
    authoringTokens: [
      "exceptions.tenantPermanentDelete",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Loyalty
  {
    authoringTokens: [
      "loyalty:wallet:read",
      "loyalty:coupons:*",
      "loyalty:campaigns:*",
      "loyalty:enrollment:manage",
      "loyalty:reports:read",
      "loyalty:config:*",
      "loyalty:profiling:consent",
    ],
    requiredBlockKeys: [
      "loyalty_program",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Loyalty
  {
    authoringTokens: [
      "promo:rewards:*",
      "promo:events:*",
    ],
    requiredBlockKeys: [
      "promotions_program",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Loyalty
  {
    authoringTokens: [
      "ops:sales-points:provider-slots:read",
    ],
    requiredBlockKeys: [
      "surface_kiosk",
    ] as const satisfies readonly EntitlementBlockKey[],
    match: 'ALL',
  },
  // Loyalty
  {
    authoringTokens: [
      "loyalty:platform-campaigns:manage",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Out-of-U
  {
    authoringTokens: [
      "platform.aggregates.manage",
      "platform.aggregates.view",
      "platform.analyticsExplore.manage",
      "platform.analyticsExplore.view",
      "platform.analyticsPipeline.manage",
      "platform.analyticsPipeline.view",
      "platform.auditFinalizeIncident.manage",
      "platform.categories.manage",
      "platform.categories.view",
      "platform.complianceAudit.view",
      "platform.complianceGdpr.view",
      "platform.complianceRetentionDelete.manage",
      "platform.devUsers.manage",
      "platform.devUsers.view",
      "platform.hardeningMetrics.view",
      "platform.httpStorm.manage",
      "platform.httpStorm.view",
      "platform.outbox.manage",
      "platform.outbox.view",
      "platform.outboxReplay.approvalRequestApprove",
      "platform.outboxReplay.approvalRequestCreate",
      "platform.outboxReplay.approvalRequestRevoke",
      "platform.outboxReplay.dryRun",
      "platform.outboxReplay.execute",
      "platform.overview.manage",
      "platform.overview.view",
      "platform.reconciliation.manage",
      "platform.reconciliation.view",
      "platform.retention.manage",
      "platform.retention.view",
      "platform.retentionWorkers.manage",
      "platform.retentionWorkers.view",
      "platform.successIncident.manage",
      "platform.successIncident.view",
      "platform.tenantPayments.manage",
      "platform.tenants.manage",
      "platform.tenants.view",
      "platform.userCapabilities.manage",
      "platform.userCapabilities.view",
      "platform.userTenantAssignments.manage",
      "platform.userTenantAssignments.view",
      "platform.users.manage",
      "platform.users.view",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Out-of-U
  {
    authoringTokens: [
      "exceptions.crossTenantReplayExecute",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Out-of-U
  {
    authoringTokens: [
      "dev:aggregates:read",
      "dev:aggregates:run",
      "dev:analytics:explore:export",
      "dev:analytics:explore:read",
      "dev:analytics:mission-control:export",
      "dev:analytics:mission-control:read",
      "dev:analytics:read",
      "dev:analytics:run",
      "dev:compliance:audit:read",
      "dev:compliance:gdpr:read",
      "dev:outbox:approve:replay",
      "dev:outbox:manage",
      "dev:outbox:operate:abandon",
      "dev:outbox:operate:replay:dryrun",
      "dev:outbox:operate:replay:execute",
      "dev:outbox:operate:retry",
      "dev:outbox:read",
      "dev:overview:manage",
      "dev:overview:read",
      "dev:reconciliation:manage",
      "dev:reconciliation:read",
      "dev:retention:manage",
      "dev:retention:read",
      "dev:tenants:create",
      "dev:tenants:delete",
      "dev:tenants:manage",
      "dev:tenants:payments:manage",
      "dev:tenants:read",
      "dev:users:manage",
      "dev:users:read",
      "dev:workers:read",
      "dev:workers:resolve-refund-candidate",
      "dev:workers:run",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
  // Out-of-U
  {
    authoringTokens: [
      "principal.view",
      "account.self.manage",
    ],
    entitlementExempt: true,
    match: 'ALL',
  },
];

function buildRuntimeRequirements(
  seed: readonly AuthoringRequirementSeed[],
  liveIds: readonly string[],
): readonly CapabilityEntitlementRequirement[] {
  const rows: CapabilityEntitlementRequirement[] = [];
  for (const row of seed) {
    const capabilityKeys = expandAuthoringTokens(row.authoringTokens, liveIds);
    for (const key of capabilityKeys) {
      if (key.includes('*') || key.includes('|') || key.includes('/')) {
        throw new Error(
          `capabilityKeys must be expanded literals only; got ${JSON.stringify(key)}`,
        );
      }
    }
    if (row.entitlementExempt === true) {
      rows.push({
        capabilityKeys,
        entitlementExempt: true,
        match: row.match,
      });
      continue;
    }
    const requiredBlockKeys = row.requiredBlockKeys ?? [];
    if (requiredBlockKeys.length === 0) {
      throw new Error('non-exempt grant row requires non-empty requiredBlockKeys');
    }
    for (const block of requiredBlockKeys) {
      if ((NEVER_REQUIRED_BLOCK_KEYS as readonly string[]).includes(block)) {
        throw new Error(
          `requiredBlockKeys must not include CORE_IMMUTABLE ${block}`,
        );
      }
      if (block === 'order_pickup_infrastructure') {
        throw new Error('pickup grants must use leaf staff_pickup_scan only');
      }
    }
    rows.push({
      capabilityKeys,
      requiredBlockKeys,
      match: row.match,
    });
  }
  return rows;
}

export const CAPABILITY_ENTITLEMENT_REQUIREMENTS: readonly CapabilityEntitlementRequirement[] =
  buildRuntimeRequirements(AUTHORING_REQUIREMENT_SEED, CAPABILITY_ENTITLEMENT_LIVE_IDS_SNAPSHOT);

type RequirementIndexEntry =
  | { readonly kind: 'exempt' }
  | {
      readonly kind: 'blocks';
      readonly blockKeys: readonly EntitlementBlockKey[];
      readonly match: CapabilityEntitlementMatch;
    };

function requirementSignature(entry: RequirementIndexEntry): string {
  if (entry.kind === 'exempt') return 'exempt';
  return `blocks:${entry.match}:${[...entry.blockKeys].join(',')}`;
}

function buildCapabilityIndex(
  requirements: readonly CapabilityEntitlementRequirement[],
): ReadonlyMap<string, RequirementIndexEntry> {
  const index = new Map<string, RequirementIndexEntry>();
  for (const row of requirements) {
    const entry: RequirementIndexEntry =
      row.entitlementExempt === true
        ? { kind: 'exempt' }
        : {
            kind: 'blocks',
            blockKeys: row.requiredBlockKeys ?? [],
            match: row.match,
          };
    if (entry.kind === 'blocks' && entry.blockKeys.length === 0) {
      throw new Error('empty requiredBlockKeys on non-exempt row');
    }
    // ALL = every listed block write-ALLOW; ANY = at least one (shared caps across packs).
    const sig = requirementSignature(entry);
    for (const key of row.capabilityKeys) {
      const existing = index.get(key);
      if (existing !== undefined) {
        if (requirementSignature(existing) !== sig) {
          throw new Error(
            `capability ${JSON.stringify(key)} mapped to conflicting entitlement requirements`,
          );
        }
        continue;
      }
      index.set(key, entry);
    }
  }
  return index;
}

const CAPABILITY_REQUIREMENT_INDEX = buildCapabilityIndex(CAPABILITY_ENTITLEMENT_REQUIREMENTS);

const BLOCK_TO_CAPABILITIES: ReadonlyMap<EntitlementBlockKey, readonly string[]> = (() => {
  const map = new Map<EntitlementBlockKey, string[]>();
  for (const [capabilityKey, entry] of CAPABILITY_REQUIREMENT_INDEX) {
    if (entry.kind !== 'blocks') continue;
    for (const blockKey of entry.blockKeys) {
      const list = map.get(blockKey) ?? [];
      list.push(capabilityKey);
      map.set(blockKey, list);
    }
  }
  for (const [blockKey, list] of map) {
    list.sort((a, b) => a.localeCompare(b));
    map.set(blockKey, list);
  }
  return map;
})();

export function requiredBlocksForCapability(capabilityKey: string): CapabilityEntitlementLookup {
  const entry = CAPABILITY_REQUIREMENT_INDEX.get(capabilityKey);
  if (entry === undefined) {
    return { kind: 'unmapped' };
  }
  if (entry.kind === 'exempt') {
    return { kind: 'exempt' };
  }
  return {
    kind: 'blocks',
    blockKeys: entry.blockKeys,
    match: entry.match,
  };
}

export function capabilitiesRequiringBlock(blockKey: EntitlementBlockKey): readonly string[] {
  return BLOCK_TO_CAPABILITIES.get(blockKey) ?? [];
}

/**
 * Evaluate whether a capability is entitled given a write-ALLOW predicate on block keys.
 * ALL: every required block must be write-allowed.
 * ANY: at least one required block must be write-allowed (reserved; CapMap is ALL-only —
 * commercial outbox grants are entitlementExempt, not ANY(SIC|notifications)).
 */
export function evaluateCapabilityEntitlement(
  capabilityKey: string,
  options: { readonly isWriteAllowed: (blockKey: EntitlementBlockKey) => boolean },
): EvaluateCapabilityEntitlementResult {
  const lookup = requiredBlocksForCapability(capabilityKey);
  if (lookup.kind === 'exempt') {
    return { allowed: true, missingBlockKeys: [] };
  }
  if (lookup.kind === 'unmapped') {
    return { allowed: false, missingBlockKeys: [] };
  }
  if (lookup.blockKeys.length === 0) {
    return { allowed: false, missingBlockKeys: [] };
  }
  if (lookup.match === 'ANY') {
    const anyAllowed = lookup.blockKeys.some((k) => options.isWriteAllowed(k));
    if (anyAllowed) {
      return { allowed: true, missingBlockKeys: [] };
    }
    return { allowed: false, missingBlockKeys: [...lookup.blockKeys] };
  }
  // ALL
  const missingBlockKeys = lookup.blockKeys.filter((k) => !options.isWriteAllowed(k));
  return {
    allowed: missingBlockKeys.length === 0,
    missingBlockKeys,
  };
}
