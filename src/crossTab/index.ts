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

export type CustomerConsentCrossTabMessage = {
  type: 'consent-updated';
  /** Tenant scope when publisher knows it (admin GDPR or customer PWA). */
  tenantCode?: string;
  tenantId?: number;
  source?: 'customer' | 'admin';
  /** When `global`, subscribers on all tenants re-read effective consent (R10). */
  scope?: 'global' | 'tenant';
};

export type KioskTabCrossTabMessage =
  | { type: 'kiosk-reset' }
  | { type: 'session-rotate' }
  | { type: 'kiosk-customer-session-changed' }
  | { type: 'staff-logout' };

export type AdminAuthCrossTabMessage =
  | { type: 'login'; tenantCode: string }
  | { type: 'logout'; tenantCode: string }
  | { type: 'session-refreshed'; tenantCode: string }
  | {
      type: 'tenant-changed';
      tenantCode: string;
      previousTenantCode?: string;
    };

export type PickupStaffAuthCrossTabMessage =
  | { type: 'login'; tenantCode: string }
  | { type: 'logout'; tenantCode: string }
  | { type: 'session-refreshed'; tenantCode: string }
  | { type: 'session-expired'; tenantCode: string }
  | { type: 'pickup-point-changed'; tenantCode: string; pickupPointId: number };

export type AdminTenantCrossTabMessage = { type: 'tenant-changed'; tenantCode: string };

export type AdminCacheCrossTabMessage = { type: 'cache-invalidate'; scope: string };

export const CUSTOMER_AUTH_CHANNEL = 'rpapp-customer-auth';
export const CUSTOMER_CONSENT_CHANNEL = 'rpapp-customer-consent';
export const KIOSK_TAB_CHANNEL = 'rpapp-kiosk-tab';
export const ADMIN_AUTH_CHANNEL = 'rpapp-admin-auth';
export const ADMIN_TENANT_CHANNEL = 'rpapp-admin-tenant';
export const ADMIN_CACHE_CHANNEL = 'rpapp-admin-cache';
export const PICKUP_STAFF_AUTH_CHANNEL = 'rpapp-pickup-staff-auth';
