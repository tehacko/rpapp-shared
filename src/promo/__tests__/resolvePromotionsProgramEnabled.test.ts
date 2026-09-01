import { describe, expect, it } from '@jest/globals';
import {
  resolvePromotionsProgramEnabled,
  resolvePromotionsProgramEnabledFromCommerceConfig,
} from '../resolvePromotionsProgramEnabled.js';

describe('resolvePromotionsProgramEnabled', () => {
  it('commerce config legacy shape', () => {
    expect(resolvePromotionsProgramEnabledFromCommerceConfig({ promotionsProgramEnabled: true })).toBe(
      true,
    );
    expect(
      resolvePromotionsProgramEnabledFromCommerceConfig({ promotionsProgramEnabled: false }),
    ).toBe(false);
    expect(resolvePromotionsProgramEnabledFromCommerceConfig(null)).toBe(false);
  });

  it('prefers explicit commerceCapabilities flag', () => {
    expect(
      resolvePromotionsProgramEnabled({
        commerceCapabilitiesPromotionsProgramEnabled: false,
        commerceConfigJson: { promotionsProgramEnabled: true },
      }),
    ).toBe(false);
    expect(
      resolvePromotionsProgramEnabled({
        commerceCapabilitiesPromotionsProgramEnabled: true,
        commerceConfigJson: null,
      }),
    ).toBe(true);
  });
});
