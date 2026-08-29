import {
  applyTenantScopeToSimpleStates,
  inferAllowedPurposesFromSimpleStates,
  inferSurfaceScopeFromSimpleStates,
  isTenantScopeLockedBlock,
  stripAxisControlledSimpleStates,
} from '../applyTenantScopeToSimpleStates.js';

describe('applyTenantScopeToSimpleStates', () => {
  it('maps PRODUCT_ONLY + KIOSK_ONLY to vending on, inventory on, and customer surface off', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY');
    expect(states.product_vending).toBe('on');
    expect(states.donation).toBe('off');
    expect(states.inventory_management).toBe('on');
    expect(states.surface_kiosk).toBe('on');
    expect(states.surface_customer).toBe('off');
    expect(states.customer_auth_pwa).toBe('off');
    expect(states.payment_rails_strategy).toBe('on');
    expect(states.payment_cash).toBe('on');
    expect(states.payment_reconciliation).toBe('on');
    expect(states.payments_hub_ui).toBe('on');
    expect(states.bank_inbox_claims_api).toBe('on');
  });

  it('maps DONATION_ONLY + CUSTOMER_ONLY with donation cluster side effects', () => {
    const states = applyTenantScopeToSimpleStates('DONATION_ONLY', 'CUSTOMER_ONLY');
    expect(states.product_vending).toBe('off');
    expect(states.donation).toBe('on');
    expect(states.catalog_administration).toBe('hardOff');
    expect(states.analytics_overview).toBe('off');
    expect(states.analytics_explore).toBe('off');
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
    expect(states.realtime_device_transport).toBe('on');
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

  it('defaults audit_logs_admin_ui ON in baseline (DEV Feature Policy allow/deny)', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').audit_logs_admin_ui).toBe('on');
    expect(applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'CUSTOMER_ONLY').audit_logs_admin_ui).toBe(
      'on',
    );
  });

  it('stripAxisControlledSimpleStates removes axis keys only', () => {
    const states = applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'KIOSK_ONLY', {
      analytics_overview: 'off',
      analytics_explore: 'off',
    });
    const stripped = stripAxisControlledSimpleStates(states);
    expect(stripped.product_vending).toBeUndefined();
    expect(stripped.analytics_overview).toBe('off');
    expect(stripped.analytics_explore).toBe('off');
  });

  it('preserves explicit donation off or hardOff on BOTH purpose (G3)', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'CUSTOMER_ONLY', { donation: 'off' }).donation).toBe(
      'off',
    );
    expect(
      applyTenantScopeToSimpleStates('BOTH', 'CUSTOMER_ONLY', { donation: 'hardOff' }).donation,
    ).toBe('hardOff');
  });

  it('defaults donation on for BOTH when not explicitly inactive', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'CUSTOMER_ONLY').donation).toBe('on');
  });

  it('preserves explicit analytics off or hardOff on BOTH purpose', () => {
    expect(
      applyTenantScopeToSimpleStates('BOTH', 'BOTH', { analytics_overview: 'off' }).analytics_overview,
    ).toBe('off');
    expect(
      applyTenantScopeToSimpleStates('BOTH', 'BOTH', { analytics_explore: 'hardOff' }).analytics_explore,
    ).toBe('hardOff');
  });

  it('defaults analytics on for BOTH when not explicitly inactive', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').analytics_overview).toBe('on');
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').analytics_explore).toBe('on');
  });
});

describe('isTenantScopeLockedBlock', () => {
  it('locks purpose axis blocks always — allowed purposes dropdown is source of truth', () => {
    expect(isTenantScopeLockedBlock('product_vending', 'BOTH', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('donation', 'BOTH', 'BOTH')).toBe(true);
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
    expect(isTenantScopeLockedBlock('promotions_program', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('analytics_overview', 'DONATION_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('analytics_explore', 'DONATION_ONLY', 'BOTH')).toBe(true);
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

  it('locks inventory when product commerce is allowed (PRODUCT_ONLY or BOTH)', () => {
    expect(isTenantScopeLockedBlock('inventory_management', 'BOTH', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('inventory_management', 'PRODUCT_ONLY', 'BOTH')).toBe(true);
    expect(isTenantScopeLockedBlock('inventory_management', 'DONATION_ONLY', 'BOTH')).toBe(true);
  });

  it('forces inventory on for BOTH and PRODUCT_ONLY scopes', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').inventory_management).toBe('on');
    expect(applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'BOTH').inventory_management).toBe('on');
    expect(applyTenantScopeToSimpleStates('DONATION_ONLY', 'BOTH').inventory_management).toBe('off');
  });

  it('defaults inventory_incidents to hardOff and keeps it independently toggleable when products are sold', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').inventory_incidents).toBe('hardOff');
    expect(applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'BOTH').inventory_incidents).toBe('hardOff');
    expect(applyTenantScopeToSimpleStates('DONATION_ONLY', 'BOTH').inventory_incidents).toBe('hardOff');
    expect(isTenantScopeLockedBlock('inventory_incidents', 'BOTH', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('inventory_incidents', 'PRODUCT_ONLY', 'BOTH')).toBe(false);
    expect(isTenantScopeLockedBlock('inventory_incidents', 'DONATION_ONLY', 'BOTH')).toBe(true);
  });

  it('defaults incident_centre_ui to hardOff (commercial Události; not DEFAULT_OFF_ROLLOUT)', () => {
    expect(applyTenantScopeToSimpleStates('BOTH', 'BOTH').incident_centre_ui).toBe('hardOff');
    expect(applyTenantScopeToSimpleStates('PRODUCT_ONLY', 'CUSTOMER_ONLY').incident_centre_ui).toBe(
      'hardOff',
    );
    expect(applyTenantScopeToSimpleStates('DONATION_ONLY', 'CUSTOMER_ONLY').incident_centre_ui).toBe(
      'hardOff',
    );
    expect(isTenantScopeLockedBlock('incident_centre_ui', 'BOTH', 'BOTH')).toBe(false);
  });
});
