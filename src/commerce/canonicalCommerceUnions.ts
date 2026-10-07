/**
 * Canonical Commerce V1A string unions duplicated for clients (G39).
 * Backend domain copies the same literals. Do **not** re-export Prisma enums.
 */

export const TAX_REGIMES = ['STANDARD', 'ZERO_RATED', 'EXEMPT', 'OUT_OF_SCOPE'] as const;
export type TaxRegime = (typeof TAX_REGIMES)[number];

export const CANONICAL_ECONOMIC_EFFECTS = [
  'SALE',
  'SALE_ITEM',
  'PAYMENT',
  'REFUND',
  'PAYMENT_FEE',
  'SETTLEMENT',
  'PAYOUT',
  'DOCUMENT',
  'CASH_OPENING_FLOAT',
  'CASH_CLOSING_CASH',
  'CASH_DIFFERENCE',
  'CASH_REFUND',
  'CASH_DISBURSEMENT',
] as const;
export type CanonicalEconomicEffect = (typeof CANONICAL_ECONOMIC_EFFECTS)[number];

/** V1A supported adapters plus vendor stubs (`supported: false` in backend). */
export const ACCOUNTING_EXPORT_ADAPTER_IDS = [
  'canonical-csv-v1',
  'canonical-json-v1',
  'pohoda-xml-v1',
  'money-s3-v1',
  'isdoc-v1',
] as const;
export type AccountingExportAdapterId = (typeof ACCOUNTING_EXPORT_ADAPTER_IDS)[number];
