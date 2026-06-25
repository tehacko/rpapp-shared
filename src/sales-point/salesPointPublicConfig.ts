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

export interface SalesPointPublicCatalogMedia {
  readonly cardAspectRatio: string;
  readonly thumbnailAspectRatio: string;
  readonly objectFit: 'cover' | 'contain';
}

export type SalesPointPublicProductCollectionMode = 'PAY_AT_KIOSK' | 'PREPAY_COLLECT_LATER';

export interface SalesPointPublicConfigLocationFields {
  readonly salesPointSlug: string | null;
  readonly customerShopUrl: string | null;
}

export interface SalesPointPublicLoyaltyCapability {
  readonly enabled: boolean;
  readonly previewRequired: false;
}

export type SalesPointPublicConfigV1 =
  | ({
      readonly configVersion: number;
      readonly salesPointOperationalMode: 'PRODUCTS';
      readonly defaultProductCollectionMode: SalesPointPublicProductCollectionMode;
      readonly commerceConfigJson?: SalesPointPublicCommerceConfig | null;
      readonly paymentSurface: SalesPointPublicPaymentSurface;
      readonly catalogMedia?: SalesPointPublicCatalogMedia;
      readonly outboxObligationsEnabled: boolean;
      readonly loyalty?: SalesPointPublicLoyaltyCapability;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    } & SalesPointPublicConfigLocationFields)
  | ({
      readonly configVersion: number;
      readonly salesPointOperationalMode: 'DONATION';
      readonly defaultProductCollectionMode?: SalesPointPublicProductCollectionMode;
      readonly commerceConfigJson?: SalesPointPublicCommerceConfig | null;
      readonly donation: SalesPointPublicDonationPayload;
      readonly paymentSurface: SalesPointPublicPaymentSurface;
      readonly catalogMedia?: SalesPointPublicCatalogMedia;
      readonly outboxObligationsEnabled: boolean;
      readonly loyalty?: SalesPointPublicLoyaltyCapability;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    } & SalesPointPublicConfigLocationFields);

/** Current contract version emitted by the backend. */
export const SALES_POINT_PUBLIC_CONFIG_VERSION = 5;
