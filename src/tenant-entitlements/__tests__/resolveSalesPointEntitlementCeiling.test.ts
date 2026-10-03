import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_ENTITLED_PUBLIC_POSTURE,
  resolveSalesPointEntitlementCeiling,
} from '../../sales-point/salesPointPublicConfig.js';

describe('resolveSalesPointEntitlementCeiling', () => {
  it('returns null when entitlementCeiling is omitted (fail-closed, not entitled true)', () => {
    expect(resolveSalesPointEntitlementCeiling({ entitlementCeiling: undefined })).toBeNull();
  });

  it('returns null when entitlementCeiling is null', () => {
    expect(
      resolveSalesPointEntitlementCeiling({
        entitlementCeiling: null as never,
      }),
    ).toBeNull();
  });

  it('returns provided ceiling when present (HARD OFF included)', () => {
    const custom = {
      revision: 3,
      surfaceKiosk: { entitled: false, allowReads: false, allowWrites: false },
      realtimeDeviceTransport: DEFAULT_ENTITLED_PUBLIC_POSTURE,
      pickupMirrorMode: true,
    };

    expect(resolveSalesPointEntitlementCeiling({ entitlementCeiling: custom })).toEqual(custom);
  });
});
