/**
 * Canonical tenant.* ↔ leftover ops:* dual-key map for role templates (FR-13).
 * Do not invent CT-316/318/323. Packs already grant ops:products/sales-points/inventory/transactions.
 */

export const ROLE_TEMPLATE_CANONICAL_OPS_PAIRS: readonly {
  readonly canonical: string;
  readonly ops: string;
}[] = [
  { canonical: 'tenant.orders.complete', ops: 'ops:orders:complete' },
  { canonical: 'tenant.orders.fulfill.read', ops: 'ops:orders:fulfill:read' },
  { canonical: 'tenant.orders.fulfill.update', ops: 'ops:orders:fulfill:update' },
  { canonical: 'tenant.orders.pickup.holdFloorOverride', ops: 'ops:inventory:checkup.hold_floor_override' },
  { canonical: 'tenant.products.view', ops: 'ops:products:read' },
  { canonical: 'tenant.products.manage', ops: 'ops:products:manage' },
  { canonical: 'tenant.kiosks.view', ops: 'ops:sales-points:read' },
  { canonical: 'tenant.kiosks.manage', ops: 'ops:sales-points:manage' },
  { canonical: 'tenant.inventory.view', ops: 'ops:inventory:read' },
  { canonical: 'tenant.inventory.manage', ops: 'ops:inventory:manage' },
  { canonical: 'tenant.inventory.incidentHighImpact.review', ops: 'ops:inventory:incident_review_high_impact' },
  { canonical: 'tenant.transactions.view', ops: 'ops:transactions:read' },
  { canonical: 'tenant.transactions.manage', ops: 'ops:transactions:manage' },
  { canonical: 'tenant.donationProjects.view', ops: 'ops:donation-projects:read' },
  { canonical: 'tenant.donationProjects.manage', ops: 'ops:donation-projects:manage' },
  { canonical: 'tenant.branding.view', ops: 'ops:branding:read' },
  { canonical: 'tenant.branding.manage', ops: 'ops:branding:manage' },
  { canonical: 'tenant.donationTemplates.view', ops: 'ops:donation-templates:read' },
  { canonical: 'tenant.donationTemplates.manage', ops: 'ops:donation-templates:manage' },
  { canonical: 'tenant.kioskDonationAssign.manage', ops: 'ops:sales-points:donation:assign' },
  { canonical: 'tenant.kioskDonationAmounts.manage', ops: 'ops:sales-points:donation:amounts' },
] as const;

/** Leftover ops:* — do not invent into TenantViewer/OpsManager packs. */
export const ROLE_TEMPLATE_LEFTOVER_OPS_EXCLUSION: readonly string[] = [
  'ops:sales-points:provider-slots:read',
  'ops:payment-preferences:read',
  'ops:payment-preferences:manage',
  'ops:orders:complete',
  'ops:orders:fulfill:read',
  'ops:orders:fulfill:update',
  'ops:inventory:checkup.hold_floor_override',
  'ops:inventory:incident_review_high_impact',
  'ops:donation-projects:read',
  'ops:donation-projects:manage',
  'ops:donation-templates:read',
  'ops:donation-templates:manage',
  'ops:sales-points:donation:assign',
  'ops:sales-points:donation:amounts',
  'ops:branding:read',
  'ops:branding:manage',
];

export function opsStarForCanonical(canonical: string): string | undefined {
  return ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.find((pair) => pair.canonical === canonical)?.ops;
}

export function canonicalForOpsStar(ops: string): string | undefined {
  return ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.find((pair) => pair.ops === ops)?.canonical;
}

export const ROLE_TEMPLATE_PACK_OPS_KEYS = [
  'ops:products:read',
  'ops:products:manage',
  'ops:sales-points:read',
  'ops:sales-points:manage',
  'ops:inventory:read',
  'ops:inventory:manage',
  'ops:transactions:read',
  'ops:transactions:manage',
] as const;

const LEFTOVER_OPS_SET = new Set<string>(ROLE_TEMPLATE_LEFTOVER_OPS_EXCLUSION);
const PACK_OPS_SET = new Set<string>(ROLE_TEMPLATE_PACK_OPS_KEYS);

export function isExcludedLeftoverOpsForRoleTemplates(capability: string): boolean {
  return LEFTOVER_OPS_SET.has(capability);
}

/**
 * Expand only the 8 pack ops:* ↔ Canonical twins.
 * Do not add leftover mapped ops:* (branding/donation/orders/…) into packs.
 */
export function expandRoleTemplatePackDualKeys(
  capabilities: readonly string[],
): readonly string[] {
  const expanded = new Set<string>(capabilities);
  for (const capability of capabilities) {
    if (PACK_OPS_SET.has(capability)) {
      const canonical = canonicalForOpsStar(capability);
      if (canonical !== undefined) {
        expanded.add(canonical);
      }
      continue;
    }
    const ops = opsStarForCanonical(capability);
    if (ops !== undefined && PACK_OPS_SET.has(ops)) {
      expanded.add(ops);
    }
  }
  return [...expanded];
}

export type TemplateDualKeyPair = (typeof ROLE_TEMPLATE_CANONICAL_OPS_PAIRS)[number];

export const TEMPLATE_DUAL_KEY_PAIRS = ROLE_TEMPLATE_CANONICAL_OPS_PAIRS;

export const TEMPLATE_OPS_TO_CANONICAL: Readonly<Record<string, string>> = Object.fromEntries(
  ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => [pair.ops, pair.canonical]),
);

export const TEMPLATE_CANONICAL_TO_OPS: Readonly<Record<string, string>> = Object.fromEntries(
  ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => [pair.canonical, pair.ops]),
);

export type RoleTemplatePackOpsKey = (typeof ROLE_TEMPLATE_PACK_OPS_KEYS)[number];

export const TEMPLATE_LEFTOVER_OPS_EXCLUSIONS = [
  'ops:sales-points:provider-slots:read',
  'ops:payment-preferences:read',
  'ops:payment-preferences:manage',
] as const;

export const TEMPLATE_CANONICAL_MAPPED_LEFTOVER_OPS = [
  'ops:orders:complete',
  'ops:orders:fulfill:read',
  'ops:orders:fulfill:update',
  'ops:inventory:checkup.hold_floor_override',
  'ops:inventory:incident_review_high_impact',
  'ops:donation-projects:read',
  'ops:donation-projects:manage',
  'ops:donation-templates:read',
  'ops:donation-templates:manage',
  'ops:sales-points:donation:assign',
  'ops:sales-points:donation:amounts',
  'ops:branding:read',
  'ops:branding:manage',
] as const;

export function resolveTemplateDualKeyPair(capability: string): TemplateDualKeyPair | undefined {
  return ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.find(
    (pair) => pair.canonical === capability || pair.ops === capability,
  );
}

export function isRoleTemplatePackOpsKey(value: string): value is RoleTemplatePackOpsKey {
  return (ROLE_TEMPLATE_PACK_OPS_KEYS as readonly string[]).includes(value);
}

