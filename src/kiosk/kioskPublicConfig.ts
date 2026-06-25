/**
 * Legacy kiosk public-config re-exports.
 *
 * Canonical types live in `sales-point/salesPointPublicConfig.ts` (W-14).
 * Retained for existing kiosk/admin imports during SalesPoint rename.
 */

export type {
  DonationAmountConfigSource,
  PublicConfigWarningCode,
  SalesPointPublicDonationProject as KioskPublicDonationProject,
  SalesPointPublicDonationAmountCard as KioskPublicDonationAmountCard,
  SalesPointPublicDonationAmountConfig as KioskPublicDonationAmountConfig,
  SalesPointPublicDonationPayload as KioskPublicDonationPayload,
  SalesPointPublicPaymentSurface as KioskPublicPaymentSurface,
  SalesPointPublicCommerceConfig as KioskPublicCommerceConfig,
  SalesPointPublicCatalogMedia as KioskPublicCatalogMedia,
  SalesPointPublicProductCollectionMode as KioskPublicProductCollectionMode,
  SalesPointPublicConfigV1 as KioskPublicConfigV1,
} from '../sales-point/salesPointPublicConfig.js';

export {
  SALES_POINT_PUBLIC_CONFIG_VERSION as KIOSK_PUBLIC_CONFIG_VERSION,
} from '../sales-point/salesPointPublicConfig.js';
