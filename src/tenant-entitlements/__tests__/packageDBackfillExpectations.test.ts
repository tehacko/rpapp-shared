/**
 * Package D / D0 - technical backfill derivation contract (not a hash pin).
 *
 * Documents how prepare/execute derives missing target policy rows from source
 * parents. Runtime migration lives in up-backend scripts; this suite locks the
 * shared catalog parent/source pairing the planner must honor.
 *
 * Derivation (Spec section 9 / D-AC-06):
 * | Target                   | Source posture                     |
 * | ------------------------ | ---------------------------------- |
 * | inventory_operations     | inventory_management               |
 * | audit_intelligence       | audit_logs_admin_ui                |
 * | team_management_core     | permission_management_rbac         |
 *
 * Rules: copy axes when target missing; never overwrite; never infer
 * commercialPlan; parent OFF/HARD OFF wins (parentBlockers).
 */
import { describe, expect, it } from '@jest/globals';
import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
} from '../catalog.js';

/** D0 additive targets - must exist in catalog v12 and be missing before prepare. */
const PACKAGE_D_BACKFILL_TARGETS = [
  'inventory_operations',
  'audit_intelligence',
  'team_management_core',
] as const;

/**
 * Source keys whose effective posture seeds a missing target (technical baseline).
 * Sibling order: ops from management, intelligence from audit_logs, team from rbac.
 */
const PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION = {
  inventory_operations: 'inventory_management',
  audit_intelligence: 'audit_logs_admin_ui',
  team_management_core: 'permission_management_rbac',
} as const satisfies Record<(typeof PACKAGE_D_BACKFILL_TARGETS)[number], string>;

describe('Package D D0 technical backfill expectations', () => {
  it('pins catalog v12/54 so D0 targets are present as keys', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(12);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(54);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(54);
    for (const target of PACKAGE_D_BACKFILL_TARGETS) {
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(target);
    }
  });

  it('documents derivation: missing ops from management, intelligence from audit_logs, team from rbac', () => {
    expect(PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION).toEqual({
      inventory_operations: 'inventory_management',
      audit_intelligence: 'audit_logs_admin_ui',
      team_management_core: 'permission_management_rbac',
    });
  });

  it('keeps inventory_operations catalog-parented under inventory_management', () => {
    const ops = getEntitlementBlockCatalogEntry('inventory_operations');
    expect(ops.parentKeys).toEqual(['inventory_management']);
    expect(PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION.inventory_operations).toBe(
      'inventory_management',
    );
  });

  it('keeps audit_intelligence catalog-parented under audit_logs_admin_ui', () => {
    const intelligence = getEntitlementBlockCatalogEntry('audit_intelligence');
    expect(intelligence.parentKeys).toEqual(['audit_logs_admin_ui']);
    expect(PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION.audit_intelligence).toBe(
      'audit_logs_admin_ui',
    );
  });

  it('derives team_management_core from pre-split permission_management_rbac posture', () => {
    const rbac = getEntitlementBlockCatalogEntry('permission_management_rbac');
    expect(rbac.parentKeys).toEqual(['team_management_core']);
    expect(PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION.team_management_core).toBe(
      'permission_management_rbac',
    );
  });

  it('forbids commercialPlan inference in the documented contract', () => {
    for (const [target, source] of Object.entries(PACKAGE_D_TECHNICAL_BACKFILL_DERIVATION)) {
      expect(target).not.toMatch(/commercialPlan/i);
      expect(source).not.toMatch(/commercialPlan|FREE|PRO|GROWTH/i);
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(target);
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(source);
    }
  });
});
