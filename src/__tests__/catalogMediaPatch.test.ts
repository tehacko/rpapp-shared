import { patchCatalogProductMedia } from '../catalogMediaPatch.js';
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
  imageUrl: '/api/acme/v1/products/1/image?size=thumb',
  thumbnailUrl: '/api/acme/v1/products/1/image?size=thumb',
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
      thumbnailUrl: '/api/acme/v1/products/1/image?variantId=11&size=thumb',
      focalPointX: 0.4,
      focalPointY: 0.6,
      cropZoom: 1.2,
    },
  ],
};

describe('patchCatalogProductMedia', () => {
  it('patches product-level focal fields without changing URLs', () => {
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
