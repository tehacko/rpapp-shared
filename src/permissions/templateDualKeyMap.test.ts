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
  it('pins Canonical 23 ops:* pairs including ops:complaints twins', () => {
    expect(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS).toHaveLength(23);
    expect(new Set(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => pair.ops)).size).toBe(23);
    expect(new Set(ROLE_TEMPLATE_CANONICAL_OPS_PAIRS.map((pair) => pair.canonical)).size).toBe(23);
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
