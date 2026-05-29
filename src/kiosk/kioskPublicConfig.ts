/**
 * Kiosk public-config contract (v1).
 *
 * Single shape from day one — no legacy fields, no dual-read window.
 * Backed by `GET /api/v1/kiosk/public-config/:kioskId`. Discriminated
 * union over `kioskOperationalMode`:
 *
 *   - `PRODUCTS`: standard kiosk cart UI; no `donation` payload.
 *   - `DONATION`: donation kiosk UI; `donation` payload is REQUIRED and
 *     must be structurally valid. When it is not, the kiosk shows
 *     `DonationMisconfigurationScreen` rather than the product grid.
 *
 * See plan "Donation Kiosk Mode End-to-End" §"Public-config contract" and
 * §"No backward compatibility policy".
 */

export type DonationAmountConfigSource =
  | 'kioskOverride'
  | 'template'
  | 'tenantDefault'
  | 'fallback';

/**
 * Warning codes a client may receive via `warnings[]`. Codes are
 * non-blocking signals that admins should fix; the kiosk renders best-effort.
 * Misconfiguration that actually blocks DONATION rendering is communicated by
 * the absence of a valid `donation` payload (handled by the kiosk shell).
 */
export type PublicConfigWarningCode =
  | 'TEMPLATE_ARCHIVED_FALLBACK_USED'
  | 'NO_TENANT_DEFAULT_TEMPLATE'
  | 'TENANT_DEFAULT_UNUSABLE'
  | 'NO_PROJECTS_ASSIGNED'
  | 'OVERRIDE_REFERENCES_MISSING_TEMPLATE'
  | 'IMAGE_URL_UNREACHABLE';

export interface KioskPublicDonationProject {
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

export interface KioskPublicDonationAmountCard {
  readonly amountMinor: number;
  readonly displayOrder: number;
  readonly labelKey?: string | null;
}

export interface KioskPublicDonationAmountConfig {
  readonly source: DonationAmountConfigSource;
  readonly templateId: number | null;
  readonly cards: ReadonlyArray<KioskPublicDonationAmountCard>;
  readonly allowCustom: boolean;
  readonly customMinMinor: number | null;
  readonly customMaxMinor: number | null;
}

export interface KioskPublicDonationPayload {
  readonly projects: ReadonlyArray<KioskPublicDonationProject>;
  readonly amountConfig: KioskPublicDonationAmountConfig;
}

export interface KioskPublicPaymentSurface {
  readonly stripePublishableKey: string | null;
  readonly cardPresentEnabled: boolean;
}

export type KioskPublicConfigV1 =
  | {
      readonly configVersion: number;
      readonly kioskOperationalMode: 'PRODUCTS';
      readonly paymentSurface: KioskPublicPaymentSurface;
      /** Server `outbox.obligationsEnabled` — kiosk uses for fail-closed release-gate polling. */
      readonly outboxObligationsEnabled: boolean;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    }
  | {
      readonly configVersion: number;
      readonly kioskOperationalMode: 'DONATION';
      readonly donation: KioskPublicDonationPayload;
      readonly paymentSurface: KioskPublicPaymentSurface;
      readonly outboxObligationsEnabled: boolean;
      readonly warnings?: ReadonlyArray<PublicConfigWarningCode>;
    };

/** Current contract version emitted by the backend. */
export const KIOSK_PUBLIC_CONFIG_VERSION = 1;
