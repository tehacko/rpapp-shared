/**
 * product_barcode_administration — CONDITIONAL default-off block for admin product
 * barcode/QR assign tab and barcode mutation APIs.
 *
 * Not in DEFAULT_OFF_ROLLOUT_BLOCK_KEYS — full-demo (railway-cafe / *-max) seeds On.
 * Platform /admin/me default-allow DENYs via PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS.
 */
import type { EntitlementBlockKey } from './types.js';

export const PRODUCT_BARCODE_ADMINISTRATION_BLOCK_KEY =
  'product_barcode_administration' as const satisfies EntitlementBlockKey;
