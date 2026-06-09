import { resolveCatalogDisplayImageUrl, toSameOriginCatalogImageUrl } from '../catalogImageUrl.js';

describe('catalogImageUrl', () => {
  it('rewrites absolute API image URLs to same-origin paths', () => {
    expect(
      toSameOriginCatalogImageUrl(
        'http://localhost:3015/api/railway-cafe/v1/products/8/image?sig=abc',
      ),
    ).toBe('/api/railway-cafe/v1/products/8/image?sig=abc');
  });

  it('upgrades legacy kiosk image URLs when tenantCode is provided', () => {
    expect(
      toSameOriginCatalogImageUrl(
        'http://localhost:3015/api/products/3/image?sig=abc&exp=1&tenantId=2&kioskId=1&size=thumbnail',
        { tenantCode: 'railway-cafe' },
      ),
    ).toBe(
      '/api/railway-cafe/v1/products/3/image?sig=abc&exp=1&tenantId=2&kioskId=1&size=thumbnail',
    );
  });

  it('keeps external CDN URLs unchanged', () => {
    expect(toSameOriginCatalogImageUrl('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });

  it('prefers thumbnail over full image', () => {
    expect(
      resolveCatalogDisplayImageUrl(
        'http://localhost:3015/api/railway-cafe/v1/products/1/image?size=thumbnail',
        'http://localhost:3015/api/railway-cafe/v1/products/1/image',
      ),
    ).toBe('/api/railway-cafe/v1/products/1/image?size=thumbnail');
  });
});
