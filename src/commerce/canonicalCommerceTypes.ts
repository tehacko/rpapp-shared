/**
 * Canonical commerce client types (G39).
 * Adapter id literals SoT: `canonicalCommerceUnions.ts` (matches backend domain).
 * Do not import Prisma enums here.
 */

export {
  TAX_REGIMES,
  CANONICAL_ECONOMIC_EFFECTS,
  ACCOUNTING_EXPORT_ADAPTER_IDS,
  type TaxRegime,
  type CanonicalEconomicEffect,
  type AccountingExportAdapterId,
} from './canonicalCommerceUnions.js';

import type { AccountingExportAdapterId } from './canonicalCommerceUnions.js';

export const SUPPORTED_ACCOUNTING_EXPORT_ADAPTER_IDS = [
  'canonical-csv-v1',
  'canonical-json-v1',
] as const satisfies readonly AccountingExportAdapterId[];

export type CanonicalPaymentRole = 'sale' | 'payment_attempt';
