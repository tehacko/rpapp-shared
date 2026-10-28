import {
  CLIENT_ACCESS_DENY_KINDS,
  collectClientAccessDenyKinds,
  isClientAccessDenyKind,
  resolveClientAccessPresentation,
  shouldShowCommercialUpgradeCta,
  type ClientAccessPresentationState,
  type EntitlementDenialItem,
} from '../clientAccessDenyKind.js';
import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
} from '../index.js';

const NON_UPGRADE_STATES: readonly ClientAccessPresentationState[] = [
  'AVAILABLE',
  'RBAC',
  'READINESS',
  'TECHNICAL',
  'HARD_OFF',
  'TENANT_SCOPE',
  'SECURITY',
  'TRANSIENT',
  'UNKNOWN',
];

describe('clientAccessDenyKind (Package F f0-shared-deny-kind)', () => {
  it('pins catalog v14/60 — deny kinds add no block keys', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(14);
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(60);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(60);
    expect(CLIENT_ACCESS_DENY_KINDS).toEqual([
      'COMMERCIAL',
      'READINESS',
      'TECHNICAL',
      'HARD_OFF',
    ]);
  });

  it('isClientAccessDenyKind accepts wire kinds only (RBAC/SECURITY/SCOPE/UNKNOWN are presentation axes)', () => {
    expect(isClientAccessDenyKind('COMMERCIAL')).toBe(true);
    expect(isClientAccessDenyKind('READINESS')).toBe(true);
    expect(isClientAccessDenyKind('TECHNICAL')).toBe(true);
    expect(isClientAccessDenyKind('HARD_OFF')).toBe(true);
    expect(isClientAccessDenyKind('RBAC')).toBe(false);
    expect(isClientAccessDenyKind('SECURITY')).toBe(false);
    expect(isClientAccessDenyKind('TENANT_SCOPE')).toBe(false);
    expect(isClientAccessDenyKind('UNKNOWN')).toBe(false);
    expect(isClientAccessDenyKind('TRANSIENT')).toBe(false);
    expect(isClientAccessDenyKind('AVAILABLE')).toBe(false);
    expect(isClientAccessDenyKind('')).toBe(false);
    expect(isClientAccessDenyKind(null)).toBe(false);
    expect(isClientAccessDenyKind(undefined)).toBe(false);
    expect(isClientAccessDenyKind(1)).toBe(false);
  });

  it('collectClientAccessDenyKinds dedupes recognized kinds from denial items', () => {
    const denials: EntitlementDenialItem[] = [
      { blockKey: 'donation_recurring', kind: 'COMMERCIAL' },
      { blockKey: 'restock_alerts', kind: 'COMMERCIAL' },
      { blockKey: 'analytics_overview', kind: 'READINESS' },
    ];
    expect(collectClientAccessDenyKinds(denials)).toEqual(['COMMERCIAL', 'READINESS']);
    expect(collectClientAccessDenyKinds(null)).toEqual([]);
    expect(collectClientAccessDenyKinds(undefined)).toEqual([]);
    expect(collectClientAccessDenyKinds([])).toEqual([]);
  });

  it('AVAILABLE wins when available flag set (residual kinds ignored)', () => {
    expect(
      resolveClientAccessPresentation({
        available: true,
        entitlementDenyKinds: ['COMMERCIAL'],
        rbacDenied: true,
        securityDenied: true,
      }),
    ).toBe('AVAILABLE');
    expect(shouldShowCommercialUpgradeCta('AVAILABLE')).toBe(false);
  });

  it('upgrade only for sole COMMERCIAL (F-AC / Spec §3.3)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL'],
    });
    expect(state).toBe('COMMERCIAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(true);
  });

  it('duplicate COMMERCIAL kinds still count as sole commercial axis', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', 'COMMERCIAL'],
    });
    expect(state).toBe('COMMERCIAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(true);
  });

  it('sole READINESS → READINESS, no upgrade (F-AC-04)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['READINESS'],
    });
    expect(state).toBe('READINESS');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('sole TECHNICAL → TECHNICAL, no upgrade (F-AC-04)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['TECHNICAL'],
    });
    expect(state).toBe('TECHNICAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('sole HARD_OFF → HARD_OFF, no upgrade (F-AC-04)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['HARD_OFF'],
    });
    expect(state).toBe('HARD_OFF');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('mixed COMMERCIAL+READINESS → READINESS (no upgrade) F-AC-42', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', 'READINESS'],
    });
    expect(state).toBe('READINESS');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('mixed COMMERCIAL+TECHNICAL → TECHNICAL (no upgrade) F-AC-42', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', 'TECHNICAL'],
    });
    expect(state).toBe('TECHNICAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('HARD_OFF beats COMMERCIAL and READINESS/TECHNICAL', () => {
    expect(
      resolveClientAccessPresentation({
        entitlementDenyKinds: ['COMMERCIAL', 'HARD_OFF'],
      }),
    ).toBe('HARD_OFF');
    expect(
      resolveClientAccessPresentation({
        entitlementDenyKinds: ['READINESS', 'HARD_OFF', 'TECHNICAL'],
      }),
    ).toBe('HARD_OFF');
  });

  it('READINESS beats TECHNICAL when both present (non-commercial wins over commercial path)', () => {
    expect(
      resolveClientAccessPresentation({
        entitlementDenyKinds: ['TECHNICAL', 'READINESS'],
      }),
    ).toBe('READINESS');
  });

  it('RBAC axis wins over commercial kinds and never upgrades (F-AC-03/42)', () => {
    expect(
      resolveClientAccessPresentation({
        rbacDenied: true,
        entitlementDenyKinds: ['COMMERCIAL'],
      }),
    ).toBe('RBAC');
    expect(shouldShowCommercialUpgradeCta('RBAC')).toBe(false);
  });

  it('SECURITY and TENANT_SCOPE never upgrade and beat commercial kinds (F-AC-42)', () => {
    expect(
      resolveClientAccessPresentation({
        securityDenied: true,
        entitlementDenyKinds: ['COMMERCIAL'],
      }),
    ).toBe('SECURITY');
    expect(
      resolveClientAccessPresentation({
        tenantScopeDenied: true,
        entitlementDenyKinds: ['COMMERCIAL'],
      }),
    ).toBe('TENANT_SCOPE');
    expect(shouldShowCommercialUpgradeCta('SECURITY')).toBe(false);
    expect(shouldShowCommercialUpgradeCta('TENANT_SCOPE')).toBe(false);
  });

  it('auth axis order: SECURITY > TENANT_SCOPE > RBAC > TRANSIENT', () => {
    expect(
      resolveClientAccessPresentation({
        securityDenied: true,
        tenantScopeDenied: true,
        rbacDenied: true,
        transientFailure: true,
      }),
    ).toBe('SECURITY');
    expect(
      resolveClientAccessPresentation({
        tenantScopeDenied: true,
        rbacDenied: true,
        transientFailure: true,
      }),
    ).toBe('TENANT_SCOPE');
    expect(
      resolveClientAccessPresentation({
        rbacDenied: true,
        transientFailure: true,
      }),
    ).toBe('RBAC');
  });

  it('missing metadata → UNKNOWN no upgrade', () => {
    const state = resolveClientAccessPresentation({});
    expect(state).toBe('UNKNOWN');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('null/empty entitlementDenyKinds → UNKNOWN no upgrade', () => {
    expect(resolveClientAccessPresentation({ entitlementDenyKinds: null })).toBe('UNKNOWN');
    expect(resolveClientAccessPresentation({ entitlementDenyKinds: [] })).toBe('UNKNOWN');
  });

  it('unrecognized wire kind alone → UNKNOWN no upgrade', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['NOT_A_KIND'],
    });
    expect(state).toBe('UNKNOWN');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('COMMERCIAL + unrecognized wire kind → UNKNOWN (no false upgrade)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', 'LEGACY_FOO'],
    });
    expect(state).toBe('UNKNOWN');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('empty-string kinds are ignored and do not poison sole COMMERCIAL', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', '', ''],
    });
    expect(state).toBe('COMMERCIAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(true);
  });

  it('false auth flags are ignored (do not block sole COMMERCIAL)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL'],
      rbacDenied: false,
      securityDenied: false,
      tenantScopeDenied: false,
      transientFailure: false,
    });
    expect(state).toBe('COMMERCIAL');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(true);
  });

  it('triple mix COMMERCIAL+READINESS+TECHNICAL → READINESS (no upgrade)', () => {
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: ['COMMERCIAL', 'TECHNICAL', 'READINESS'],
    });
    expect(state).toBe('READINESS');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  it('SECURITY flag beats HARD_OFF wire kind (auth axis presentation)', () => {
    expect(
      resolveClientAccessPresentation({
        securityDenied: true,
        entitlementDenyKinds: ['HARD_OFF', 'COMMERCIAL'],
      }),
    ).toBe('SECURITY');
  });

  it('transient failure → TRANSIENT (no upgrade)', () => {
    expect(resolveClientAccessPresentation({ transientFailure: true })).toBe('TRANSIENT');
    expect(
      resolveClientAccessPresentation({
        transientFailure: true,
        entitlementDenyKinds: ['COMMERCIAL'],
      }),
    ).toBe('TRANSIENT');
    expect(shouldShowCommercialUpgradeCta('TRANSIENT')).toBe(false);
  });

  it('shouldShowCommercialUpgradeCta is true only for COMMERCIAL', () => {
    expect(shouldShowCommercialUpgradeCta('COMMERCIAL')).toBe(true);
    for (const state of NON_UPGRADE_STATES) {
      expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
    }
  });

  it('resolve from denial items via collectClientAccessDenyKinds (consumer path)', () => {
    const denials: EntitlementDenialItem[] = [
      { blockKey: 'donation_recurring', kind: 'COMMERCIAL' },
      { blockKey: 'analytics_overview', kind: 'READINESS' },
    ];
    const state = resolveClientAccessPresentation({
      entitlementDenyKinds: collectClientAccessDenyKinds(denials),
    });
    expect(state).toBe('READINESS');
    expect(shouldShowCommercialUpgradeCta(state)).toBe(false);
  });

  /**
   * Cross-surface deny-classification matrix (Admin + Customer + Pickup).
   * Same shared resolver — upgrade CTA only for sole COMMERCIAL on every surface.
   */
  it.each([
    {
      surface: 'Admin',
      blockKey: 'analytics_overview',
      input: { entitlementDenyKinds: ['COMMERCIAL'] as const },
      presentation: 'COMMERCIAL' as const,
      upgrade: true,
    },
    {
      surface: 'Admin',
      blockKey: 'team_management_growth',
      input: { rbacDenied: true, entitlementDenyKinds: ['COMMERCIAL'] as const },
      presentation: 'RBAC' as const,
      upgrade: false,
    },
    {
      surface: 'Customer',
      blockKey: 'donation_recurring',
      input: { entitlementDenyKinds: ['READINESS'] as const },
      presentation: 'READINESS' as const,
      upgrade: false,
    },
    {
      surface: 'Customer',
      blockKey: 'restock_alerts',
      input: { securityDenied: true },
      presentation: 'SECURITY' as const,
      upgrade: false,
    },
    {
      surface: 'Pickup',
      blockKey: 'inventory_operations',
      input: { entitlementDenyKinds: ['COMMERCIAL'] as const },
      presentation: 'COMMERCIAL' as const,
      upgrade: true,
    },
    {
      surface: 'Pickup',
      blockKey: 'inventory_operations',
      input: { entitlementDenyKinds: ['HARD_OFF'] as const },
      presentation: 'HARD_OFF' as const,
      upgrade: false,
    },
  ])(
    'deny-classification matrix: $surface $blockKey → $presentation (upgrade=$upgrade)',
    ({ input, presentation, upgrade }) => {
      const state = resolveClientAccessPresentation({ ...input });
      expect(state).toBe(presentation);
      expect(shouldShowCommercialUpgradeCta(state)).toBe(upgrade);
    },
  );
});
