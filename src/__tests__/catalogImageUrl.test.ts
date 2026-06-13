import { toSameOriginCatalogImageUrl } from '../catalogImageUrl.js';

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
});
