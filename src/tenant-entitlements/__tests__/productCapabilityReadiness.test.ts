import { ENTITLEMENT_BLOCK_KEYS, SIMPLE_ENTITLEMENT_STATES } from '../types.js';
import {
  NEVER_ACTIVATE_PRODUCT_CAPABILITY_IDS,
  PRODUCT_CAPABILITY_BLOCK_MAP,
  PRODUCT_CAPABILITY_IDS,
  entitlementBlockKeysForProductCapability,
  isNeverActivateProductCapability,
  productCapabilityIdForEntitlementBlock,
} from '../productCapabilityMap.js';
import {
  PRODUCT_CAPABILITY_PRODUCTION_GRID,
  PRODUCT_CAPABILITY_SURFACES,
  PRODUCT_CAPABILITY_TEST_MODE_GRID,
  collapseProductCapabilityGridCell,
  declaredProductCapabilityReadiness,
  evaluateProductCapabilityReadiness,
  getDeclaredProductCapabilityGridCell,
  isPartnerApiNeverActivate,
  isProductCapabilityActivable,
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
    ).toBe('NOT_READY');
  });

  it('promotes CAP-08 TEST cells to READY only in test-mode', () => {
    expect(
      declaredProductCapabilityReadiness('CAP-08', 'kiosk_kiosk_device'),
    ).toBe('NOT_READY');
    expect(
      declaredProductCapabilityReadiness('CAP-08', 'kiosk_kiosk_device', {
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
      'inventory_incidents',
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
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(50);
  });
});
