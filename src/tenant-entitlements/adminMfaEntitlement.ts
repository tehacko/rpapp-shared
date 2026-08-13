/**
 * admin_mfa — CONDITIONAL default-off rollout block for admin TOTP.
 * Catalog key lives in types/catalog; this module exports rollout helpers.
 */
import type { EntitlementBlockKey } from './types.js';

export const ADMIN_MFA_BLOCK_KEY = 'admin_mfa' as const satisfies EntitlementBlockKey;

/**
 * CONDITIONAL blocks that stay OFF even in full-demo seed until ops toggles them
 * per tenant (feature-policy). Not LaunchDarkly — tenant entitlement rows.
 */
export const DEFAULT_OFF_ROLLOUT_BLOCK_KEYS = [ADMIN_MFA_BLOCK_KEY] as const satisfies readonly EntitlementBlockKey[];

export function isDefaultOffRolloutBlockKey(blockKey: string): boolean {
  return (DEFAULT_OFF_ROLLOUT_BLOCK_KEYS as readonly string[]).includes(blockKey);
}
