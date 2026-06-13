import { buildKioskLineKey } from '../buildKioskLineKey.js';

describe('buildKioskLineKey', () => {
  it('uses base suffix when variantId is null or undefined', () => {
    expect(buildKioskLineKey(1, null)).toBe('1:base');
    expect(buildKioskLineKey(1, undefined)).toBe('1:base');
    expect(buildKioskLineKey(1)).toBe('1:base');
  });

  it('includes variant id when set', () => {
    expect(buildKioskLineKey(1, 11)).toBe('1:11');
  });
});
