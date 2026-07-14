import { normalizeIban } from './normalizeIban.js';

/** Czech bank code (4 digits) from positions 5–8 of a CZ IBAN, or null. */
export function extractCzBankCode(iban: string): string | null {
  const normalized = normalizeIban(iban);
  if (!normalized.startsWith('CZ') || normalized.length < 8) {
    return null;
  }
  return normalized.slice(4, 8);
}

export interface FioEligibleBankAccountInput {
  iban?: string | null;
  bankCode?: string | null;
}

/**
 * FIO Bank eligibility — CZ bank code 2010 only (FD-25: IBAN-derived code wins).
 */
export function isFioEligibleBankAccount(input: FioEligibleBankAccountInput): boolean {
  const ibanCode = input.iban ? extractCzBankCode(input.iban) : null;
  const code = ibanCode ?? input.bankCode?.trim() ?? null;
  return code === '2010';
}
