/**
 * Sales-point public-config contract (v1).
 *
 * Single shape from day one — no legacy fields, no dual-read window.
 * Backed by `GET /api/v1/sales-point-device/public-config/:salesPointId`.
 * Discriminated union over `salesPointOperationalMode`:
 *
 *   - `PRODUCTS`: standard device cart UI; no `donation` payload.
 *   - `DONATION`: donation device UI; `donation` payload is REQUIRED and
 *     must be structurally valid.
 */

export type DonationAmountConfigSource =
  | 'salesPointOverride'
  | 'template'
  | 'tenantDefault'
  | 'fallback';

export type PublicConfigWarningCode =
  | 'TEMPLATE_ARCHIVED_FALLBACK_USED'
  | 'NO_TENANT_DEFAULT_TEMPLATE'
  | 'TENANT_DEFAULT_UNUSABLE'
  | 'NO_PROJECTS_ASSIGNED'
  | 'OVERRIDE_REFERENCES_MISSING_TEMPLATE'
  | 'IMAGE_URL_UNREACHABLE';

export interface SalesPointPublicDonationProject {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly thumbnailUrl?: string | null;
  readonly goalAmountMinor: number | null;
  readonly collectedAmountMinor: number;
  readonly currency: string;
  readonly displayOrder: number;
}

export interface SalesPointPublicDonationAmountCard {
  readonly amountMinor: number;
  readonly displayOrder: number;
  readonly labelKey?: string | null;
}

export interface SalesPointPublicDonationAmountConfig {
  readonly source: DonationAmountConfigSource;
  readonly templateId: number | null;
  readonly cards: ReadonlyArray<SalesPointPublicDonationAmountCard>;
  readonly allowCustom: boolean;
  readonly customMinMinor: number | null;
  readonly customMaxMinor: number | null;
}

export interface SalesPointPublicDonationPayload {
  readonly projects: ReadonlyArray<SalesPointPublicDonationProject>;
  readonly amountConfig: SalesPointPublicDonationAmountConfig;
}

export interface SalesPointPublicPaymentSurface {
  readonly stripePublishableKey: string | null;
  readonly cardPresentEnabled: boolean;
}

export type SalesPointPublicCommerceConfig = Record<string, unknown>;

/** Kiosk payment rails filtered by tenant readiness in public config. */
export interface SalesPointPaymentRailsKiosk {
  readonly cash: boolean;
  readonly bankTransfer: boolean;
  readonly cardPresent: boolean;
  readonly gatewayInKioskPsp: boolean;
  readonly gatewayHandoff: boolean;
}

/** Mobile (PWA) payment rails filtered by tenant readiness in public config. */
export interface SalesPointPaymentRailsMobile {
  readonly bankTransfer: boolean;
  readonly gateway: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Parse `paymentRailsKiosk` from `commerceConfigJson` on device public config. */
export function parsePaymentRailsKioskFromCommerceConfig(
  commerceConfigJson: SalesPointPublicCommerceConfig | null | undefined
): SalesPointPaymentRailsKiosk | null {
  if (!isRecord(commerceConfigJson)) {
    return null;
  }
  const rails = commerceConfigJson.paymentRailsKiosk;
  if (!isRecord(rails)) {
    return null;
  }
  return {
    cash: rails.cash === true,
    bankTransfer: rails.bankTransfer === true,
    cardPresent: rails.cardPresent === true,
    gatewayInKioskPsp: rails.gatewayInKioskPsp === true,
    gatewayHandoff: rails.gatewayHandoff === true,
  };
}

/** Parse `paymentRailsMobile` from `commerceConfigJson` on customer sales-point config. */
export function parsePaymentRailsMobileFromCommerceConfig(
  commerceConfigJson: SalesPointPublicCommerceConfig | null | undefined
): SalesPointPaymentRailsMobile | null {
  if (!isRecord(commerceConfigJson)) {
    return null;
  }
  const rails = commerceConfigJson.paymentRailsMobile;
  if (!isRecord(rails)) {
    return null;
  }
  return {
    bankTransfer: rails.bankTransfer === true,
    gateway: rails.gateway === true,
  };
}

export interface SalesPointPublicCatalogMedia {
  readonly cardAspectRatio: string;
  readonly thumbnailAspectRatio: string;
  readonly objectFit: 'cover' | 'contain';
}

export type SalesPointPublicProductCollectionMode = 'PAY_AT_KIOSK' | 'PREPAY_COLLECT_LATER';

import type { SalesPointInteractionMode } from '../types.js';
export type { SalesPointInteractionMode };

export interface SalesPointPublicConfigLocationFields {
  readonly salesPointSlug: string | null;
  readonly customerShopUrl: string | null;
}

export interface SalesPointPublicLoyaltyCapability {
  readonly enabled: boolean;
  readonly previewRequired: false;
}

/** Per-block posture on device public-config (ENT-PR-17 ceiling). */
export interface SalesPointPublicEntitlementBlockPosture {
  readonly entitled: boolean;
  readonly allowReads: boolean;
  readonly allowWrites: boolean;
}

/** Tenant entitlement ceiling emitted on sales-point public-config (§4, §16.1). */
export interface SalesPointPublicEntitlementCeiling {
  readonly revision: number;
  readonly surfaceKiosk: SalesPointPublicEntitlementBlockPosture;
  readonly realtimeDeviceTransport: SalesPointPublicEntitlementBlockPosture;
  /** Sales point acts as implicit pickup point (ENT-PR-12 mirror mode). */
  readonly pickupMirrorMode: boolean;
}

/** WS/SSE disconnect reason when surface or transport block is off (§12.3). */
export const ENTITLEMENT_SURFACE_DISABLED_CODE = 'ENTITLEMENT_SURFACE_DISABLED' as const;

export const DEFAULT_ENTITLED_PUBLIC_POSTURE: SalesPointPublicEntitlementBlockPosture = {
  entitled: true,
  allowReads: true,
  allowWrites: true,
};

export function resolveSalesPointEntitlementCeiling(
  config: Pick<SalesPointPublicConfigV1, 'entitlementCeiling'>
): SalesPointPublicEntitlementCeiling {
  if (config.entitlementCeiling !== undefined) {
    return config.entitlementCeiling;
  }
  return {
    revision: 0,
    surfaceKiosk: DEFAULT_ENTITLED_PUBLIC_POSTURE,
    realtimeDeviceTransport: DEFAULT_ENTITLED_PUBLIC_POSTURE,
    pickupMirrorMode: false,
  };
}

export type SalesPointPublicConfigV1 =
  | ({
      readonly configVersion: number;
      readonly salesPointOperationalMode: 'PRODUCTS';
      /** Omitted on legacy configVersion ≤5 — treat as CUSTOMER_FACING (AC-FE-23). */
      readonly salesPointInteractionMode?: SalesPointInteractionMode;
      readonly defaultProductCollectionMode: SalesPointPublicProductCollectionMode;
      readonly commerceConfigJson?: SalesPointPublicCommerceConfig | null;
      readonly paymentSurface: SalesPointPublicPaymentSurface;
      readonly catalogMedia?: SalesPointPublicCatalogMedia;
      readonly outboxObligationsEnabled: boolean;
      readonly loyalty?: SalesPointPublicLoyaltyCapability;
      readonly entitlementCeiling?: SalesPointPublicEntitlementCeiling;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    } & SalesPointPublicConfigLocationFields)
  | ({
      readonly configVersion: number;
      readonly salesPointOperationalMode: 'DONATION';
      readonly salesPointInteractionMode?: SalesPointInteractionMode;
      readonly defaultProductCollectionMode?: SalesPointPublicProductCollectionMode;
      readonly commerceConfigJson?: SalesPointPublicCommerceConfig | null;
      readonly donation: SalesPointPublicDonationPayload;
      readonly paymentSurface: SalesPointPublicPaymentSurface;
      readonly catalogMedia?: SalesPointPublicCatalogMedia;
      readonly outboxObligationsEnabled: boolean;
      readonly loyalty?: SalesPointPublicLoyaltyCapability;
      readonly entitlementCeiling?: SalesPointPublicEntitlementCeiling;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    } & SalesPointPublicConfigLocationFields);

/** Current contract version emitted by the backend. */
export const SALES_POINT_PUBLIC_CONFIG_VERSION = 6;

/** Resolve interaction mode from public config (backward compat for v≤5). */
export function resolveSalesPointInteractionMode(
  config: Pick<SalesPointPublicConfigV1, 'salesPointInteractionMode'>
): SalesPointInteractionMode {
  return config.salesPointInteractionMode ?? 'CUSTOMER_FACING';
}
