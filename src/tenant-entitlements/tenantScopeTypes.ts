/**
 * Tenant-level commerce + surface scope (Option A — canonical on Tenant row).
 * Drives axis-controlled entitlement blocks; bank allowedPurposes follows tenant.
 */

export const TENANT_ALLOWED_PURPOSES = ['PRODUCT_ONLY', 'DONATION_ONLY', 'BOTH'] as const;
export type TenantAllowedPurposes = (typeof TENANT_ALLOWED_PURPOSES)[number];

export const TENANT_SURFACE_SCOPE_IDS = ['KIOSK_ONLY', 'CUSTOMER_ONLY', 'BOTH'] as const;
export type TenantSurfaceScope = (typeof TENANT_SURFACE_SCOPE_IDS)[number];

export function isTenantAllowedPurposes(value: unknown): value is TenantAllowedPurposes {
  return (
    value === 'PRODUCT_ONLY' ||
    value === 'DONATION_ONLY' ||
    value === 'BOTH'
  );
}

export function isTenantSurfaceScope(value: unknown): value is TenantSurfaceScope {
  return value === 'KIOSK_ONLY' || value === 'CUSTOMER_ONLY' || value === 'BOTH';
}
