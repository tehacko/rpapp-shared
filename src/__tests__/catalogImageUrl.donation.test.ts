import {
  resolveDonationDisplayImageUrl,
  toSameOriginCatalogImageUrl,
} from '../catalogImageUrl.js';

describe('resolveDonationDisplayImageUrl', () => {
  it('rewrites legacy donation path with tenantCode', () => {
    expect(
      resolveDonationDisplayImageUrl(null, '/api/donation-projects/12/image?sig=abc', {
        tenantCode: 'acme',
      }),
    ).toBe('/api/acme/v1/donation-projects/12/image?sig=abc');
  });

  it('prefers thumbnailUrl over imageUrl', () => {
    expect(
      resolveDonationDisplayImageUrl(
        '/api/acme/v1/donation-projects/3/image/thumbnail?sig=t',
        '/api/acme/v1/donation-projects/3/image?sig=f',
        { tenantCode: 'acme' },
      ),
    ).toBe('/api/acme/v1/donation-projects/3/image/thumbnail?sig=t');
  });

  it('rewrites same-origin absolute API URL', () => {
    const url =
      'http://localhost:3015/api/acme/v1/donation-projects/7/image?sig=abc&exp=123';
    expect(resolveDonationDisplayImageUrl(null, url, { tenantCode: 'acme' })).toBe(
      '/api/acme/v1/donation-projects/7/image?sig=abc&exp=123',
    );
  });

  it('returns null for empty input', () => {
    expect(resolveDonationDisplayImageUrl(null, null)).toBeNull();
    expect(resolveDonationDisplayImageUrl(undefined, '   ')).toBeNull();
  });

  it('passes through external HTTPS URLs', () => {
    const external = 'https://cdn.example.com/donation-hero.jpg';
    expect(resolveDonationDisplayImageUrl(null, external)).toBe(external);
  });
});

describe('toSameOriginCatalogImageUrl (product parity unchanged)', () => {
  it('does not rewrite donation legacy paths in product mode', () => {
    expect(
      toSameOriginCatalogImageUrl('/api/donation-projects/5/image', { tenantCode: 'acme' }),
    ).toBe('/api/donation-projects/5/image');
  });
});
