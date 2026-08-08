export {
  createCrossTabBus,
  type CrossTabBus,
  type CrossTabPublishOptions,
} from './CrossTabBus.js';

export {
  shouldHonorAdminAuthBusMessage,
  type AdminAuthHonorMessage,
  type ShouldHonorAdminAuthBusMessageContext,
} from './shouldHonorAdminAuthBusMessage.js';

export {
  markSameTabExplicitAuth,
  hasSameTabExplicitAuth,
  clearSameTabExplicitAuth,
} from './sameTabExplicitAuth.js';

export type CustomerAuthCrossTabMessage =
  | {
      type: 'login';
      tenantCode: string;
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

/** XT-G12 — optional bus scope; `platform` always honored by `shouldHonorAdminAuthBusMessage`. */
export type AdminAuthCrossTabScope = 'platform' | 'tenant';

export type AdminAuthCrossTabMessage =
  | { type: 'login'; tenantCode: string; scope?: AdminAuthCrossTabScope }
  | { type: 'logout'; tenantCode: string; scope?: AdminAuthCrossTabScope }
  | { type: 'session-refreshed'; tenantCode: string; scope?: AdminAuthCrossTabScope }
  | {
      type: 'tenant-changed';
      tenantCode: string;
      previousTenantCode?: string;
      scope?: AdminAuthCrossTabScope;
    };

export type PickupStaffAuthCrossTabMessage =
  | { type: 'login'; tenantCode: string }
  | { type: 'logout'; tenantCode: string }
  | { type: 'session-refreshed'; tenantCode: string }
  | { type: 'session-expired'; tenantCode: string }
  | { type: 'pickup-point-changed'; tenantCode: string; pickupPointId: number };

export type AdminTenantCrossTabMessage = { type: 'tenant-changed'; tenantCode: string };

export type AdminCacheCrossTabMessage =
  | { type: 'cache-invalidate'; scope: string }
  | { type: 'api-deny'; denyKey: string }
  | { type: 'api-deny-clear'; denyKey?: string }
  | { type: 'request-failure'; cacheKey: string; status: number; ttlMs?: number };

export const CUSTOMER_AUTH_CHANNEL = 'rpapp-customer-auth';
export const CUSTOMER_CONSENT_CHANNEL = 'rpapp-customer-consent';
export const KIOSK_TAB_CHANNEL = 'rpapp-kiosk-tab';
export const ADMIN_AUTH_CHANNEL = 'rpapp-admin-auth';
export const ADMIN_TENANT_CHANNEL = 'rpapp-admin-tenant';
export const ADMIN_CACHE_CHANNEL = 'rpapp-admin-cache';
export const PICKUP_STAFF_AUTH_CHANNEL = 'rpapp-pickup-staff-auth';

export const CUSTOMER_CART_CHANNEL = 'rpapp-customer-cart';

export type CustomerCartCrossTabMessage = {
  type: 'cart-reset';
  tenantCode: string;
  kioskId: number;
  source: string;
};

export const CUSTOMER_FEATURE_FLAGS_CHANNEL = 'rpapp-customer-feature-flags';

export type CustomerFeatureFlagsCrossTabMessage = {
  type: 'flags-revision-changed';
  revision: number;
};
