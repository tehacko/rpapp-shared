import { applyTenantScopeToSimpleStates } from '../applyTenantScopeToSimpleStates.js';
import {
  CATALOG_DEFAULT_DISABLED_CORE_REQUIRED_CHILD_AXES,
  isParentGatedCoreRequiredBlock,
  resolveCoreRequiredPolicyAxesForBlock,
} from '../coreRequiredPolicyAxes.js';

describe('coreRequiredPolicyAxes', () => {
  it('identifies customer_auth_pwa as parent-gated CORE_REQUIRED', () => {
    expect(isParentGatedCoreRequiredBlock('customer_auth_pwa')).toBe(true);
    expect(isParentGatedCoreRequiredBlock('transactions')).toBe(false);
    expect(isParentGatedCoreRequiredBlock('tenant_ops_settings')).toBe(false);
  });

  it('forces ENABLED when surface_customer is on (CUSTOMER_ONLY)', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'CUSTOMER_ONLY');
    const axes = resolveCoreRequiredPolicyAxesForBlock('customer_auth_pwa', states);
    expect(axes).toEqual({
      runtimeMode: 'ENABLED',
      visibilityMode: 'VISIBLE',
      mutationMode: 'ALLOW_WRITES',
    });
  });

  it('persists DISABLED when surface_customer is off (KIOSK_ONLY)', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY');
    const axes = resolveCoreRequiredPolicyAxesForBlock('customer_auth_pwa', states);
    expect(axes).toEqual(CATALOG_DEFAULT_DISABLED_CORE_REQUIRED_CHILD_AXES);
  });

  it('always forces ENABLED for unconditional CORE_REQUIRED (transactions)', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY');
    const axes = resolveCoreRequiredPolicyAxesForBlock('transactions', states);
    expect(axes.runtimeMode).toBe('ENABLED');
    expect(axes.visibilityMode).toBe('VISIBLE');
    expect(axes.mutationMode).toBe('ALLOW_WRITES');
  });
});
