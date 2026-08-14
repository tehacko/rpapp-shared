import { describe, expect, it } from '@jest/globals';
import { applySimpleStateDependencyImplications } from '../applySimpleStateDependencyImplications.js';

describe('applySimpleStateDependencyImplications', () => {
  it('V-02 enables catalog_administration when product_vending is on', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      donation: 'off',
    });

    expect(implied.catalog_administration).toBe('on');
  });

  it('V-02 enables catalog when product_vending is soft-off but runtime active', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'softOffVisible',
    });

    expect(implied.catalog_administration).toBe('on');
  });

  it('sets catalog hardOff for donation-only commerce', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'off',
      donation: 'on',
    });

    expect(implied.catalog_administration).toBe('hardOff');
  });

  it('V-03 implies product_vending when inventory_management is on', () => {
    const implied = applySimpleStateDependencyImplications({
      inventory_management: 'on',
      product_vending: 'off',
    });

    expect(implied.product_vending).toBe('on');
    expect(implied.catalog_administration).toBe('on');
    expect(implied.sales_point_management).toBe('on');
  });

  it('LOY-V01 implies product_vending when loyalty_program is on', () => {
    const implied = applySimpleStateDependencyImplications({
      loyalty_program: 'on',
      product_vending: 'off',
      donation: 'on',
    });

    expect(implied.product_vending).toBe('on');
    expect(implied.catalog_administration).toBe('on');
  });

  it('MC-01 enables analytics umbrella when analytics_summary is on', () => {
    const implied = applySimpleStateDependencyImplications({
      analytics_summary: 'on',
    });

    expect(implied.analytics).toBe('on');
  });

  it('MC-02 enables analytics_detailed when mission_control is on', () => {
    const implied = applySimpleStateDependencyImplications({
      mission_control: 'on',
    });

    expect(implied.analytics).toBe('on');
    expect(implied.analytics_detailed).toBe('on');
  });

  it('MC-03 does not auto-enable mission_control from analytics_summary alone', () => {
    const implied = applySimpleStateDependencyImplications({
      analytics_summary: 'on',
    });

    expect(implied.analytics).toBe('on');
    expect(implied.mission_control).toBe('off');
    expect(implied.analytics_detailed).toBeUndefined();
  });

  it('keeps inventory_incidents hardOff when inventory_management is hardOff', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      inventory_management: 'hardOff',
      inventory_incidents: 'hardOff',
    });

    expect(implied.inventory_incidents).toBe('hardOff');
  });

  it('PARENT-01 leaves inventory_incidents on when inventory_management is on', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      inventory_management: 'on',
      inventory_incidents: 'on',
    });

    expect(implied.inventory_incidents).toBe('on');
    expect(implied.inventory_management).toBe('on');
  });

  it('PARENT-01 cascade-off: parent Off/HardOff forces inventory_incidents Off/HardOff (child On does not imply parent On)', () => {
    const parentOff = applySimpleStateDependencyImplications({
      inventory_management: 'off',
      inventory_incidents: 'on',
    });
    expect(parentOff.inventory_management).toBe('off');
    expect(parentOff.inventory_incidents).toBe('off');

    const parentHardOff = applySimpleStateDependencyImplications({
      inventory_management: 'hardOff',
      inventory_incidents: 'on',
    });
    expect(parentHardOff.inventory_management).toBe('hardOff');
    expect(parentHardOff.inventory_incidents).toBe('hardOff');

    const bothOn = applySimpleStateDependencyImplications({
      inventory_management: 'on',
      inventory_incidents: 'on',
    });
    expect(bothOn.inventory_management).toBe('on');
    expect(bothOn.inventory_incidents).toBe('on');
  });

  it('PARENT-01 forces payments_hub_ui off when payment_reconciliation is hardOff', () => {
    const implied = applySimpleStateDependencyImplications({
      payment_rails_strategy: 'on',
      payment_reconciliation: 'hardOff',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'on',
    });

    expect(implied.payments_hub_ui).toBe('hardOff');
    expect(implied.bank_inbox_claims_api).toBe('hardOff');
  });

  it('PARENT-01 forces children off (not hardOff) when parent is soft Off', () => {
    const implied = applySimpleStateDependencyImplications({
      payment_rails_strategy: 'on',
      payment_reconciliation: 'off',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'softOffVisible',
    });

    expect(implied.payments_hub_ui).toBe('off');
    expect(implied.bank_inbox_claims_api).toBe('off');
  });

  it('PARENT-01 leaves children on when payment_reconciliation is on', () => {
    const implied = applySimpleStateDependencyImplications({
      payment_rails_strategy: 'on',
      payment_reconciliation: 'on',
      payments_hub_ui: 'on',
      bank_inbox_claims_api: 'on',
    });

    expect(implied.payments_hub_ui).toBe('on');
    expect(implied.bank_inbox_claims_api).toBe('on');
  });

  it('forces immediate_self_pickup on when pickup infra is Off and product_vending is active', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      order_pickup_infrastructure: 'hardOff',
      immediate_self_pickup: 'hardOff',
      fulfillment_queue: 'hardOff',
      pickup_points: 'hardOff',
      staff_pickup_scan: 'hardOff',
    });

    expect(implied.order_pickup_infrastructure).toBe('hardOff');
    expect(implied.immediate_self_pickup).toBe('on');
  });

  it('forces immediate_self_pickup on when pickup infra is softOff and product_vending is active', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      surface_customer: 'on',
      order_pickup_infrastructure: 'softOffVisible',
      immediate_self_pickup: 'off',
    });

    expect(implied.order_pickup_infrastructure).toBe('softOffVisible');
    expect(implied.immediate_self_pickup).toBe('on');
  });

  it('forces immediate_self_pickup on when pickup infra is missing and product_vending is active', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      immediate_self_pickup: 'hardOff',
    });

    expect(implied.immediate_self_pickup).toBe('on');
  });

  it('G13: collect-only does not leave optional self-collect / staff scan On when infra Off', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'on',
      order_pickup_infrastructure: 'off',
      immediate_self_pickup: 'on',
      customer_self_collect: 'on',
      staff_pickup_scan: 'on',
      pickup_points: 'on',
      fulfillment_queue: 'on',
    });

    expect(implied.immediate_self_pickup).toBe('on');
    expect(implied.order_pickup_infrastructure).toBe('off');
    // Cluster sync forces staff Off with infra; parent denial forces customer_self_collect Off
    expect(implied.staff_pickup_scan).toBe('off');
    expect(implied.customer_self_collect).toBe('off');
  });

  it('does not force immediate_self_pickup on for donation-only when infra is Off', () => {
    const implied = applySimpleStateDependencyImplications({
      product_vending: 'off',
      donation: 'on',
      order_pickup_infrastructure: 'off',
      immediate_self_pickup: 'off',
    });

    expect(implied.immediate_self_pickup).toBe('off');
  });

  it('does not turn admin_mfa on when tenant_ops_settings is on (default-off rollout)', () => {
    const implied = applySimpleStateDependencyImplications({
      tenant_ops_settings: 'on',
      admin_mfa: 'off',
    });

    expect(implied.admin_mfa).toBe('off');
  });
});
