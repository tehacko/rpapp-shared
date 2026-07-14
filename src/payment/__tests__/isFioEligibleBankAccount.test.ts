import {
  extractCzBankCode,
  isFioEligibleBankAccount,
} from '../isFioEligibleBankAccount.js';
import { normalizeIban } from '../normalizeIban.js';

const FIO_IBAN = 'CZ42 2010 0000 0020 0148 5399';
const NON_FIO_IBAN = 'CZ65 0800 0000 1920 0014 5399';

describe('normalizeIban', () => {
  it('strips spaces and uppercases', () => {
    expect(normalizeIban('cz42 2010 0000 0020 0148 5399')).toBe(
      'CZ4220100000002001485399',
    );
  });
});

describe('extractCzBankCode', () => {
  it('reads bank code from CZ IBAN positions 5–8', () => {
    expect(extractCzBankCode(NON_FIO_IBAN)).toBe('0800');
    expect(extractCzBankCode(FIO_IBAN)).toBe('2010');
  });

  it('returns null for non-CZ or too-short IBAN', () => {
    expect(extractCzBankCode('DE89370400440532013000')).toBeNull();
    expect(extractCzBankCode('CZ1')).toBeNull();
  });
});

describe('isFioEligibleBankAccount — plan §9 D.1 vectors', () => {
  it('1: CZ65 0800… → false (0800)', () => {
    expect(isFioEligibleBankAccount({ iban: NON_FIO_IBAN })).toBe(false);
  });

  it('2: CZ42 2010… → true', () => {
    expect(isFioEligibleBankAccount({ iban: FIO_IBAN })).toBe(true);
  });

  it('3: lowercase iban → true after normalize', () => {
    expect(
      isFioEligibleBankAccount({ iban: 'cz42 2010 0000 0020 0148 5399' }),
    ).toBe(true);
  });

  it('4: bankCode 2010 + non-FIO iban → false (IBAN wins — FD-25)', () => {
    expect(
      isFioEligibleBankAccount({ iban: NON_FIO_IBAN, bankCode: '2010' }),
    ).toBe(false);
  });

  it('5: empty both → false', () => {
    expect(isFioEligibleBankAccount({ iban: '', bankCode: '' })).toBe(false);
    expect(isFioEligibleBankAccount({})).toBe(false);
  });

  it('6: DE89370400440532013000 → false', () => {
    expect(
      isFioEligibleBankAccount({ iban: 'DE89370400440532013000' }),
    ).toBe(false);
  });

  it('7: bankCode " 2010 " → true', () => {
    expect(isFioEligibleBankAccount({ bankCode: ' 2010 ' })).toBe(true);
  });

  it('8: CZ1 too short → false', () => {
    expect(isFioEligibleBankAccount({ iban: 'CZ1' })).toBe(false);
  });

  it('9: bankCode 0800 explicit → false', () => {
    expect(isFioEligibleBankAccount({ bankCode: '0800' })).toBe(false);
  });

  it('10: spaced FIO IBAN, null bankCode → true', () => {
    expect(isFioEligibleBankAccount({ iban: FIO_IBAN, bankCode: null })).toBe(
      true,
    );
  });

  it('11: spaced FIO IBAN + bankCode 0800 → true (FD-25: IBAN 2010 wins)', () => {
    expect(
      isFioEligibleBankAccount({ iban: FIO_IBAN, bankCode: '0800' }),
    ).toBe(true);
  });

  it('12: null iban + bankCode 2010 → true', () => {
    expect(
      isFioEligibleBankAccount({ iban: null, bankCode: '2010' }),
    ).toBe(true);
  });
});
