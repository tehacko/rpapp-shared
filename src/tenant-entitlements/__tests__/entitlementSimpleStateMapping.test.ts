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

describe('axesToSimpleState', () => {
  it('maps known axis triples to simple states', () => {
    expect(axesToSimpleState(onAxes)).toBe('on');
    expect(axesToSimpleState(softOffVisibleAxes)).toBe('softOffVisible');
    expect(axesToSimpleState(softOffHiddenAxes)).toBe('softOffHidden');
    expect(axesToSimpleState(hardOffAxes)).toBe('hardOff');
    expect(axesToSimpleState(offAxes)).toBe('off');
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
});

describe('resolveSimpleStateForBlock', () => {
  it('maps immutableDefaults through axesToSimpleState (ALWAYS_ON → off)', () => {
    // ALWAYS_ON immutable axes are not an ENABLED triple — axesToSimpleState falls through to off.
    expect(resolveSimpleStateForBlock('platform_core', {})).toBe('off');
    expect(resolveSimpleStateForBlock('dev_entitlement_policy_editor', {})).toBe('off');
  });

  it('forces CORE_REQUIRED to on', () => {
    expect(
      resolveSimpleStateForBlock('transactions', { transactions: 'hardOff' }),
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
