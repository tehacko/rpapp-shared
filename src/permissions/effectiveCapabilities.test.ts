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

  it('users:view:read implies tenant.adminUsers.view (alias; not users:admins:read)', () => {
    expect(hasEffectiveCapability(['users:view:read'], 'tenant.adminUsers.view')).toBe(true);
    expect(hasEffectiveCapability(['users:view:read'], 'tenant.adminUsers.manage')).toBe(false);
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

  it('LOCKED outbound-grant ban: recon.read alone does not imply approve/manage (ADM-TKT-0403)', () => {
    expect(
      hasEffectiveCapability(['tenant.reconciliation.read'], 'tenant.paymentClaims.approve'),
    ).toBe(false);
    expect(
      hasEffectiveCapability(['tenant.reconciliation.read'], 'tenant.bankInbox.manage'),
    ).toBe(false);
  });

  it('config:payments:manage implies tenant.bankAccounts.manage', () => {
    expect(
      hasEffectiveCapability(['config:payments:manage'], 'tenant.bankAccounts.manage'),
    ).toBe(true);
  });

  it('config:payments:read implies tenant.bankAccounts.read', () => {
    expect(hasEffectiveCapability(['config:payments:read'], 'tenant.bankAccounts.read')).toBe(
      true,
    );
  });

  it('legacy system:logs:read implies tenant.systemLogs.view (forward-only)', () => {
    expect(hasEffectiveCapability(['system:logs:read'], 'tenant.systemLogs.view')).toBe(true);
    expect(hasEffectiveCapability(['tenant.systemLogs.view'], 'system:logs:read')).toBe(false);
  });

  it('legacy system:logs:manage implies tenant.systemLogs.manage and .view', () => {
    expect(hasEffectiveCapability(['system:logs:manage'], 'tenant.systemLogs.manage')).toBe(true);
    expect(hasEffectiveCapability(['system:logs:manage'], 'tenant.systemLogs.view')).toBe(true);
  });

  it('legacy system:pii:read implies tenant.systemPii.view and tenant.systemLogs.view (CapabilityMap includes)', () => {
    expect(hasEffectiveCapability(['system:pii:read'], 'tenant.systemPii.view')).toBe(true);
    expect(hasEffectiveCapability(['system:pii:read'], 'tenant.systemLogs.view')).toBe(true);
    expect(hasEffectiveCapability(['tenant.systemPii.view'], 'system:pii:read')).toBe(false);
  });

  it('legacy system:pii:manage implies pii+logs manage and view', () => {
    expect(hasEffectiveCapability(['system:pii:manage'], 'tenant.systemPii.manage')).toBe(true);
    expect(hasEffectiveCapability(['system:pii:manage'], 'tenant.systemPii.view')).toBe(true);
    expect(hasEffectiveCapability(['system:pii:manage'], 'tenant.systemLogs.manage')).toBe(true);
    expect(hasEffectiveCapability(['system:pii:manage'], 'tenant.systemLogs.view')).toBe(true);
  });

  it('canonical tenant.systemLogs.view alone satisfies hasEffectiveCapability', () => {
    expect(hasEffectiveCapability(['tenant.systemLogs.view'], 'tenant.systemLogs.view')).toBe(true);
  });

  it('canonical tenant.systemPii.view alone satisfies hasEffectiveCapability', () => {
    expect(hasEffectiveCapability(['tenant.systemPii.view'], 'tenant.systemPii.view')).toBe(true);
  });
});
