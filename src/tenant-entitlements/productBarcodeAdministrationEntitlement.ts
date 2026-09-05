/**
 * product_barcode_administration — CONDITIONAL purpose-locked ON block for admin
 * product barcode/QR assign tab and barcode mutation APIs whenever product_vending
 * is active (PRODUCT_ONLY / BOTH). Not operator-toggleable; DONATION_ONLY → HARD_OFF.
 *
 * Not in DEFAULT_OFF_ROLLOUT_BLOCK_KEYS or PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS.
 */
import type { EntitlementBlockKey } from './types.js';

export const PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY =
  'product_barcode_administration' as const satisfies EntitlementBlockKey;
