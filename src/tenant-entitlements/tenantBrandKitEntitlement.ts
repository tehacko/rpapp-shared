/**
 * tenant_brand_kit — CONDITIONAL default-off block for advanced brand-kit controls.
 *
 * When OFF (catalog default / missing policy row):
 * - Square logo still uploads under tenant_ops_settings
 * - Customer PWA + admin login apply stay ON (DB defaults + media-gain coerce)
 * - Receipts + emails apply stay OFF; wordmark upload + receipt footer are gated
 *
 * When ON: wordmark, receipt footer, and all four apply-to toggles are editable.
 */
import type { EntitlementBlockKey } from './types.js';

export const TENANT_BRAND_KIT_BLOCK_KEY =
  'tenant_brand_kit' as const satisfies EntitlementBlockKey;
