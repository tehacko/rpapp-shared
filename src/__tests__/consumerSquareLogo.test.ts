import { describe, expect, it } from '@jest/globals';
import {
  normalizeConsumerPublicTenantRow,
  resolveConsumerSquareLogoUrl,
} from '../branding/consumerSquareLogo.js';
import {
  DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
  DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT,
  DEFAULT_LOGO_CHIP_RIM_SETTINGS,
} from '../branding/logoChipRim.js';

describe('resolveConsumerSquareLogoUrl', () => {
  it('returns trimmed non-empty strings', () => {
    expect(resolveConsumerSquareLogoUrl(' https://api/logo/1 ')).toBe('https://api/logo/1');
  });

  it('returns null for empty, nullish, or non-string', () => {
    expect(resolveConsumerSquareLogoUrl(null)).toBeNull();
    expect(resolveConsumerSquareLogoUrl(undefined)).toBeNull();
    expect(resolveConsumerSquareLogoUrl('   ')).toBeNull();
    expect(resolveConsumerSquareLogoUrl(42)).toBeNull();
  });
});

describe('normalizeConsumerPublicTenantRow', () => {
  it('maps logoUrl and ignores wordmarkUrl on wire; fills rim defaults when absent', () => {
    expect(
      normalizeConsumerPublicTenantRow({
        tenantId: 1,
        code: 'acme',
        name: 'Acme',
        logoUrl: 'https://api/logo/1',
        wordmarkUrl: 'https://api/wm/1',
      }),
    ).toEqual({
      tenantId: 1,
      code: 'acme',
      name: 'Acme',
      logoUrl: 'https://api/logo/1',
      ...DEFAULT_LOGO_CHIP_RIM_SETTINGS,
    });
  });

  it('null logoUrl when applyToCustomerPwa off (BE sends null keys)', () => {
    expect(
      normalizeConsumerPublicTenantRow({
        tenantId: 2,
        code: 'beta',
        name: 'Beta',
        logoUrl: null,
        wordmarkUrl: null,
      }),
    ).toEqual({
      tenantId: 2,
      code: 'beta',
      name: 'Beta',
      logoUrl: null,
      ...DEFAULT_LOGO_CHIP_RIM_SETTINGS,
    });
  });

  it('preserves valid rim fields from wire', () => {
    expect(
      normalizeConsumerPublicTenantRow({
        tenantId: 3,
        code: 'gamma',
        name: 'Gamma',
        logoUrl: null,
        showLogoChipRimLight: true,
        showLogoChipRimDark: true,
        logoChipRimColorLight: '#112233',
        logoChipRimColorDark: '#aabbcc',
      }),
    ).toEqual({
      tenantId: 3,
      code: 'gamma',
      name: 'Gamma',
      logoUrl: null,
      showLogoChipRimLight: true,
      showLogoChipRimDark: true,
      logoChipRimColorLight: '#112233',
      logoChipRimColorDark: '#aabbcc',
    });
  });

  it('coerces invalid rim fields to defaults without stripping', () => {
    expect(
      normalizeConsumerPublicTenantRow({
        tenantId: 4,
        code: 'delta',
        name: 'Delta',
        logoUrl: null,
        showLogoChipRimLight: 'yes',
        showLogoChipRimDark: 1,
        logoChipRimColorLight: 'red',
        logoChipRimColorDark: '#fff',
      }),
    ).toEqual({
      tenantId: 4,
      code: 'delta',
      name: 'Delta',
      logoUrl: null,
      showLogoChipRimLight: false,
      showLogoChipRimDark: false,
      logoChipRimColorLight: DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT,
      logoChipRimColorDark: DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
    });
  });

  it('returns null for invalid rows', () => {
    expect(normalizeConsumerPublicTenantRow(null)).toBeNull();
    expect(normalizeConsumerPublicTenantRow({ tenantId: 'x', code: 'a', name: 'b' })).toBeNull();
  });
});
