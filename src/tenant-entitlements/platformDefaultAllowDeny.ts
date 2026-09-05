/**
 * Platform /admin/me default-allow DENY keys — distinct from DEFAULT_OFF_ROLLOUT_BLOCK_KEYS.
 *
 * `buildPlatformDefaultAllowEntitlementSnapshot` DENYs these so /dev sessions do not
 * surface commercial default-off product UI (e.g. Mobilní obchod) before a tenant
 * Feature Policy bind. Full-demo seed (`buildFullDemoSimpleStates`) does **not**
 * consult this set — railway-cafe / *-max may still enable these blocks.
 *
 * `product_barcode_administration` is purpose-locked ON with product_vending and is
 * intentionally absent from this list.
 */
import type { EntitlementBlockKey } from './types.js';
import { SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY } from './salesPointIndividualSettingsEntitlement.js';

export const PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS = [
  SALES_POINT_INDIVIDUAL_SETTINGS_BLOCK_KEY,
] as const satisfies readonly EntitlementBlockKey[];

export function isPlatformDefaultAllowDenyBlockKey(blockKey: string): boolean {
  return (PLATFORM_DEFAULT_ALLOW_DENY_BLOCK_KEYS as readonly string[]).includes(blockKey);
}
