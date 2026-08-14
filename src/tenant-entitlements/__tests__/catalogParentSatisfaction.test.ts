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

  it('requires inventory_management for inventory_incidents', () => {
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', { inventory_management: 'off' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', { inventory_management: 'hardOff' }),
    ).toBe(false);
    expect(
      areEntitlementBlockParentsSatisfied('inventory_incidents', { inventory_management: 'on' }),
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
});

describe('applyCatalogParentDenialImplications', () => {
  it('forces inventory_incidents hardOff when inventory_management is hardOff', () => {
    const implied = applyCatalogParentDenialImplications({
      inventory_management: 'hardOff',
      inventory_incidents: 'on',
    });

    expect(implied.inventory_incidents).toBe('hardOff');
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
