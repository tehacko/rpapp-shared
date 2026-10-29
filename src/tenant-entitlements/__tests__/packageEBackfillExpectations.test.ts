/**
 * Package E / E1 - technical backfill derivation contract (not a hash pin).
 *
 * Documents how prepare/execute derives missing target policy rows from source
 * parents. Runtime migration lives in up-backend scripts; this suite locks the
 * shared catalog parent/source pairing the planner must honor.
 *
 * Derivation:
 * | Target                   | Source posture                     |
 * | ------------------------ | ---------------------------------- |
 * | donation_recurring       | donation                           |
 * | tenant_ops_automation    | tenant_ops_settings                |
 * | restock_alerts           | product_vending                    |
 *
 * Rules: copy axes when target missing; never overwrite; never infer
 * commercialPlan; parent OFF/HARD OFF wins for CONDITIONAL parents
 * (parentBlockers). CORE_REQUIRED tenant_ops_settings is always-active
 * for parent satisfaction - still the technical backfill source.
 */
import { describe, expect, it } from '@jest/globals';
import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
} from '../catalog.js';
import {
  COMMERCIAL_PACKAGING,
  evaluateCommercialPackageDecision,
} from '../commercialPackaging.js';

/** E1 additive targets - must exist in catalog v14 and be missing before prepare. */
const PACKAGE_E_BACKFILL_TARGETS = [
  'donation_recurring',
  'tenant_ops_automation',
  'restock_alerts',
] as const;

/**
 * Source keys whose effective posture seeds a missing target (technical baseline).
 */
const PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION = {
  donation_recurring: 'donation',
  tenant_ops_automation: 'tenant_ops_settings',
  restock_alerts: 'product_vending',
} as const satisfies Record<(typeof PACKAGE_E_BACKFILL_TARGETS)[number], string>;

describe('Package E E1 technical backfill expectations', () => {
  it('pins catalog v14/60 so E1 targets are present as keys', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(14);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(60);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(60);
    for (const target of PACKAGE_E_BACKFILL_TARGETS) {
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(target);
    }
  });

  it('documents derivation: recurring from donation, automation from ops_settings, restock from product_vending', () => {
    expect(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION).toEqual({
      donation_recurring: 'donation',
      tenant_ops_automation: 'tenant_ops_settings',
      restock_alerts: 'product_vending',
    });
  });

  it('keeps donation_recurring catalog-parented under donation', () => {
    const recurring = getEntitlementBlockCatalogEntry('donation_recurring');
    expect(recurring.blockClass).toBe('CONDITIONAL');
    expect(recurring.parentKeys).toEqual(['donation']);
    expect(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION.donation_recurring).toBe('donation');
  });

  it('keeps tenant_ops_automation catalog-parented under tenant_ops_settings', () => {
    const automation = getEntitlementBlockCatalogEntry('tenant_ops_automation');
    expect(automation.blockClass).toBe('CONDITIONAL');
    expect(automation.parentKeys).toEqual(['tenant_ops_settings']);
    expect(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION.tenant_ops_automation).toBe(
      'tenant_ops_settings',
    );
  });

  it('keeps restock_alerts catalog-parented under product_vending', () => {
    const restock = getEntitlementBlockCatalogEntry('restock_alerts');
    expect(restock.blockClass).toBe('CONDITIONAL');
    expect(restock.parentKeys).toEqual(['product_vending']);
    expect(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION.restock_alerts).toBe('product_vending');
  });

  it('forbids commercialPlan inference in the documented contract', () => {
    const forbiddenInferenceTokens = new Set(['commercialPlan', 'FREE', 'PRO', 'GROWTH']);
    for (const [target, source] of Object.entries(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION)) {
      // Exact tokens only — substring /PRO/ must not false-positive on product_vending.
      expect(forbiddenInferenceTokens.has(target)).toBe(false);
      expect(forbiddenInferenceTokens.has(source)).toBe(false);
      expect(target.toLowerCase()).not.toContain('commercialplan');
      expect(source.toLowerCase()).not.toContain('commercialplan');
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(target);
      expect(ENTITLEMENT_BLOCK_KEYS).toContain(source);
    }
  });

  it('covers all 60 keys in commercialPackaging including E PRO placements', () => {
    expect(Object.keys(COMMERCIAL_PACKAGING)).toHaveLength(60);
    expect(COMMERCIAL_PACKAGING.donation_recurring).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.tenant_ops_automation).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
    expect(COMMERCIAL_PACKAGING.restock_alerts).toMatchObject({
      commercialPlacements: ['PRO'],
      alignmentStatus: 'ALIGNED',
    });
  });

  /**
   * E-AC-22 — commercial packaging is a create/reactivate boundary only.
   * PREPARE/backfill derivation must never treat PRO placement / VALIDATE hold
   * as Mode2 / recurring rollout readiness. Packaging has no readiness axes;
   * VALIDATE DEFER ≠ bank Mode2 / reconciliation enablement.
   */
  describe('E-AC-22: commercial packaging never flips Mode2 / rollout readiness', () => {
    it('documents donation_recurring PRO rationale: no Mode2/rollout flip', () => {
      const rationale = COMMERCIAL_PACKAGING.donation_recurring.rationale.toLowerCase();
      expect(rationale).toMatch(/rollout|mode\s*2|mode2/);
      expect(rationale).toMatch(/ne flipuje|never|not.*(flip|enable)|no.*(flip|enable)/);
      expect(rationale).toMatch(/secondary\/validate|validate/);
    });

    it('PRO+VALIDATE: DENY below placement (FREE); DEFER at/above PRO (no readiness; not ladder ALLOW)', () => {
      const rule = COMMERCIAL_PACKAGING.donation_recurring;
      // G12: VALIDATE below placement → DENY; at/above → DEFER hold.
      expect(evaluateCommercialPackageDecision('FREE', rule)).toBe('DENY');
      expect(evaluateCommercialPackageDecision('PRO', rule)).toBe('DEFER');
      expect(evaluateCommercialPackageDecision('GROWTH', rule)).toBe('DEFER');
      // Packaging rule surface is commercial only — no Mode2 / rollout axes.
      expect(rule).toEqual({
        commercialPlacements: ['PRO'],
        alignmentStatus: 'ALIGNED',
        sellabilityStatus: 'VALIDATE',
        rationale: rule.rationale,
      });
      expect(Object.keys(rule)).not.toEqual(
        expect.arrayContaining(['rolloutOrReadiness', 'mode2', 'reconciliationMode']),
      );
    });

    it('technical backfill derivation has no Mode2 / rollout / readiness source', () => {
      for (const [target, source] of Object.entries(PACKAGE_E_TECHNICAL_BACKFILL_DERIVATION)) {
        expect(target).not.toMatch(/rollout|readiness|mode.?2/i);
        expect(source).not.toMatch(/rollout|readiness|mode.?2|commercial/i);
        // Sources are FREE-core / technical parents — never readiness toggles.
        expect(['donation', 'tenant_ops_settings', 'product_vending']).toContain(source);
      }
    });
  });
});
