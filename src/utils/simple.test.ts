// Tests for shared utilities
import { validateEmail, formatPrice, generatePaymentId } from '../utils';
import { getErrorMessage } from '../errors';

// Import Jest globals explicitly
import { describe, test, expect } from '@jest/globals';

describe('Shared Utilities', () => {
  describe('validateEmail', () => {
    test('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test..test@domain.com')).toBe(false);
    });
  });

  describe('formatPrice', () => {
    test('formats prices correctly', () => {
      expect(formatPrice(100)).toMatch(/100,00\s*Kč/);
      expect(formatPrice(25.5)).toMatch(/25,50\s*Kč/);
      expect(formatPrice(0)).toMatch(/0,00\s*Kč/);
    });
  });

  describe('generatePaymentId', () => {
    test('generates unique payment IDs', () => {
      const id1 = generatePaymentId();
      const id2 = generatePaymentId();
      
      expect(id1).toMatch(/^pay-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^pay-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getErrorMessage', () => {
    test('returns user-friendly error messages', () => {
      const fetchError = new Error('Failed to fetch');
      expect(getErrorMessage(fetchError)).toBe('Problém s připojením. Zkuste to znovu.');

      const authError = new Error('401 Unauthorized');
      expect(getErrorMessage(authError)).toBe('Neplatné přihlašovací údaje.');

      const genericError = new Error('Something went wrong');
      expect(getErrorMessage(genericError)).toBe('Something went wrong');

      const emptyError = new Error('');
      expect(getErrorMessage(emptyError)).toBe('Něco se pokazilo. Zkuste to znovu.');
    });
  });
});
