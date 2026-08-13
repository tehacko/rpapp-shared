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
    expect(isDefaultOffRolloutBlockKey('admin_mfa')).toBe(true);
    expect(isDefaultOffRolloutBlockKey('admin_notifications')).toBe(false);
  });
});
