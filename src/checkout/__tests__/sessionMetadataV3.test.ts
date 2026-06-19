import { describe, expect, it } from 'vitest';
import { isSessionMetadataV3 } from 'pi-kiosk-shared';

describe('sessionMetadataV3', () => {
  it('recognizes version 3 envelope', () => {
    expect(
      isSessionMetadataV3({
        version: 3,
        shop: { kioskId: 1, lines: [{ productId: 1, quantity: 1 }] },
      })
    ).toBe(true);
  });

  it('rejects version 2', () => {
    expect(isSessionMetadataV3({ version: 2 })).toBe(false);
  });
});
