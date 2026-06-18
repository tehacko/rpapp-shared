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

  it('dev:workers:read implies platform.retentionWorkers.view', () => {
    expect(hasEffectiveCapability(['dev:workers:read'], 'platform.retentionWorkers.view')).toBe(
      true,
    );
  });

  it('dev:workers:run implies platform.retentionWorkers.manage', () => {
    expect(hasEffectiveCapability(['dev:workers:run'], 'platform.retentionWorkers.manage')).toBe(
      true,
    );
  });

  it('dev:aggregates:read implies platform.aggregates.view', () => {
    expect(hasEffectiveCapability(['dev:aggregates:read'], 'platform.aggregates.view')).toBe(true);
  });

  it('dev:aggregates:run implies platform.aggregates.manage', () => {
    expect(hasEffectiveCapability(['dev:aggregates:run'], 'platform.aggregates.manage')).toBe(
      true,
    );
  });

  it('platform.retentionWorkers.view does not imply manage (forward-only)', () => {
    expect(
      hasEffectiveCapability(['platform.retentionWorkers.view'], 'platform.retentionWorkers.manage'),
    ).toBe(false);
    expect(
      hasEffectiveCapability(['platform.retentionWorkers.view'], 'dev:workers:run'),
    ).toBe(false);
  });

  it('platform.aggregates.view does not imply manage (forward-only)', () => {
    expect(
      hasEffectiveCapability(['platform.aggregates.view'], 'platform.aggregates.manage'),
    ).toBe(false);
  });

  it('dev:compliance bridges imply canonical view', () => {
    expect(
      hasEffectiveCapability(['dev:compliance:audit:read'], 'platform.complianceAudit.view'),
    ).toBe(true);
    expect(
      hasEffectiveCapability(['dev:compliance:gdpr:read'], 'platform.complianceGdpr.view'),
    ).toBe(true);
  });

  it('tenant.bankInbox.read bridges to tenant.reconciliation.read (MB-P0-14)', () => {
    expect(
      hasEffectiveCapability(['tenant.bankInbox.read'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('tenant.bankInbox.manage bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['tenant.bankInbox.manage'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('tenant.paymentClaims.approve bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['tenant.paymentClaims.approve'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('ops:payment-preferences:read bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['ops:payment-preferences:read'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('ops:payment-preferences:manage bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['ops:payment-preferences:manage'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('tenant.paymentPreferences.view bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['tenant.paymentPreferences.view'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });

  it('tenant.paymentPreferences.manage bridges to tenant.reconciliation.read', () => {
    expect(
      hasEffectiveCapability(['tenant.paymentPreferences.manage'], 'tenant.reconciliation.read'),
    ).toBe(true);
  });
});
