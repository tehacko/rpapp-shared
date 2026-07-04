import {
  applyTenantScopeToSimpleStates,
  inferAllowedPurposesFromSimpleStates,
  inferSurfaceScopeFromSimpleStates,
  isTenantScopeLockedBlock,
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
    expect(states.order_pickup_infrastructure).toBe('off');
    expect(states.immediate_self_pickup).toBe('off');
    expect(states.scheduled_pickup).toBe('off');
    expect(states.staff_pickup_scan).toBe('off');
    expect(states.customer_self_collect).toBe('off');
    expect(states.tax_management).toBe('off');
    expect(states.compliance_fiscal_modules).toBe('off');
    expect(states.surface_kiosk).toBe('off');
    expect(states.surface_customer).toBe('on');
    expect(states.customer_auth_pwa).toBe('on');
  });

  it('allows kiosk + donations only (previously impossible with bundled preset)', () => {
    const states = applyTenantScopeToSimpleStates('DONATION_ONLY', 'KIOSK_ONLY');
    expect(states.donation).toBe('on');
    expect(states.surface_kiosk).toBe('on');
    expect(states.surface_customer).toBe('off');
    expect(states.order_pickup_infrastructure).toBe('off');
    expect(states.staff_pickup_scan).toBe('off');
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

describe('isTenantScopeLockedBlock', () => {
  it('locks purpose axis blocks only when allowedPurposes is not BOTH', () => {
    expect(isTenantScopeLockedBlock('product_vending', 'BOTH', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('donation', 'BOTH', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('donation', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('product_vending', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('product_vending', 'PRODUCT_ONLY', 'KIOSK_ONLY')).toBe(true);
  });

  it('locks surface axis blocks always — surface scope dropdown is source of truth', () => {
    expect(isTenantScopeLockedBlock('surface_kiosk', 'BOTH', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('surface_customer', 'BOTH', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('surface_kiosk', 'BOTH', 'CUSTOMER_ONLY')).toBe(true);
    expect(isTenantScopeLockedBlock('surface_customer', 'BOTH', 'KIOSK_ONLY')).toBe(true);
  });

  it('locks donation-only cluster blocks when purposes is DONATION_ONLY', () => {
    expect(isTenantScopeLockedBlock('inventory_management', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('loyalty_program', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('analytics_summary', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('pickup_points', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('order_pickup_infrastructure', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('immediate_self_pickup', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('scheduled_pickup', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('staff_pickup_scan', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('customer_self_collect', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('catalog_administration', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('tax_management', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('compliance_fiscal_modules', 'DONATION_ONLY', 'BOTH')).toBe(true);
  });

  it('keeps product pickup blocks editable for BOTH and PRODUCT_ONLY', () => {
    expect(isTenantScopeLockedBlock('order_pickup_infrastructure', 'BOTH', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('order_pickup_infrastructure', 'PRODUCT_ONLY', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('staff_pickup_scan', 'PRODUCT_ONLY', 'KIOSK_ONLY')).toBe(false);
  });

  it('keeps inventory editable for BOTH and PRODUCT_ONLY', () => {
    expect(isTenantScopeLockedBlock('inventory_management', 'BOTH', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('inventory_management', 'PRODUCT_ONLY', 'BOTH')).toBe(false);
  });
});
