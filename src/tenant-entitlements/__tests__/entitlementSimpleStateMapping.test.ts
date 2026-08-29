import {
  axesToSimpleState,
  resolveSimpleStateForBlock,
  simpleStatesFromPolicyAxes,
} from '../entitlementSimpleStateMapping.js';
import { isTenantAllowedPurposes, isTenantSurfaceScope } from '../tenantScopeTypes.js';
import type { EntitlementBlockAxes } from '../types.js';

const onAxes: EntitlementBlockAxes = {
  runtimeMode: 'ENABLED',
  visibilityMode: 'VISIBLE',
  mutationMode: 'ALLOW_WRITES',
};

const softOffVisibleAxes: EntitlementBlockAxes = {
  runtimeMode: 'ENABLED',
  visibilityMode: 'VISIBLE',
  mutationMode: 'READ_ONLY',
};

const softOffHiddenAxes: EntitlementBlockAxes = {
  runtimeMode: 'ENABLED',
  visibilityMode: 'HIDDEN',
  mutationMode: 'READ_ONLY',
};

const hardOffAxes: EntitlementBlockAxes = {
  runtimeMode: 'DISABLED',
  visibilityMode: 'HIDDEN',
  mutationMode: 'BLOCK_ALL',
};

const offAxes: EntitlementBlockAxes = {
  runtimeMode: 'DISABLED',
  visibilityMode: 'VISIBLE',
  mutationMode: 'BLOCK_ALL',
};

const alwaysOnAxes: EntitlementBlockAxes = {
  runtimeMode: 'ALWAYS_ON',
  visibilityMode: 'VISIBLE',
  mutationMode: 'READ_ONLY',
};

describe('axesToSimpleState', () => {
  it('maps known axis triples to simple states', () => {
    expect(axesToSimpleState(onAxes)).toBe('on');
    expect(axesToSimpleState(softOffVisibleAxes)).toBe('softOffVisible');
    expect(axesToSimpleState(softOffHiddenAxes)).toBe('softOffHidden');
    expect(axesToSimpleState(hardOffAxes)).toBe('hardOff');
    expect(axesToSimpleState(offAxes)).toBe('off');
  });

  it('maps ALWAYS_ON (legacy immutable / pre-CONDITIONAL rows) to on', () => {
    expect(axesToSimpleState(alwaysOnAxes)).toBe('on');
  });
});

describe('simpleStatesFromPolicyAxes', () => {
  it('skips CORE_IMMUTABLE / immutableDefaults and maps conditional rows', () => {
    const states = simpleStatesFromPolicyAxes([
      {
        blockKey: 'platform_core',
        ...onAxes,
      },
      {
        blockKey: 'catalog_administration',
        ...softOffVisibleAxes,
      },
      {
        blockKey: 'loyalty_program',
        ...hardOffAxes,
      },
      {
        blockKey: 'unknown_block',
        ...onAxes,
      },
    ]);

    expect(states.platform_core).toBeUndefined();
    expect(states.catalog_administration).toBe('softOffVisible');
    expect(states.loyalty_program).toBe('hardOff');
  });

  it('maps legacy ALWAYS_ON audit_logs_admin_ui row to on (CONDITIONAL migration)', () => {
    const states = simpleStatesFromPolicyAxes([
      {
        blockKey: 'audit_logs_admin_ui',
        ...alwaysOnAxes,
      },
    ]);
    expect(states.audit_logs_admin_ui).toBe('on');
  });

  it('omits catalog blocks with no matching policy row', () => {
    const states = simpleStatesFromPolicyAxes([
      {
        blockKey: 'promotions_program',
        ...softOffHiddenAxes,
      },
    ]);
    expect(states.promotions_program).toBe('softOffHidden');
    expect(states.inventory_management).toBeUndefined();
  });

  it('normalizes parent-gated customer_auth_pwa off when surface_customer row is inactive (KIOSK)', () => {
    const states = simpleStatesFromPolicyAxes([
      {
        blockKey: 'surface_customer',
        runtimeMode: 'DISABLED',
        visibilityMode: 'HIDDEN',
        mutationMode: 'READ_ONLY',
      },
      {
        blockKey: 'customer_auth_pwa',
        runtimeMode: 'ENABLED',
        visibilityMode: 'VISIBLE',
        mutationMode: 'ALLOW_WRITES',
      },
    ]);
    expect(states.customer_auth_pwa).toBe('off');
  });

  it('normalizes parent-gated customer_auth_pwa on when surface_customer is active', () => {
    const states = simpleStatesFromPolicyAxes([
      {
        blockKey: 'surface_customer',
        runtimeMode: 'ENABLED',
        visibilityMode: 'VISIBLE',
        mutationMode: 'ALLOW_WRITES',
      },
      {
        blockKey: 'customer_auth_pwa',
        runtimeMode: 'DISABLED',
        visibilityMode: 'HIDDEN',
        mutationMode: 'BLOCK_ALL',
      },
    ]);
    expect(states.customer_auth_pwa).toBe('on');
  });
});

describe('resolveSimpleStateForBlock', () => {
  it('maps immutableDefaults through axesToSimpleState (ALWAYS_ON → on)', () => {
    expect(resolveSimpleStateForBlock('platform_core', {})).toBe('on');
    expect(resolveSimpleStateForBlock('dev_entitlement_policy_editor', {})).toBe('on');
  });

  it('forces CORE_REQUIRED to on', () => {
    expect(
      resolveSimpleStateForBlock('transactions', { transactions: 'hardOff' }),
    ).toBe('on');
  });

  it('parent-gated CORE_REQUIRED follows scope when surface_customer is off', () => {
    expect(
      resolveSimpleStateForBlock('customer_auth_pwa', {
        surface_customer: 'off',
        customer_auth_pwa: 'off',
      }),
    ).toBe('off');
  });

  it('parent-gated CORE_REQUIRED forces off when surface_customer is off even if stale on', () => {
    expect(
      resolveSimpleStateForBlock('customer_auth_pwa', {
        surface_customer: 'off',
        customer_auth_pwa: 'on',
      }),
    ).toBe('off');
  });

  it('parent-gated CORE_REQUIRED forces on when surface_customer is active', () => {
    expect(
      resolveSimpleStateForBlock('customer_auth_pwa', {
        surface_customer: 'on',
        customer_auth_pwa: 'off',
      }),
    ).toBe('on');
  });

  it('falls back to off when conditional state missing', () => {
    expect(resolveSimpleStateForBlock('catalog_administration', {})).toBe('off');
    expect(
      resolveSimpleStateForBlock('catalog_administration', {
        catalog_administration: 'softOffVisible',
      }),
    ).toBe('softOffVisible');
  });
});

describe('tenantScopeTypes guards', () => {
  it('accepts known allowed purposes and surface scopes', () => {
    expect(isTenantAllowedPurposes('PRODUCT_ONLY')).toBe(true);
    expect(isTenantAllowedPurposes('DONATION_ONLY')).toBe(true);
    expect(isTenantAllowedPurposes('BOTH')).toBe(true);
    expect(isTenantAllowedPurposes('OTHER')).toBe(false);
    expect(isTenantAllowedPurposes(null)).toBe(false);

    expect(isTenantSurfaceScope('KIOSK_ONLY')).toBe(true);
    expect(isTenantSurfaceScope('CUSTOMER_ONLY')).toBe(true);
    expect(isTenantSurfaceScope('BOTH')).toBe(true);
    expect(isTenantSurfaceScope('NEITHER')).toBe(false);
  });
});
