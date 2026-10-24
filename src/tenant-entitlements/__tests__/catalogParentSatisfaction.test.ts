import { describe, expect, it } from '@jest/globals';
import { getEntitlementBlockCatalogEntry } from '../catalog.js';
import {
  applyCatalogParentDenialImplications,
  areEntitlementBlockParentsSatisfied,
  areEntitlementBlockParentsSatisfiedBy,
  isEntitlementParentRuntimeActive,
} from '../catalogParentSatisfaction.js';

describe('isEntitlementParentRuntimeActive', () => {
  it('treats on and soft-off states as runtime active', () => {
    expect(isEntitlementParentRuntimeActive('payment_reconciliation', { payment_reconciliation: 'on' })).toBe(
      true,
    );
    expect(
      isEntitlementParentRuntimeActive('payment_reconciliation', { payment_reconciliation: 'softOffVisible' }),
    ).toBe(true);
    expect(
      isEntitlementParentRuntimeActive('payment_reconciliation', { payment_reconciliation: 'softOffHidden' }),
    ).toBe(true);
  });

  it('treats off, hardOff, and missing SIMPLE state as inactive', () => {
    expect(isEntitlementParentRuntimeActive('payment_reconciliation', { payment_reconciliation: 'off' })).toBe(
      false,
    );
    expect(
      isEntitlementParentRuntimeActive('payment_reconciliation', { payment_reconciliation: 'hardOff' }),
    ).toBe(false);
    expect(isEntitlementParentRuntimeActive('payment_reconciliation', {})).toBe(false);
  });

  it('always treats CORE_REQUIRED / CORE_IMMUTABLE parents as active', () => {
    expect(isEntitlementParentRuntimeActive('tenant_ops_settings', { tenant_ops_settings: 'hardOff' })).toBe(
      true,
    );
    expect(isEntitlementParentRuntimeActive('platform_core', { platform_core: 'off' })).toBe(true);
  });
});

describe('areEntitlementBlockParentsSatisfied', () => {
  it('returns true when the block has no catalog parents', () => {
    expect(areEntitlementBlockParentsSatisfied('surface_kiosk', {})).toBe(true);
  });

  it('requires all AND parents to be runtime active', () => {
    // sales_point_management is CORE_REQUIRED (always active); product_vending gates the AND
    expect(
      areEntitlementBlockParentsSatisfied('inventory_management', {
        product_vending: 'off',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_management', {
        product_vending: 'on',
      }),
    ).toBe(true);
  });

  it('satisfies OR parents when any listed parent is runtime active', () => {
    expect(
      areEntitlementBlockParentsSatisfied('order_pickup_infrastructure', {
        surface_kiosk: 'on',
        surface_customer: 'off',
      }),
    ).toBe(true);
    expect(
      areEntitlementBlockParentsSatisfied('order_pickup_infrastructure', {
        surface_kiosk: 'off',
        surface_customer: 'softOffVisible',
      }),
    ).toBe(true);
    expect(
      areEntitlementBlockParentsSatisfied('order_pickup_infrastructure', {
        surface_kiosk: 'off',
        surface_customer: 'hardOff',
      }),
    ).toBe(false);
  });

  it('treats optional-only parents as satisfied even when inactive', () => {
    // compliance_fiscal_modules lists tax_management as both parent and optionalParentKeys
    expect(
      areEntitlementBlockParentsSatisfied('compliance_fiscal_modules', {
        tax_management: 'off',
      }),
    ).toBe(true);
  });

  it('requires inventory_management for inventory_operations', () => {
    expect(
      areEntitlementBlockParentsSatisfied('inventory_operations', { inventory_management: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_operations', {
        inventory_management: 'hardOff',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_operations', { inventory_management: 'on' }),
    ).toBe(true);
  });

  it('requires inventory_operations for inventory_incidents', () => {
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', { inventory_operations: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', {
        inventory_operations: 'hardOff',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', { inventory_operations: 'on' }),
    ).toBe(true);
  });

  it('requires audit_logs_admin_ui for audit_intelligence', () => {
    expect(
      areEntitlementBlockParentsSatisfied('audit_intelligence', { audit_logs_admin_ui: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('audit_intelligence', { audit_logs_admin_ui: 'on' }),
    ).toBe(true);
  });

  it('requires team_management_core for permission_management_rbac', () => {
    expect(
      areEntitlementBlockParentsSatisfied('permission_management_rbac', {
        team_management_core: 'off',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('permission_management_rbac', {
        team_management_core: 'hardOff',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('permission_management_rbac', {
        team_management_core: 'on',
      }),
    ).toBe(true);
  });

  it('requires payment_reconciliation for payments_hub_ui / bank_inbox_claims_api', () => {
    expect(
      areEntitlementBlockParentsSatisfied('payments_hub_ui', { payment_reconciliation: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('bank_inbox_claims_api', { payment_reconciliation: 'on' }),
    ).toBe(true);
  });

  it('staff_pickup_scan: requires infra AND (pickup_points OR immediate_self_pickup)', () => {
    const entry = getEntitlementBlockCatalogEntry('staff_pickup_scan');
    expect(entry.parentOperator).toBe('OR');
    expect(entry.parentKeys).toEqual(['pickup_points', 'immediate_self_pickup']);
    expect(entry.requiredParentKeys).toEqual(['order_pickup_infrastructure']);

    expect(
      areEntitlementBlockParentsSatisfied('staff_pickup_scan', {
        order_pickup_infrastructure: 'on',
        pickup_points: 'on',
        immediate_self_pickup: 'off',
      }),
    ).toBe(true);
    expect(
      areEntitlementBlockParentsSatisfied('staff_pickup_scan', {
        order_pickup_infrastructure: 'on',
        pickup_points: 'off',
        immediate_self_pickup: 'on',
      }),
    ).toBe(true);
    expect(
      areEntitlementBlockParentsSatisfied('staff_pickup_scan', {
        order_pickup_infrastructure: 'on',
        pickup_points: 'off',
        immediate_self_pickup: 'off',
      }),
    ).toBe(false);
    // Collect-only bookstore: immediate On must not entitle staff scan without infra
    expect(
      areEntitlementBlockParentsSatisfied('staff_pickup_scan', {
        order_pickup_infrastructure: 'off',
        pickup_points: 'off',
        immediate_self_pickup: 'on',
      }),
    ).toBe(false);
  });

  it('customer_self_collect: requires immediate_self_pickup AND order_pickup_infrastructure', () => {
    expect(
      areEntitlementBlockParentsSatisfied('customer_self_collect', {
        immediate_self_pickup: 'on',
        order_pickup_infrastructure: 'off',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('customer_self_collect', {
        immediate_self_pickup: 'on',
        order_pickup_infrastructure: 'on',
      }),
    ).toBe(true);
  });

  it('Package C analytics chain: basic→analytics, overview→basic, explore→overview', () => {
    expect(
      areEntitlementBlockParentsSatisfied('analytics_basic', { analytics: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('analytics_basic', { analytics: 'on' }),
    ).toBe(true);

    expect(
      areEntitlementBlockParentsSatisfied('analytics_overview', {
        analytics: 'on',
        analytics_basic: 'off',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('analytics_overview', {
        analytics: 'on',
        analytics_basic: 'on',
      }),
    ).toBe(true);

    expect(
      areEntitlementBlockParentsSatisfied('analytics_explore', {
        analytics: 'on',
        analytics_basic: 'on',
        analytics_overview: 'off',
      }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('analytics_explore', {
        analytics: 'on',
        analytics_basic: 'on',
        analytics_overview: 'on',
      }),
    ).toBe(true);
  });
});

describe('applyCatalogParentDenialImplications', () => {
  it('cascades analytics_basic hardOff to overview and explore children', () => {
    const implied = applyCatalogParentDenialImplications({
      analytics: 'on',
      analytics_basic: 'hardOff',
      analytics_overview: 'on',
      analytics_explore: 'on',
    });
    expect(implied.analytics_overview).toBe('hardOff');
    expect(implied.analytics_explore).toBe('hardOff');
  });

  it('forces inventory_operations and inventory_incidents hardOff when inventory_management is hardOff', () => {
    const implied = applyCatalogParentDenialImplications({
      inventory_management: 'hardOff',
      inventory_operations: 'on',
      inventory_incidents: 'on',
    });

    expect(implied.inventory_operations).toBe('hardOff');
    expect(implied.inventory_incidents).toBe('hardOff');
  });

  it('cascades inventory_operations hardOff to inventory_incidents', () => {
    const implied = applyCatalogParentDenialImplications({
      inventory_management: 'on',
      inventory_operations: 'hardOff',
      inventory_incidents: 'on',
    });

    expect(implied.inventory_incidents).toBe('hardOff');
  });

  it('cascades team_management_core hardOff to permission_management_rbac', () => {
    const implied = applyCatalogParentDenialImplications({
      team_management_core: 'hardOff',
      permission_management_rbac: 'on',
    });

    expect(implied.permission_management_rbac).toBe('hardOff');
  });

  it('cascades audit_logs_admin_ui hardOff to audit_intelligence', () => {
    const implied = applyCatalogParentDenialImplications({
      audit_logs_admin_ui: 'hardOff',
      audit_intelligence: 'on',
    });

    expect(implied.audit_intelligence).toBe('hardOff');
  });

  it('Package E: cascades donation / product_vending Off|HardOff to E children', () => {
    expect(
      areEntitlementBlockParentsSatisfied('donation_recurring', { donation: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('donation_recurring', { donation: 'on' }),
    ).toBe(true);
    expect(
      areEntitlementBlockParentsSatisfied('restock_alerts', { product_vending: 'hardOff' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('restock_alerts', { product_vending: 'on' }),
    ).toBe(true);
    // CORE_REQUIRED parent always satisfies
    expect(
      areEntitlementBlockParentsSatisfied('tenant_ops_automation', {
        tenant_ops_settings: 'hardOff',
      }),
    ).toBe(true);

    const donationCascade = applyCatalogParentDenialImplications({
      donation: 'hardOff',
      donation_recurring: 'on',
    });
    expect(donationCascade.donation).toBe('hardOff');
    expect(donationCascade.donation_recurring).toBe('hardOff');

    const restockCascade = applyCatalogParentDenialImplications({
      product_vending: 'off',
      restock_alerts: 'on',
    });
    expect(restockCascade.product_vending).toBe('off');
    expect(restockCascade.restock_alerts).toBe('off');

    // NO reverse parent promotion: child On alone must not lift parent Off/HardOff.
    const noReverseDonation = applyCatalogParentDenialImplications({
      donation: 'off',
      donation_recurring: 'on',
    });
    expect(noReverseDonation.donation).toBe('off');
    expect(noReverseDonation.donation_recurring).toBe('off');

    const noReverseRestock = applyCatalogParentDenialImplications({
      product_vending: 'hardOff',
      restock_alerts: 'on',
    });
    expect(noReverseRestock.product_vending).toBe('hardOff');
    expect(noReverseRestock.restock_alerts).toBe('hardOff');
  });

  it('forces payments_hub_ui and bank_inbox_claims_api hardOff when payment_reconciliation is hardOff', () => {
    const implied = applyCatalogParentDenialImplications({
      payment_reconciliation: 'hardOff',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'on',
    });

    expect(implied.payments_hub_ui).toBe('hardOff');
    expect(implied.bank_inbox_claims_api).toBe('hardOff');
  });

  it('forces payments children off (not hardOff) when payment_reconciliation is off', () => {
    const implied = applyCatalogParentDenialImplications({
      payment_reconciliation: 'off',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'softOffVisible',
    });

    expect(implied.payments_hub_ui).toBe('off');
    expect(implied.bank_inbox_claims_api).toBe('off');
  });

  it('leaves payments children on when payment_reconciliation is on', () => {
    const implied = applyCatalogParentDenialImplications({
      payment_reconciliation: 'on',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'on',
    });

    expect(implied.payments_hub_ui).toBe('on');
    expect(implied.bank_inbox_claims_api).toBe('on');
  });

  it('leaves payments children on when payment_reconciliation is soft-off but runtime active', () => {
    const implied = applyCatalogParentDenialImplications({
      payment_reconciliation: 'softOffVisible',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'on',
    });

    expect(implied.payments_hub_ui).toBe('on');
    expect(implied.bank_inbox_claims_api).toBe('on');
  });

  it('does not mutate already inactive children', () => {
    const implied = applyCatalogParentDenialImplications({
      payment_reconciliation: 'hardOff',
      payments_hub_ui: 'off',
      bank_inbox_claims_api: 'hardOff',
    });

    expect(implied.payments_hub_ui).toBe('off');
    expect(implied.bank_inbox_claims_api).toBe('hardOff');
  });

  it('cascades shallow parents before deeper children in one pass', () => {
    const implied = applyCatalogParentDenialImplications({
      surface_kiosk: 'off',
      surface_customer: 'off',
      order_pickup_infrastructure: 'on',
      pickup_points: 'on',
      staff_pickup_scan: 'on',
    });

    expect(implied.order_pickup_infrastructure).toBe('off');
    expect(implied.pickup_points).toBe('off');
    expect(implied.staff_pickup_scan).toBe('off');
  });
});

describe('areEntitlementBlockParentsSatisfiedBy', () => {
  it('uses the caller callback for OR parents (staff_pickup_scan) and requiredParentKeys', () => {
    // immediate alone is insufficient — requiredParentKeys requires order_pickup_infrastructure
    expect(
      areEntitlementBlockParentsSatisfiedBy('staff_pickup_scan', (key) => key === 'immediate_self_pickup'),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfiedBy(
        'staff_pickup_scan',
        (key) => key === 'order_pickup_infrastructure' || key === 'immediate_self_pickup',
      ),
    ).toBe(true);
    expect(areEntitlementBlockParentsSatisfiedBy('staff_pickup_scan', () => false)).toBe(false);
  });
});
