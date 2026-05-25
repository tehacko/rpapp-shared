export { createCrossTabBus, type CrossTabBus } from './CrossTabBus.js';

export type CustomerAuthCrossTabMessage =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'session-refreshed' };

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
