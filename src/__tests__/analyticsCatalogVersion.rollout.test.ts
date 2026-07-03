import { describe, it, expect } from '@jest/globals';
import {
  resolveAnalyticsCatalogVersion,
  resolveClientAnalyticsCatalogVersion,
} from '../analyticsCatalogVersion.js';

describe('resolveClientAnalyticsCatalogVersion', () => {
  it('forces catalog v1 when tenant rollout flag is disabled', () => {
    expect(
      resolveClientAnalyticsCatalogVersion('menu_opened', { catalogV2Enabled: false }),
    ).toBe(1);
    expect(resolveClientAnalyticsCatalogVersion('payment_confirmed', { catalogV2Enabled: false })).toBe(
      1,
    );
  });

  it('delegates to resolveAnalyticsCatalogVersion when rollout flag is enabled', () => {
    expect(
      resolveClientAnalyticsCatalogVersion('menu_opened', { catalogV2Enabled: true }),
    ).toBe(resolveAnalyticsCatalogVersion('menu_opened'));
    expect(
      resolveClientAnalyticsCatalogVersion('payment_confirmed', { catalogV2Enabled: true }),
    ).toBe(1);
  });
});
