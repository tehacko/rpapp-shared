import {
  ADMIN_MFA_BLOCK_KEY,
  DEFAULT_OFF_ROLLOUT_BLOCK_KEYS,
  isDefaultOffRolloutBlockKey,
} from '../adminMfaEntitlement.js';
import { isEntitlementBlockKey } from '../catalog.js';
import {
  COMMERCIAL_PACKAGING,
  COMMERCIAL_PLAN_IDS,
  evaluateCommercialPackageDecision,
} from '../index.js';

describe('adminMfaEntitlement', () => {
  it('exports admin_mfa as a live catalog key in the default-off rollout set', () => {
    expect(ADMIN_MFA_BLOCK_KEY).toBe('admin_mfa');
    expect(isEntitlementBlockKey(ADMIN_MFA_BLOCK_KEY)).toBe(true);
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain(ADMIN_MFA_BLOCK_KEY);
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain('tenant_brand_kit');
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain('payment_multi_currency');
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain('audit_logs_admin_ui');
    expect(isDefaultOffRolloutBlockKey('admin_mfa')).toBe(true);
    expect(isDefaultOffRolloutBlockKey('tenant_brand_kit')).toBe(true);
    expect(isDefaultOffRolloutBlockKey('admin_notifications')).toBe(false);
    // Commercial Události default-off is CONDITIONAL + FULL_DEMO_ALWAYS_OFF seed —
    // NOT platform /admin/me DENY rollout (platform snapshot must still ALLOW)
    expect(isDefaultOffRolloutBlockKey('incident_centre_ui')).toBe(false);
  });

  it('B-AC-13 packaging: admin_mfa is NON_COMMERCIAL (tariff DEFER, never DENY)', () => {
    expect(COMMERCIAL_PACKAGING.admin_mfa.commercialPlacements).toEqual(['NON_COMMERCIAL']);
    for (const plan of COMMERCIAL_PLAN_IDS) {
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.admin_mfa)).toBe(
        'DEFER',
      );
      expect(evaluateCommercialPackageDecision(plan, COMMERCIAL_PACKAGING.admin_mfa)).not.toBe(
        'DENY',
      );
    }
  });

  it('B-AC-14: commercial plan is not an input to MFA ON/OFF identity helpers', () => {
    // Rollout helpers only take blockKey strings — no CommercialPlanId parameter.
    expect(isDefaultOffRolloutBlockKey.length).toBe(1);
    expect(isDefaultOffRolloutBlockKey.toString()).not.toMatch(
      /CommercialPlanId|\bFREE\b|\bPRO\b|\bGROWTH\b/,
    );

    // ON/OFF identity is the default-off rollout set — same boolean for every plan id
    // because plan is never consulted (arity=1; packaging axis is B-AC-13 only).
    const offIdentity = isDefaultOffRolloutBlockKey(ADMIN_MFA_BLOCK_KEY);
    expect(offIdentity).toBe(true);
    for (const _plan of COMMERCIAL_PLAN_IDS) {
      expect(isDefaultOffRolloutBlockKey(ADMIN_MFA_BLOCK_KEY)).toBe(offIdentity);
    }
    expect(typeof isDefaultOffRolloutBlockKey(ADMIN_MFA_BLOCK_KEY)).toBe('boolean');
  });
});
