/**
 * sales_point_individual_settings — CONDITIONAL default-off block for per-SP
 * Mobilní obchod (mobile shop channel) editor on Prodejní kanály.
 *
 * Not in DEFAULT_OFF_ROLLOUT_BLOCK_KEYS — full-demo (railway-cafe / *-max) seeds On.
 * Platform /admin/me default-allow DENYs via PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS.
 */
import type { EntitlementBlockKey } from './types.js';

export const SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY =
  'sales_point_individual_settings' as const satisfies EntitlementBlockKey;
