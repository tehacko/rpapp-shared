import {
  applyCatalogMediaUrlCacheBust,
  patchCatalogProductMedia,
  resolveCatalogMediaCacheBustKey,
} from '../catalogMediaPatch.js';
import type { KioskProduct } from '../types.js';

const baseProduct: KioskProduct = {
  id: 1,
  name: 'Coffee',
  price: 100,
  description: '',
  clickedOn: 0,
  qrCodesGenerated: 0,
  numberOfPurchases: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  quantityInStock: 10,
  kioskClickedOn: 0,
  kioskNumberOfPurchases: 0,
  imageUrl: '/api/acme/v1/products/1/image?size=thumb&sig=abc&exp=1&imageId=7',
  thumbnailUrl: '/api/acme/v1/products/1/image?size=thumb&sig=abc&exp=1&imageId=7',
  categoryId: null,
  focalPointX: 0.5,
  focalPointY: 0.5,
  cropZoom: 1,
  variants: [
    {
      id: 11,
      name: 'Large',
      price: 120,
      quantityInStock: 5,
      active: true,
      thumbnailUrl: '/api/acme/v1/products/1/image?variantId=11&size=thumb&sig=x&exp=1',
      focalPointX: 0.4,
      focalPointY: 0.6,
      cropZoom: 1.2,
    },
  ],
};

describe('resolveCatalogMediaCacheBustKey', () => {
  it('prefers catalogSequence over primaryImageId and updatedAt', () => {
    expect(
      resolveCatalogMediaCacheBustKey({
        catalogSequence: 9,
        primaryImageId: 12,
        updatedAt: '2026-06-13T12:00:00.000Z',
      })
    ).toBe('9');
  });

  it('falls back to primaryImageId then updatedAt', () => {
    expect(resolveCatalogMediaCacheBustKey({ primaryImageId: 12 })).toBe('i12');
    expect(
      resolveCatalogMediaCacheBustKey({ updatedAt: '2026-06-13T12:00:00.000Z' })
    ).toBe('2026-06-13T12:00:00.000Z');
  });
});

describe('applyCatalogMediaUrlCacheBust', () => {
  it('sets or replaces v without dropping sig/imageId (IMG-014: HMAC ignores v; schema allows v)', () => {
    const next = applyCatalogMediaUrlCacheBust(
      '/api/acme/v1/products/1/image?sig=abc&exp=1&imageId=7',
      '3'
    );
    expect(next).toContain('sig=abc');
    expect(next).toContain('exp=1');
    expect(next).toContain('imageId=7');
    expect(next).toContain('v=3');

    const replaced = applyCatalogMediaUrlCacheBust(next, '4');
    expect(replaced).toContain('v=4');
    expect(replaced).not.toContain('v=3');
    expect(replaced).toContain('sig=abc');
  });
});

describe('patchCatalogProductMedia', () => {
  it('patches product-level focal fields without changing URLs when no bust key', () => {
    const result = patchCatalogProductMedia([baseProduct], {
      productId: 1,
      focalPointX: 0.2,
      focalPointY: 0.8,
      cropZoom: 1.5,
    });

    expect(result[0]?.focalPointX).toBe(0.2);
    expect(result[0]?.focalPointY).toBe(0.8);
    expect(result[0]?.cropZoom).toBe(1.5);
    expect(result[0]?.imageUrl).toBe(baseProduct.imageUrl);
    expect(result[0]?.thumbnailUrl).toBe(baseProduct.thumbnailUrl);
  });

  it('cache-busts imageUrl/thumbnailUrl when catalogSequence is present (G3)', () => {
    const result = patchCatalogProductMedia([baseProduct], {
      productId: 1,
      catalogSequence: 5,
      primaryImageId: 12,
      focalPointX: 0.2,
      focalPointY: 0.8,
      cropZoom: 1.5,
    });

    expect(result[0]?.focalPointX).toBe(0.2);
    expect(result[0]?.imageUrl).toContain('v=5');
    expect(result[0]?.thumbnailUrl).toContain('v=5');
    expect(result[0]?.imageUrl).toContain('sig=abc');
    expect(result[0]?.imageUrl).not.toBe(baseProduct.imageUrl);
  });

  it('cache-busts variant thumbnail when media update targets a variant', () => {
    const result = patchCatalogProductMedia([baseProduct], {
      productId: 1,
      variantId: 11,
      primaryImageId: 99,
      focalPointX: 0.1,
      focalPointY: 0.9,
      cropZoom: 2,
    });

    expect(result[0]?.variants?.[0]?.focalPointX).toBe(0.1);
    expect(result[0]?.variants?.[0]?.thumbnailUrl).toContain('v=i99');
    expect(result[0]?.imageUrl).toBe(baseProduct.imageUrl);
  });

  it('patches matching variant focal fields', () => {
    const result = patchCatalogProductMedia([baseProduct], {
      productId: 1,
      variantId: 11,
      focalPointX: 0.1,
      focalPointY: 0.9,
      cropZoom: 2,
    });

    expect(result[0]?.variants?.[0]?.focalPointX).toBe(0.1);
    expect(result[0]?.variants?.[0]?.focalPointY).toBe(0.9);
    expect(result[0]?.variants?.[0]?.cropZoom).toBe(2);
    expect(result[0]?.focalPointX).toBe(baseProduct.focalPointX);
  });

  it('leaves unrelated products unchanged', () => {
    const other: KioskProduct = { ...baseProduct, id: 2, name: 'Tea' };
    const result = patchCatalogProductMedia([baseProduct, other], {
      productId: 1,
      focalPointX: 0.3,
      focalPointY: 0.3,
    });

    expect(result[1]).toEqual(other);
  });
});
