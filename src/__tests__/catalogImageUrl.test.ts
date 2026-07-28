import {
  isBrandingCatalogImagePath,
  resolveBrandingDisplayImageUrl,
  toSameOriginCatalogImageUrl,
} from '../catalogImageUrl.js';

describe('toSameOriginCatalogImageUrl', () => {
  it('preserves imageId query param on rewrite', () => {
    const url =
      'http://localhost:3015/api/acme/v1/products/42/image?size=thumb&imageId=7&exp=123&sig=abc';
    expect(toSameOriginCatalogImageUrl(url)).toBe(
      '/api/acme/v1/products/42/image?size=thumb&imageId=7&exp=123&sig=abc'
    );
  });

  it('rewrites legacy kiosk path with tenantCode', () => {
    expect(
      toSameOriginCatalogImageUrl('/api/products/5/image?imageId=3', { tenantCode: 'acme' })
    ).toBe('/api/acme/v1/products/5/image?imageId=3');
  });

  it('returns null for empty input', () => {
    expect(toSameOriginCatalogImageUrl(null)).toBeNull();
    expect(toSameOriginCatalogImageUrl('   ')).toBeNull();
  });

  it('rewrites absolute branding tenant logo URLs to same-origin paths', () => {
    const logo =
      'http://localhost:3015/api/acme/v1/tenants/9/logo?sig=abc&exp=1&tenantId=9&galleryVersion=2&audience=customer&resourceKind=tenant_logo&entityId=9&variant=full';
    expect(toSameOriginCatalogImageUrl(logo)).toBe(
      '/api/acme/v1/tenants/9/logo?sig=abc&exp=1&tenantId=9&galleryVersion=2&audience=customer&resourceKind=tenant_logo&entityId=9&variant=full'
    );
    const thumb =
      'https://api.example.com/api/acme/v1/tenants/9/logo/thumbnail?sig=t';
    expect(toSameOriginCatalogImageUrl(thumb)).toBe(
      '/api/acme/v1/tenants/9/logo/thumbnail?sig=t'
    );
  });

  it('rewrites absolute branding sales-point image URLs to same-origin paths', () => {
    expect(
      toSameOriginCatalogImageUrl(
        'http://localhost:3015/api/acme/v1/sales-points/3/image?sig=abc'
      )
    ).toBe('/api/acme/v1/sales-points/3/image?sig=abc');
    expect(
      toSameOriginCatalogImageUrl(
        'http://localhost:3015/api/v1/sales-points/3/image/thumbnail?sig=t'
      )
    ).toBe('/api/v1/sales-points/3/image/thumbnail?sig=t');
  });
});

describe('resolveBrandingDisplayImageUrl', () => {
  it('prefers thumbnailUrl and rewrites absolute API hosts', () => {
    expect(
      resolveBrandingDisplayImageUrl(
        'http://localhost:3015/api/acme/v1/tenants/1/logo/thumbnail?sig=t',
        'http://localhost:3015/api/acme/v1/tenants/1/logo?sig=f'
      )
    ).toBe('/api/acme/v1/tenants/1/logo/thumbnail?sig=t');
  });

  it('recognizes branding catalog image path patterns', () => {
    expect(isBrandingCatalogImagePath('/api/acme/v1/tenants/1/logo')).toBe(true);
    expect(isBrandingCatalogImagePath('/api/v1/tenants/1/logo/thumbnail')).toBe(true);
    expect(isBrandingCatalogImagePath('/api/acme/v1/sales-points/2/image')).toBe(true);
    expect(isBrandingCatalogImagePath('/api/v1/sales-points/2/image/thumbnail')).toBe(true);
    expect(isBrandingCatalogImagePath('/api/v1/tenants')).toBe(false);
    expect(isBrandingCatalogImagePath('/api/v1/sales-points')).toBe(false);
    expect(isBrandingCatalogImagePath('/api/acme/v1/products/1/image')).toBe(false);
  });
});
