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
});