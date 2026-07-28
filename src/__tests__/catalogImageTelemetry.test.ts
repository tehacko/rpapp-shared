import {
  classifyCatalogImageUrl,
  hashCatalogImagePath,
} from '../catalogImageTelemetry.js';

describe('catalogImageTelemetry', () => {
  it('classifies signed API URLs', () => {
    expect(
      classifyCatalogImageUrl('/api/acme/v1/products/1/image?sig=abc'),
    ).toBe('signed_api');
  });

  it('classifies branding tenant logo paths as signed_api', () => {
    expect(
      classifyCatalogImageUrl('/api/acme/v1/tenants/1/logo?sig=abc&exp=1'),
    ).toBe('signed_api');
    expect(classifyCatalogImageUrl('/api/v1/tenants/1/logo/thumbnail')).toBe(
      'signed_api',
    );
    expect(
      classifyCatalogImageUrl(
        'http://localhost:3015/api/acme/v1/tenants/9/logo?sig=x',
      ),
    ).toBe('signed_api');
  });

  it('classifies branding sales-point image paths as signed_api', () => {
    expect(
      classifyCatalogImageUrl('/api/acme/v1/sales-points/2/image?sig=abc'),
    ).toBe('signed_api');
  });

  it('classifies legacy paths', () => {
    expect(classifyCatalogImageUrl('/api/products/5/image')).toBe('legacy_path');
  });

  it('hashes path without query', () => {
    expect(hashCatalogImagePath('/api/acme/v1/products/1/image?sig=secret')).toBe(
      '/api/acme/v1/products/1/image',
    );
  });
});
