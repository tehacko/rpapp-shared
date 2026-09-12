/**
 * payment_multi_currency — CONDITIONAL default-off rollout block.
 * Catalog key lives in types/catalog; this module exports rollout helpers.
 */
import type { EntitlementBlockKey } from './types.js';

export const PAYMENT_MULTI_CURRENCY_BLOCK_KEY =
  'payment_multi_currency' as const satisfies EntitlementBlockKey;
