export { createCrossTabBus, type CrossTabBus } from './CrossTabBus.js';

/** In-memory session hand-off for same-origin tabs when no refresh cookie exists. */
export interface CustomerAuthCrossTabSessionSnapshot {
  accessToken: string;
  refreshToken: string;
  customerId: number;
  tenantId: number;
  membershipStatus: 'ACTIVE';
}

export type CustomerAuthCrossTabMessage =
  | {
      type: 'login';
      tenantCode: string;
      /** Present when login did not persist an HttpOnly refresh cookie. */
      session?: CustomerAuthCrossTabSessionSnapshot;
    }
  | { type: 'logout'; tenantCode: string; scope?: 'global' }
  | { type: 'session-refreshed'; tenantCode: string };

export type CustomerConsentCrossTabMessage = { type: 'consent-updated' };

export type KioskTabCrossTabMessage =
  | { type: 'kiosk-reset' }
  | { type: 'session-rotate' }
  | { type: 'kiosk-customer-session-changed' };

export type AdminAuthCrossTabMessage =
  | { type: 'login' }
  | { type: 'logout' };

export type AdminTenantCrossTabMessage = { type: 'tenant-changed'; tenantCode: string };

export type AdminCacheCrossTabMessage = { type: 'cache-invalidate'; scope: string };

export const CUSTOMER_AUTH_CHANNEL = 'rpapp-customer-auth';
export const CUSTOMER_CONSENT_CHANNEL = 'rpapp-customer-consent';
export const KIOSK_TAB_CHANNEL = 'rpapp-kiosk-tab';
export const ADMIN_AUTH_CHANNEL = 'rpapp-admin-auth';
export const ADMIN_TENANT_CHANNEL = 'rpapp-admin-tenant';
export const ADMIN_CACHE_CHANNEL = 'rpapp-admin-cache';
