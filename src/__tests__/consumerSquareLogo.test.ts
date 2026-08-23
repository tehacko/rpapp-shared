import { describe, expect, it } from '@jest/globals';
import {
  normalizeConsumerPublicTenantRow,
  resolveConsumerSquareLogoUrl,
} from '../branding/consumerSquareLogo.js';

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
  it('maps logoUrl and ignores wordmarkUrl on wire', () => {
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
    });
  });

  it('returns null for invalid rows', () => {
    expect(normalizeConsumerPublicTenantRow(null)).toBeNull();
    expect(normalizeConsumerPublicTenantRow({ tenantId: 'x', code: 'a', name: 'b' })).toBeNull();
  });
});
