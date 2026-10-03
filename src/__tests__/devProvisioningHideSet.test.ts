import {
  AUDIT_EVENT_CODES,
  DEV_PROVISIONING_EVENT_CODES,
  isDevProvisioningEventCode,
} from '../auditEventCodes.js';

describe('DEV_PROVISIONING_EVENT_CODES hide-set (shared)', () => {
  it('hides only context.entered and not entitlement_policy.changed', () => {
    expect([...DEV_PROVISIONING_EVENT_CODES]).toEqual(['dev.tenant.context.entered']);
    expect(isDevProvisioningEventCode('dev.tenant.context.entered')).toBe(true);
    expect(isDevProvisioningEventCode('dev.tenant.entitlement_policy.changed')).toBe(false);
    expect(AUDIT_EVENT_CODES).toContain('dev.tenant.entitlement_policy.changed');
  });
});
