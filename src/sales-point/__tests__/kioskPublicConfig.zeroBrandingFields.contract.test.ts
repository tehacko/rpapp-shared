/**
 * Kiosk / sales-point public-config must carry zero tenant-directory branding fields.
 * Branding (logoUrl / tenantLogoUrl / side-table keys) is customer-directory only —
 * not part of GET sales-point-device public-config.
 */
import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  KioskPublicConfigV1,
  SalesPointPublicConfigV1,
} from '../salesPointPublicConfig.js';

const FORBIDDEN_ROOT_BRANDING_KEYS = [
  'logoUrl',
  'tenantLogoUrl',
  'tenantLogo',
  'salesPointImage',
  'brandMark',
  'storePhoto',
  'galleryVersion',
  'branding',
] as const;

type ForbiddenRootBrandingKey = (typeof FORBIDDEN_ROOT_BRANDING_KEYS)[number];

type AssertNever<T> = [T] extends [never] ? true : false;

/** Keys present on either PRODUCTS or DONATION public-config branch. */
type PublicConfigRootKey = SalesPointPublicConfigV1 extends infer U
  ? U extends object
    ? keyof U
    : never
  : never;

type BrandingLeakOnPublicConfig = Extract<PublicConfigRootKey, ForbiddenRootBrandingKey>;
type BrandingLeakOnKioskAlias = Extract<
  KioskPublicConfigV1 extends infer U ? (U extends object ? keyof U : never) : never,
  ForbiddenRootBrandingKey
>;

const _salesPointHasNoBrandingFields: AssertNever<BrandingLeakOnPublicConfig> = true;
const _kioskAliasHasNoBrandingFields: AssertNever<BrandingLeakOnKioskAlias> = true;

describe('kiosk public-config zero branding fields contract', () => {
  it('type-level: SalesPointPublicConfigV1 / KioskPublicConfigV1 omit directory branding keys', () => {
    expect(_salesPointHasNoBrandingFields).toBe(true);
    expect(_kioskAliasHasNoBrandingFields).toBe(true);
  });

  it('source: salesPointPublicConfig root types do not declare branding directory fields', () => {
    const source = readFileSync(join(__dirname, '../salesPointPublicConfig.ts'), 'utf8');

    // Strip nested donation project interface (allowed to keep donation imageUrl).
    const withoutDonationProject = source.replace(
      /export interface SalesPointPublicDonationProject \{[\s\S]*?\n\}/,
      ''
    );

    for (const key of FORBIDDEN_ROOT_BRANDING_KEYS) {
      expect(withoutDonationProject).not.toMatch(
        new RegExp(`readonly\\s+${key}\\s*[?:]`)
      );
    }

    // Explicitly allow donation project imageUrl (product media, not tenant branding).
    expect(source).toMatch(
      /export interface SalesPointPublicDonationProject \{[\s\S]*readonly imageUrl/
    );
  });

  it('source: kioskPublicConfig only re-exports sales-point types (no local branding fields)', () => {
    const source = readFileSync(join(__dirname, '../../kiosk/kioskPublicConfig.ts'), 'utf8');
    expect(source).toMatch(/from '\.\.\/sales-point\/salesPointPublicConfig\.js'/);
    for (const key of FORBIDDEN_ROOT_BRANDING_KEYS) {
      expect(source).not.toMatch(new RegExp(`readonly\\s+${key}\\s*[?:]`));
    }
  });
});
