import { describe, expect, it } from '@jest/globals';
import {
  expandRoleTemplatePackDualKeys,
  isExcludedLeftoverOpsForRoleTemplates,
  ROLE_TEMPLATE_CANONICAL_OPS_PAIRS,
  ROLE_TEMPLATE_LEFTOVER_OPS_EXCLUSION,
  TEMPLATE_CANONICAL_MAPPED_LEFTOVER_OPS,
  TEMPLATE_LEFTOVER_OPS_EXCLUSIONS,
} from './templateDualKeyMap.js';

describe('templateDualKeyMap G8', () => {
  it('pins Canonical 25 ops:* pairs including ops:complaints and accounting-export twins', () => {
    expect(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS).toHaveLength(25);
    expect(new Set(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => pair.ops)).size).toBe(25);
    expect(new Set(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => pair.canonical)).size).toBe(25);
    expect(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS).toEqual(
      expect.arrayContaining([
        { canonical: 'tenant.accountingExport.view', ops: 'ops:accounting-export:read' },
        { canonical: 'tenant.accountingExport.create', ops: 'ops:accounting-export:create' },
        { canonical: 'tenant.opsComplaints.view', ops: 'ops:complaints:read' },
        { canonical: 'tenant.opsComplaints.intake', ops: 'ops:complaints:intake' },
      ]),
    );
  });

  it('leftover exclusion is never-invent ∪ canonical-mapped leftover', () => {
    expect(ROLE_TEMPLATE_LEFTOVER_OPS_EXCLUSION).toEqual([
      ...TEMPLATE_LEFTOVER_OPS_EXCLUSIONS,
      ...TEMPLATE_CANONICAL_MAPPED_LEFTOVER_OPS,
    ]);
    expect(isExcludedLeftoverOpsForRoleTemplates('ops:payment-preferences:read')).toBe(true);
    expect(isExcludedLeftoverOpsForRoleTemplates('ops:branding:read')).toBe(true);
    expect(isExcludedLeftoverOpsForRoleTemplates('ops:products:read')).toBe(false);
  });

  it('pack expand dual-keys products/SP/inventory/transactions only — not leftover branding ops', () => {
    const expanded = expandRoleTemplatePackDualKeys([
      'ops:products:read',
      'tenant.branding.view',
    ]);
    expect(expanded).toEqual(
      expect.arrayContaining(['ops:products:read', 'tenant.products.view', 'tenant.branding.view']),
    );
    expect(expanded).not.toContain('ops:branding:read');
    expect(expanded).not.toContain('ops:branding:manage');
  });
});
