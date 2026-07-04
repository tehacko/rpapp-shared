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

  it('classifies legacy paths', () => {
    expect(classifyCatalogImageUrl('/api/products/5/image')).toBe('legacy_path');
  });

  it('hashes path without query', () => {
    expect(hashCatalogImagePath('/api/acme/v1/products/1/image?sig=secret')).toBe(
      '/api/acme/v1/products/1/image',
    );
  });
});
