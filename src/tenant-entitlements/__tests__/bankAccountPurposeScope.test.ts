import {
  isBankAccountAllowedPurposesCompatible,
  isBankAccountPurposeSelectable,
  isDonationPurposeAllowed,
  isProductPurposeAllowed,
  resolveBankAccountAllowedPurposes,
  shouldClearTenantDefaultDonationProjectId,
  shouldShowBankAccountPurposeSection,
  shouldSyncBankAccountsToTenantAllowedPurposes,
} from '../bankAccountPurposeScope.js';

describe('bankAccountPurposeScope', () => {
  describe('isBankAccountPurposeSelectable', () => {
    it('is true only when tenant allows BOTH', () => {
      expect(isBankAccountPurposeSelectable('BOTH')).toBe(true);
      expect(isBankAccountPurposeSelectable('PRODUCT_ONLY')).toBe(false);
      expect(isBankAccountPurposeSelectable('DONATION_ONLY')).toBe(false);
    });
  });

  describe('isProductPurposeAllowed', () => {
    it('allows PRODUCT_ONLY and BOTH', () => {
      expect(isProductPurposeAllowed('PRODUCT_ONLY')).toBe(true);
      expect(isProductPurposeAllowed('BOTH')).toBe(true);
      expect(isProductPurposeAllowed('DONATION_ONLY')).toBe(false);
    });
  });

  describe('isDonationPurposeAllowed', () => {
    it('allows DONATION_ONLY and BOTH', () => {
      expect(isDonationPurposeAllowed('DONATION_ONLY')).toBe(true);
      expect(isDonationPurposeAllowed('BOTH')).toBe(true);
      expect(isDonationPurposeAllowed('PRODUCT_ONLY')).toBe(false);
    });
  });

  describe('isBankAccountAllowedPurposesCompatible', () => {
    it('accepts any bank purpose when tenant is BOTH', () => {
      expect(isBankAccountAllowedPurposesCompatible('BOTH', 'BOTH')).toBe(true);
      expect(isBankAccountAllowedPurposesCompatible('BOTH', 'PRODUCT_ONLY')).toBe(true);
      expect(isBankAccountAllowedPurposesCompatible('BOTH', 'DONATION_ONLY')).toBe(true);
    });

    it('requires bank to match when tenant is PRODUCT_ONLY', () => {
      expect(isBankAccountAllowedPurposesCompatible('PRODUCT_ONLY', 'PRODUCT_ONLY')).toBe(true);
      expect(isBankAccountAllowedPurposesCompatible('PRODUCT_ONLY', 'DONATION_ONLY')).toBe(false);
      expect(isBankAccountAllowedPurposesCompatible('PRODUCT_ONLY', 'BOTH')).toBe(false);
    });

    it('requires bank to match when tenant is DONATION_ONLY', () => {
      expect(isBankAccountAllowedPurposesCompatible('DONATION_ONLY', 'DONATION_ONLY')).toBe(true);
      expect(isBankAccountAllowedPurposesCompatible('DONATION_ONLY', 'PRODUCT_ONLY')).toBe(false);
      expect(isBankAccountAllowedPurposesCompatible('DONATION_ONLY', 'BOTH')).toBe(false);
    });
  });

  describe('resolveBankAccountAllowedPurposes', () => {
    it('forces tenant value when tenant is PRODUCT_ONLY even if request mismatches', () => {
      expect(resolveBankAccountAllowedPurposes('PRODUCT_ONLY', 'DONATION_ONLY')).toBe('PRODUCT_ONLY');
      expect(resolveBankAccountAllowedPurposes('PRODUCT_ONLY', 'BOTH')).toBe('PRODUCT_ONLY');
      expect(resolveBankAccountAllowedPurposes('PRODUCT_ONLY', null)).toBe('PRODUCT_ONLY');
      expect(resolveBankAccountAllowedPurposes('PRODUCT_ONLY')).toBe('PRODUCT_ONLY');
    });

    it('forces tenant value when tenant is DONATION_ONLY', () => {
      expect(resolveBankAccountAllowedPurposes('DONATION_ONLY', 'PRODUCT_ONLY')).toBe('DONATION_ONLY');
      expect(resolveBankAccountAllowedPurposes('DONATION_ONLY', 'BOTH')).toBe('DONATION_ONLY');
    });

    it('uses valid requested value when tenant is BOTH', () => {
      expect(resolveBankAccountAllowedPurposes('BOTH', 'PRODUCT_ONLY')).toBe('PRODUCT_ONLY');
      expect(resolveBankAccountAllowedPurposes('BOTH', 'DONATION_ONLY')).toBe('DONATION_ONLY');
      expect(resolveBankAccountAllowedPurposes('BOTH', 'BOTH')).toBe('BOTH');
    });

    it('defaults to BOTH when tenant is BOTH and request is missing or invalid', () => {
      expect(resolveBankAccountAllowedPurposes('BOTH')).toBe('BOTH');
      expect(resolveBankAccountAllowedPurposes('BOTH', null)).toBe('BOTH');
      expect(resolveBankAccountAllowedPurposes('BOTH', undefined)).toBe('BOTH');
    });
  });

  describe('shouldSyncBankAccountsToTenantAllowedPurposes', () => {
    it('is false for BOTH and true otherwise', () => {
      expect(shouldSyncBankAccountsToTenantAllowedPurposes('BOTH')).toBe(false);
      expect(shouldSyncBankAccountsToTenantAllowedPurposes('PRODUCT_ONLY')).toBe(true);
      expect(shouldSyncBankAccountsToTenantAllowedPurposes('DONATION_ONLY')).toBe(true);
    });
  });

  describe('shouldClearTenantDefaultDonationProjectId', () => {
    it('is true only when donation purpose is not allowed', () => {
      expect(shouldClearTenantDefaultDonationProjectId('PRODUCT_ONLY')).toBe(true);
      expect(shouldClearTenantDefaultDonationProjectId('DONATION_ONLY')).toBe(false);
      expect(shouldClearTenantDefaultDonationProjectId('BOTH')).toBe(false);
    });
  });

  describe('shouldShowBankAccountPurposeSection', () => {
    it('mirrors isBankAccountPurposeSelectable (true only for BOTH)', () => {
      expect(shouldShowBankAccountPurposeSection('BOTH')).toBe(true);
      expect(shouldShowBankAccountPurposeSection('PRODUCT_ONLY')).toBe(false);
      expect(shouldShowBankAccountPurposeSection('DONATION_ONLY')).toBe(false);
    });
  });
});
