import { ENTITLEMENT_BLOCK_KEYS, SIMPLE_ENTITLEMENT_STATES } from '../types.js';
import {
  NEVER_ACTIVATE_PRODUCT_CAPABILITY_IDS,
  PRODUCT_CAPABILITY_BLOCK_MAP,
  PRODUCT_CAPABILITY_IDS,
  entitlementBlockKeysForProductCapability,
  isNeverActivateProductCapability,
  productCapabilityIdForEntitlementBlock,
} from '../productCapabilityMap.js';
import { getEntitlementBlockCatalogEntry } from '../catalog.js';
import {
  PRODUCT_CAPABILITY_PRODUCTION_GRID,
  PRODUCT_CAPABILITY_SURFACES,
  PRODUCT_CAPABILITY_TEST_MODE_GRID,
  clientAccessDenyKindForProductCapabilityGridCell,
  collapseProductCapabilityGridCell,
  declaredProductCapabilityReadiness,
  evaluateProductCapabilityReadiness,
  getDeclaredProductCapabilityGridCell,
  getProductCapabilityReadiness,
  isPartnerApiNeverActivate,
  isProductCapabilityActivable,
  isProductCapabilityProductionEnableAllowed,
  isEntitlementBlockProductionEnableAllowed,
  isProductCapabilityTestModeEnableAllowed,
  isEntitlementBlockTestModeEnableAllowed,
  mergeReadinessCell,
  clampSimpleStatesToProductionEnableAllowed,
  collectDeniedProductionEnablePolicyRows,
  resolveBlockProductCapabilityDenyKind,
  simpleEntitlementStateToProductReadiness,
} from '../productCapabilityReadiness.js';
import type { EntitlementBlockKey, SimpleEntitlementState } from '../types.js';
import type { ProductCapabilityId } from '../productCapabilityMap.js';
import type { ProductCapabilitySurface } from '../productCapabilityReadiness.js';

function onStatesForCapability(
  capabilityId: ProductCapabilityId,
): Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> {
  const states: Partial<Record<EntitlementBlockKey, SimpleEntitlementState>> = {};
  for (const blockKey of entitlementBlockKeysForProductCapability(capabilityId)) {
    states[blockKey] = 'on';
  }
  return states;
}

describe('productCapabilityMap', () => {
  it('maps CAP-01..CAP-14 onto live ENTITLEMENT_BLOCK_KEYS and CAP-15 to empty', () => {
    const allowed = new Set<string>(ENTITLEMENT_BLOCK_KEYS);
    expect(PRODUCT_CAPABILITY_IDS).toHaveLength(15);
    expect(entitlementBlockKeysForProductCapability('CAP-15')).toEqual([]);
    expect(isNeverActivateProductCapability('CAP-15')).toBe(true);
    expect(isPartnerApiNeverActivate('CAP-15')).toBe(true);
    expect([...NEVER_ACTIVATE_PRODUCT_CAPABILITY_IDS]).toEqual(['CAP-15']);

    for (const capabilityId of PRODUCT_CAPABILITY_IDS) {
      const blockKeys = PRODUCT_CAPABILITY_BLOCK_MAP[capabilityId];
      for (const blockKey of blockKeys) {
        expect(allowed.has(blockKey)).toBe(true);
        expect(productCapabilityIdForEntitlementBlock(blockKey)).toBe(capabilityId);
      }
    }
  });
});

describe('simpleEntitlementStateToProductReadiness', () => {
  it('maps SIMPLE on to READY and every other SIMPLE column to NOT_READY', () => {
    expect(simpleEntitlementStateToProductReadiness('on')).toBe('READY');
    expect(simpleEntitlementStateToProductReadiness('softOffVisible')).toBe('NOT_READY');
    expect(simpleEntitlementStateToProductReadiness('softOffHidden')).toBe('NOT_READY');
    expect(simpleEntitlementStateToProductReadiness('off')).toBe('NOT_READY');
    expect(simpleEntitlementStateToProductReadiness('hardOff')).toBe('NOT_READY');
    expect(SIMPLE_ENTITLEMENT_STATES).toEqual([
      'on',
      'softOffVisible',
      'softOffHidden',
      'off',
      'hardOff',
    ]);
  });
});

describe('Package F readiness/TECHNICAL wire kinds (G5)', () => {
  it('maps PARTIAL/TEST → READINESS and NOT_READY/n_a → TECHNICAL', () => {
    expect(clientAccessDenyKindForProductCapabilityGridCell('PARTIAL')).toBe('READINESS');
    expect(clientAccessDenyKindForProductCapabilityGridCell('TEST')).toBe('READINESS');
    expect(clientAccessDenyKindForProductCapabilityGridCell('NOT_READY')).toBe('TECHNICAL');
    expect(clientAccessDenyKindForProductCapabilityGridCell('n_a')).toBe('TECHNICAL');
    expect(clientAccessDenyKindForProductCapabilityGridCell('READY')).toBe('TECHNICAL');
  });

  it('resolveBlockProductCapabilityDenyKind: PARTIAL donation → READINESS; NOT_READY analytics customer → TECHNICAL; READY → omit', () => {
    expect(
      resolveBlockProductCapabilityDenyKind({
        blockKey: 'donation',
        surface: 'customer',
        mode: 'production',
      }),
    ).toBe('READINESS');
    expect(
      resolveBlockProductCapabilityDenyKind({
        blockKey: 'analytics_overview',
        surface: 'customer',
        mode: 'production',
      }),
    ).toBe('TECHNICAL');
    expect(
      resolveBlockProductCapabilityDenyKind({
        blockKey: 'payment_cash',
        surface: 'customer',
        mode: 'production',
      }),
    ).toBeUndefined();
    expect(
      resolveBlockProductCapabilityDenyKind({
        blockKey: 'restock_alerts',
        surface: 'customer',
        mode: 'production',
      }),
    ).toBeUndefined();
  });
});

describe('G8 CAP grid collapse', () => {
  it('treats production READY cells as READY and PARTIAL/TEST/n_a/NOT_READY as NOT_READY', () => {
    expect(collapseProductCapabilityGridCell('READY')).toBe('READY');
    expect(collapseProductCapabilityGridCell('PARTIAL')).toBe('NOT_READY');
    expect(collapseProductCapabilityGridCell('TEST')).toBe('NOT_READY');
    expect(collapseProductCapabilityGridCell('n_a')).toBe('NOT_READY');
    expect(collapseProductCapabilityGridCell('NOT_READY')).toBe('NOT_READY');
  });

  it('treats TEST as READY only when explicitDevEnable is true', () => {
    expect(collapseProductCapabilityGridCell('TEST', { explicitDevEnable: true })).toBe('READY');
    expect(collapseProductCapabilityGridCell('PARTIAL', { explicitDevEnable: true })).toBe(
      'NOT_READY',
    );
  });

  it('covers production 15×4 declared cells including CAP-15 NOT_READY all columns', () => {
    for (const capabilityId of PRODUCT_CAPABILITY_IDS) {
      for (const surface of PRODUCT_CAPABILITY_SURFACES) {
        const cell = getDeclaredProductCapabilityGridCell(capabilityId, surface);
        expect(cell).toBe(PRODUCT_CAPABILITY_PRODUCTION_GRID[capabilityId][surface]);
        const readiness = declaredProductCapabilityReadiness(capabilityId, surface);
        if (capabilityId === 'CAP-15') {
          expect(cell).toBe('NOT_READY');
          expect(readiness).toBe('NOT_READY');
          continue;
        }
        expect(readiness).toBe(collapseProductCapabilityGridCell(cell));
      }
    }
  });

  it('covers test-mode 15×4 including CAP-15 NOT_READY all columns', () => {
    for (const capabilityId of PRODUCT_CAPABILITY_IDS) {
      for (const surface of PRODUCT_CAPABILITY_SURFACES) {
        const cell = getDeclaredProductCapabilityGridCell(capabilityId, surface, {
          explicitDevEnable: true,
        });
        expect(cell).toBe(PRODUCT_CAPABILITY_TEST_MODE_GRID[capabilityId][surface]);
        const readiness = declaredProductCapabilityReadiness(capabilityId, surface, {
          explicitDevEnable: true,
        });
        if (capabilityId === 'CAP-15') {
          expect(cell).toBe('NOT_READY');
          expect(readiness).toBe('NOT_READY');
          continue;
        }
        expect(readiness).toBe(
          collapseProductCapabilityGridCell(cell, { explicitDevEnable: true }),
        );
      }
    }
  });

  it('keeps CAP-15 Partner API NOT_READY even when SIMPLE is on and test-mode is on', () => {
    const surfaces: readonly ProductCapabilitySurface[] = PRODUCT_CAPABILITY_SURFACES;
    for (const surface of surfaces) {
      expect(
        evaluateProductCapabilityReadiness({
          capabilityId: 'CAP-15',
          surface,
          explicitDevEnable: true,
          simpleStates: { product_vending: 'on' },
        }),
      ).toBe('NOT_READY');
    }
  });

  it('ANDs declared READY with SIMPLE on for mapped blocks', () => {
    expect(
      evaluateProductCapabilityReadiness({
        capabilityId: 'CAP-13',
        surface: 'admin_staff_ops',
        simpleStates: onStatesForCapability('CAP-13'),
      }),
    ).toBe('READY');
    expect(
      evaluateProductCapabilityReadiness({
        capabilityId: 'CAP-13',
        surface: 'admin_staff_ops',
        simpleStates: { payment_cash: 'softOffVisible' },
      }),
    ).toBe('NOT_READY');
    expect(
      evaluateProductCapabilityReadiness({
        capabilityId: 'CAP-01',
        surface: 'admin_staff_ops',
        simpleStates: onStatesForCapability('CAP-01'),
      }),
    ).toBe('READY');
    expect(
      evaluateProductCapabilityReadiness({
        capabilityId: 'CAP-02',
        surface: 'admin_staff_ops',
        simpleStates: onStatesForCapability('CAP-02'),
      }),
    ).toBe('NOT_READY');
  });

  it('promotes CAP-10 TEST cells to READY only in test-mode', () => {
    expect(
      declaredProductCapabilityReadiness('CAP-10', 'customer_mobile_shop'),
    ).toBe('NOT_READY');
    expect(
      declaredProductCapabilityReadiness('CAP-10', 'customer_mobile_shop', {
        explicitDevEnable: true,
      }),
    ).toBe('READY');
  });

  it('maps G8 Kind blocks (CAP-03 customer surface, CAP-05 sales points, CAP-15 empty)', () => {
    expect(entitlementBlockKeysForProductCapability('CAP-03')).toEqual([
      'surface_customer',
      'customer_auth_pwa',
    ]);
    expect(entitlementBlockKeysForProductCapability('CAP-04')).toEqual([
      'surface_kiosk',
      'realtime_device_transport',
    ]);
    expect(entitlementBlockKeysForProductCapability('CAP-05')).toEqual([
      'sales_point_management',
      'sales_point_individual_settings',
    ]);
    expect(entitlementBlockKeysForProductCapability('CAP-01')).toEqual([
      'catalog_administration',
      'product_barcode_administration',
      'product_vending',
      'inventory_management',
      'inventory_operations',
      'inventory_incidents',
    ]);
    expect(entitlementBlockKeysForProductCapability('CAP-12')).toEqual([
      'team_management_core',
      'permission_management_rbac',
      'admin_mfa',
      'admin_notifications',
    ]);
    expect(isProductCapabilityActivable({ capabilityId: 'CAP-15', surface: 'admin' })).toBe(false);
    expect(
      isProductCapabilityActivable({
        capabilityId: 'CAP-15',
        surface: 'kiosk',
        explicitDevEnable: true,
        mode: 'test',
      }),
    ).toBe(false);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(60);
  });

  it.each([
    {
      name: 'production PARTIAL deny',
      capabilityId: 'CAP-02' as const,
      surface: 'admin' as const,
      mode: 'production' as const,
      expected: false,
    },
    {
      name: 'production CAP-01 admin READY allow',
      capabilityId: 'CAP-01' as const,
      surface: 'admin' as const,
      mode: 'production' as const,
      expected: true,
    },
    {
      name: 'production TEST deny',
      capabilityId: 'CAP-10' as const,
      surface: 'admin' as const,
      mode: 'production' as const,
      expected: false,
    },
    {
      name: 'production NOT_READY deny',
      capabilityId: 'CAP-07' as const,
      surface: 'kiosk' as const,
      mode: 'production' as const,
      expected: false,
    },
    {
      name: 'production READY allow',
      capabilityId: 'CAP-13' as const,
      surface: 'kiosk' as const,
      mode: 'production' as const,
      expected: true,
    },
    {
      name: 'test-mode TEST allow',
      capabilityId: 'CAP-10' as const,
      surface: 'admin' as const,
      mode: 'test' as const,
      expected: true,
    },
    {
      name: 'test-mode CAP-01 admin READY allow',
      capabilityId: 'CAP-01' as const,
      surface: 'admin' as const,
      mode: 'test' as const,
      expected: true,
    },
    {
      name: 'test-mode PARTIAL still deny',
      capabilityId: 'CAP-02' as const,
      surface: 'admin' as const,
      mode: 'test' as const,
      expected: false,
    },
  ])('isProductCapabilityActivable $name', ({ capabilityId, surface, mode, expected }) => {
    expect(isProductCapabilityActivable({ capabilityId, surface, mode })).toBe(expected);
    expect(
      evaluateProductCapabilityReadiness({ capabilityId, surface, mode }) === 'READY',
    ).toBe(expected);
  });
});

const G8_PRODUCTION_PARTIAL_CELLS = PRODUCT_CAPABILITY_IDS.flatMap((capabilityId) =>
  PRODUCT_CAPABILITY_SURFACES.filter(
    (surface) => PRODUCT_CAPABILITY_PRODUCTION_GRID[capabilityId][surface] === 'PARTIAL',
  ).map((surface) => ({ capabilityId, surface })),
);

describe('G8 PARTIAL production persist ENABLE deny', () => {
  it.each(G8_PRODUCTION_PARTIAL_CELLS)(
    'isProductCapabilityActivable false for $capabilityId $surface PARTIAL',
    ({ capabilityId, surface }) => {
      expect(PRODUCT_CAPABILITY_PRODUCTION_GRID[capabilityId][surface]).toBe('PARTIAL');
      expect(
        isProductCapabilityActivable({
          capabilityId,
          surface,
          mode: 'production',
        }),
      ).toBe(false);
    },
  );

  it.each(G8_PRODUCTION_PARTIAL_CELLS)(
    'mapped blocks cannot persist ENABLE when $capabilityId has no production READY cell ($surface PARTIAL)',
    ({ capabilityId, surface }) => {
      expect(surface).toBeDefined();
      const hasReady = PRODUCT_CAPABILITY_SURFACES.some(
        (cellSurface) => PRODUCT_CAPABILITY_PRODUCTION_GRID[capabilityId][cellSurface] === 'READY',
      );
      expect(isProductCapabilityProductionEnableAllowed(capabilityId)).toBe(hasReady);
      for (const blockKey of entitlementBlockKeysForProductCapability(capabilityId)) {
        const persistAllowed = isEntitlementBlockProductionEnableAllowed(blockKey);
        if (hasReady) {
          expect(persistAllowed).toBe(true);
          continue;
        }
        const blockClass = getEntitlementBlockCatalogEntry(blockKey).blockClass;
        if (blockClass === 'CORE_REQUIRED' || blockClass === 'CORE_IMMUTABLE') {
          expect(persistAllowed).toBe(true);
          continue;
        }
        expect(persistAllowed).toBe(false);
        expect(
          clampSimpleStatesToProductionEnableAllowed({ [blockKey]: 'on' })[blockKey],
        ).toBe('off');
        expect(
          collectDeniedProductionEnablePolicyRows([
            { blockKey, runtimeMode: 'ENABLED' },
          ]),
        ).toEqual([
          expect.objectContaining({
            blockKey,
            runtimeMode: 'ENABLED',
            capabilityId,
          }),
        ]);
      }
    },
  );

  it('CAP-15 and TEST/NOT_READY-only capabilities never persist ENABLE', () => {
    expect(isProductCapabilityProductionEnableAllowed('CAP-15')).toBe(false);
    expect(isProductCapabilityProductionEnableAllowed('CAP-10')).toBe(false);
    expect(isEntitlementBlockProductionEnableAllowed('tenant_brand_kit')).toBe(false);
    expect(
      collectDeniedProductionEnablePolicyRows([
        { blockKey: 'tenant_brand_kit', runtimeMode: 'ALWAYS_ON' },
      ]),
    ).toHaveLength(1);
  });

  it('READY-cell capabilities still allow persist ENABLE (CAP-01 mixed PARTIAL/READY)', () => {
    expect(isProductCapabilityProductionEnableAllowed('CAP-01')).toBe(true);
    expect(isEntitlementBlockProductionEnableAllowed('catalog_administration')).toBe(true);
    expect(
      collectDeniedProductionEnablePolicyRows([
        { blockKey: 'catalog_administration', runtimeMode: 'ENABLED' },
      ]),
    ).toEqual([]);
  });
});

describe('test-mode enable helpers (Wave 0 pretest Max-On)', () => {
  it('allows CAP-10 TEST→READY under test-grid OR synonym but not production', () => {
    expect(isProductCapabilityProductionEnableAllowed('CAP-10')).toBe(false);
    expect(isProductCapabilityTestModeEnableAllowed('CAP-10')).toBe(true);
    expect(isEntitlementBlockProductionEnableAllowed('tenant_brand_kit')).toBe(false);
    expect(isEntitlementBlockTestModeEnableAllowed('tenant_brand_kit')).toBe(true);
  });

  it('rejects CAP-15 and PARTIAL-only capabilities in both modes', () => {
    expect(isProductCapabilityTestModeEnableAllowed('CAP-15')).toBe(false);
    expect(isProductCapabilityTestModeEnableAllowed('CAP-02')).toBe(false);
    expect(isEntitlementBlockTestModeEnableAllowed('donation')).toBe(false);
  });

  it('keeps READY production capabilities enable-allowed in test mode', () => {
    expect(isProductCapabilityTestModeEnableAllowed('CAP-01')).toBe(true);
    expect(isEntitlementBlockTestModeEnableAllowed('catalog_administration')).toBe(true);
  });
});

describe('mergeReadinessCell (platform override + CAP-15/n_a reject)', () => {
  it('applies override onto a mutable declared cell', () => {
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-01',
        declared: 'PARTIAL',
        override: 'READY',
      }),
    ).toEqual({ ok: true, cell: 'READY' });
  });

  it('threads override into getProductCapabilityReadiness / isProductCapabilityActivable', () => {
    // CAP-02 admin is code PARTIAL → not activable without override.
    expect(
      isProductCapabilityActivable({
        capabilityId: 'CAP-02',
        surface: 'admin',
        mode: 'production',
      }),
    ).toBe(false);
    expect(
      getProductCapabilityReadiness({
        capabilityId: 'CAP-02',
        surface: 'admin',
        mode: 'production',
        override: 'READY',
      }),
    ).toBe('READY');
    expect(
      isProductCapabilityActivable({
        capabilityId: 'CAP-02',
        surface: 'admin',
        mode: 'production',
        override: 'READY',
      }),
    ).toBe(true);
    expect(
      isProductCapabilityProductionEnableAllowed('CAP-02', {
        resolveOverride: (surface) => (surface === 'admin' ? 'READY' : null),
      }),
    ).toBe(true);
  });

  it('returns declared when override is null/undefined', () => {
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-01',
        declared: 'READY',
        override: null,
      }),
    ).toEqual({ ok: true, cell: 'READY' });
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-01',
        declared: 'TEST',
      }),
    ).toEqual({ ok: true, cell: 'TEST' });
  });

  it('rejects CAP-15 overrides away from NOT_READY', () => {
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-15',
        declared: 'NOT_READY',
        override: 'READY',
      }),
    ).toEqual({ ok: false, reason: 'CAP_15_NEVER_ACTIVATE', cell: 'NOT_READY' });
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-15',
        declared: 'NOT_READY',
        override: 'NOT_READY',
      }),
    ).toEqual({ ok: true, cell: 'NOT_READY' });
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-15',
        declared: 'READY',
      }),
    ).toEqual({ ok: true, cell: 'NOT_READY' });
  });

  it('rejects overrides of declared n_a cells', () => {
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-02',
        declared: 'n_a',
        override: 'READY',
      }),
    ).toEqual({ ok: false, reason: 'N_A_IMMUTABLE', cell: 'n_a' });
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-02',
        declared: 'n_a',
        override: 'n_a',
      }),
    ).toEqual({ ok: true, cell: 'n_a' });
    expect(
      mergeReadinessCell({
        capabilityId: 'CAP-02',
        declared: 'n_a',
      }),
    ).toEqual({ ok: true, cell: 'n_a' });
  });
});
