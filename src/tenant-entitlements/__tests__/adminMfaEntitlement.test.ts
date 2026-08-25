import {
  ADMIN_MFA_BLOCK_KEY,
  DEFAULT_OFF_ROLLOUT_BLOCK_KEYS,
  isDefaultOffRolloutBlockKey,
} from '../adminMfaEntitlement.js';
import { isEntitlementBlockKey } from '../catalog.js';

describe('adminMfaEntitlement', () => {
  it('exports admin_mfa as a live catalog key in the default-off rollout set', () => {
    expect(ADMIN_MFA_BLOCK_KEY).toBe('admin_mfa');
    expect(isEntitlementBlockKey(ADMIN_MFA_BLOCK_KEY)).toBe(true);
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain(ADMIN_MFA_BLOCK_KEY);
    expect(DEFAULT_OFF_ROLLOUT_BLOCK_KEYS).toContain('tenant_brand_kit');
    expect(isDefaultOffRolloutBlockKey('admin_mfa')).toBe(true);
    expect(isDefaultOffRolloutBlockKey('tenant_brand_kit')).toBe(true);
    expect(isDefaultOffRolloutBlockKey('admin_notifications')).toBe(false);
    // Commercial Události default-off is CONDITIONAL + FULL_DEMO_ALWAYS_OFF seed —
    // NOT platform /admin/me DENY rollout (platform snapshot must still ALLOW)
    expect(isDefaultOffRolloutBlockKey('incident_centre_ui')).toBe(false);
  });
});
