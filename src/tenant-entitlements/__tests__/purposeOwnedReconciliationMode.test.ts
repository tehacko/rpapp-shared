import {
  isProductOnlyMode1CarveOutAllowed,
  isProductOnlyPurpose,
  resolveOmittedCreateReconciliationMode,
  resolvePurposeOwnedReconciliationMode,
} from '../purposeOwnedReconciliationMode.js';

const bothModes = { allowedModes: ['MODE_1', 'MODE_2'] as const };
const mode2Only = { allowedModes: ['MODE_2'] as const };

describe('purposeOwnedReconciliationMode', () => {
  describe('isProductOnlyPurpose', () => {
    it('is true only for PRODUCT_ONLY', () => {
      expect(isProductOnlyPurpose('PRODUCT_ONLY')).toBe(true);
      expect(isProductOnlyPurpose('DONATION_ONLY')).toBe(false);
      expect(isProductOnlyPurpose('BOTH')).toBe(false);
      expect(isProductOnlyPurpose(null)).toBe(false);
      expect(isProductOnlyPurpose(undefined)).toBe(false);
    });
  });

  describe('resolvePurposeOwnedReconciliationMode', () => {
    it('PRODUCT_ONLY ⇒ APP_INITIATED_ONLY when strategy allows MODE_1', () => {
      expect(
        resolvePurposeOwnedReconciliationMode({ purpose: 'PRODUCT_ONLY', strategy: bothModes })
      ).toBe('APP_INITIATED_ONLY');
    });

    it('PRODUCT_ONLY ⇒ BANK_FEED when strategy excludes MODE_1', () => {
      expect(
        resolvePurposeOwnedReconciliationMode({ purpose: 'PRODUCT_ONLY', strategy: mode2Only })
      ).toBe('BANK_FEED_AUTHORITATIVE');
    });

    it('DONATION_ONLY ⇒ BANK_FEED', () => {
      expect(
        resolvePurposeOwnedReconciliationMode({ purpose: 'DONATION_ONLY', strategy: bothModes })
      ).toBe('BANK_FEED_AUTHORITATIVE');
    });

    it('BOTH ⇒ null (no auto-MODE_1)', () => {
      expect(
        resolvePurposeOwnedReconciliationMode({ purpose: 'BOTH', strategy: bothModes })
      ).toBeNull();
    });
  });

  describe('resolveOmittedCreateReconciliationMode', () => {
    it('PRODUCT_ONLY prefers MODE_1 even when recon/surfaces Off', () => {
      expect(
        resolveOmittedCreateReconciliationMode({
          purpose: 'PRODUCT_ONLY',
          strategy: bothModes,
          entitlements: {
            paymentReconciliationOn: false,
            hasKioskOrCustomerSurface: false,
          },
        })
      ).toBe('APP_INITIATED_ONLY');
    });

    it('BOTH with recon Off defaults to BANK_FEED', () => {
      expect(
        resolveOmittedCreateReconciliationMode({
          purpose: 'BOTH',
          strategy: bothModes,
          entitlements: {
            paymentReconciliationOn: false,
            hasKioskOrCustomerSurface: true,
          },
        })
      ).toBe('BANK_FEED_AUTHORITATIVE');
    });

    it('BOTH with recon + surface + MODE_1 prefers APP_INITIATED_ONLY', () => {
      expect(
        resolveOmittedCreateReconciliationMode({
          purpose: 'BOTH',
          strategy: bothModes,
          entitlements: {
            paymentReconciliationOn: true,
            hasKioskOrCustomerSurface: true,
          },
        })
      ).toBe('APP_INITIATED_ONLY');
    });
  });

  describe('isProductOnlyMode1CarveOutAllowed', () => {
    it('allows PRODUCT_ONLY + MODE_1 + strategy MODE_1', () => {
      expect(
        isProductOnlyMode1CarveOutAllowed({
          mode: 'APP_INITIATED_ONLY',
          purpose: 'PRODUCT_ONLY',
          strategy: bothModes,
          snapshot: {},
        })
      ).toBe(true);
    });

    it('denies when strategy excludes MODE_1', () => {
      expect(
        isProductOnlyMode1CarveOutAllowed({
          mode: 'APP_INITIATED_ONLY',
          purpose: 'PRODUCT_ONLY',
          strategy: mode2Only,
        })
      ).toBe(false);
    });

    it('denies BOTH and DONATION_ONLY', () => {
      expect(
        isProductOnlyMode1CarveOutAllowed({
          mode: 'APP_INITIATED_ONLY',
          purpose: 'BOTH',
          strategy: bothModes,
        })
      ).toBe(false);
      expect(
        isProductOnlyMode1CarveOutAllowed({
          mode: 'APP_INITIATED_ONLY',
          purpose: 'DONATION_ONLY',
          strategy: bothModes,
        })
      ).toBe(false);
    });
  });
});
