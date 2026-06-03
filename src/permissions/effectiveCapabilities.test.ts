import {
  BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS,
  BRIDGE_PARITY_FIXTURE_GRANTS,
  hasAnyEffectiveCapability,
  hasEffectiveCapability,
} from './effectiveCapabilities.js';

describe('effectiveCapabilities client mirror', () => {
  it('matches shared/backend parity fixture', () => {
    for (const target of BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS) {
      expect(hasEffectiveCapability([...BRIDGE_PARITY_FIXTURE_GRANTS], target)).toBe(true);
    }
  });

  it('users:admins:create implies tenant.adminUsers.manage', () => {
    expect(hasEffectiveCapability(['users:admins:create'], 'tenant.adminUsers.manage')).toBe(
      true,
    );
  });

  it('hasAnyEffectiveCapability matches bridge', () => {
    expect(
      hasAnyEffectiveCapability(['users:admins:create'], [
        'tenant.adminUsers.manage',
        'platform.tenants.view',
      ]),
    ).toBe(true);
  });
});
