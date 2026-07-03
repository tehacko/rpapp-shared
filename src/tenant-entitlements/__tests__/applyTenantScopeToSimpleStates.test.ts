import {
  applyTenantScopeToSimpleStates,
  inferAllowedPurposesFromSimpleStates,
  inferSurfaceScopeFromSimpleStates,
  stripAxisControlledSimpleStates,
} from '../applyTenantScopeToSimpleStates.js';

describe('applyTenantScopeToSimpleStates', () => {
  it('maps PRODUCT_ONLY + KIOSK_ONLY to vending on and customer surface off', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY');
    expect(states.product_vending).toBe('on');
    expect(states.donation).toBe('off');
    expect(states.surface_kiosk).toBe('on');
    expect(states.surface_customer).toBe('off');
    expect(states.customer_auth_pwa).toBe('off');
  });

  it('maps DONATION_ONLY + CUSTOMER_ONLY with donation cluster side effects', () => {
    const states = applyTenantScopeToSimpleStates('DONATION_ONLY', 'CUSTOMER_ONLY');
    expect(states.product_vending).toBe('off');
    expect(states.donation).toBe('on');
    expect(states.catalog_administration).toBe('hardOff');
    expect(states.analytics_summary).toBe('off');
    expect(states.pickup_points).toBe('off');
    expect(states.surface_kiosk).toBe('off');
    expect(states.surface_customer).toBe('on');
    expect(states.customer_auth_pwa).toBe('on');
  });

  it('allows kiosk + donations only (previously impossible with bundled preset)', () => {
    const states = applyTenantScopeToSimpleStates('DONATION_ONLY', 'KIOSK_ONLY');
    expect(states.donation).toBe('on');
    expect(states.surface_kiosk).toBe('on');
    expect(states.surface_customer).toBe('off');
  });

  it('infers scopes from axis block states', () => {
    const states = applyTenantScopeToSimpleStates('BOTH', 'BOTH');
    expect(inferAllowedPurposesFromSimpleStates(states)).toBe('BOTH');
    expect(inferSurfaceScopeFromSimpleStates(states)).toBe('BOTH');
  });

  it('stripAxisControlledSimpleStates removes axis keys only', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY', {
      analytics_summary: 'off',
    });
    const stripped = stripAxisControlledSimpleStates(states);
    expect(stripped.product_vending).toBeUndefined();
    expect(stripped.analytics_summary).toBe('off');
  });
});
