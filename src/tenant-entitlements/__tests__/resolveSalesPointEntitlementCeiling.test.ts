import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_ENTITLED_PUBLIC_POSTURE,
  resolveSalesPointEntitlementCeiling,
} from '../../sales-point/salesPointPublicConfig.js';

describe('resolveSalesPointEntitlementCeiling', () => {
  it('returns defaults when entitlementCeiling is absent', () => {
    const ceiling = resolveSalesPointEntitlementCeiling({ entitlementCeiling: undefined });

    expect(ceiling).toEqual({
      revision: 0,
      surfaceKiosk: DEFAULT_ENTITLED_PUBLIC_POSTURE,
      realtimeDeviceTransport: DEFAULT_ENTITLED_PUBLIC_POSTURE,
      pickupMirrorMode: false,
    });
  });

  it('returns provided ceiling when present', () => {
    const custom = {
      revision: 3,
      surfaceKiosk: { entitled: false, allowReads: false, allowWrites: false },
      realtimeDeviceTransport: DEFAULT_ENTITLED_PUBLIC_POSTURE,
      pickupMirrorMode: true,
    };

    expect(resolveSalesPointEntitlementCeiling({ entitlementCeiling: custom })).toEqual(custom);
  });
});
