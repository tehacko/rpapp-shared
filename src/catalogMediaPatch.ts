import type { CatalogImageFocal, KioskProduct } from './types.js';

export interface CatalogProductMediaPatch extends CatalogImageFocal {
  productId: number;
  variantId?: number | null;
  primaryImageId?: number | null;
  updatedAt?: string;
}

export function patchCatalogProductMedia(
  products: readonly KioskProduct[],
  patch: CatalogProductMediaPatch
): KioskProduct[] {
  return products.map((product) => {
    if (product.id !== patch.productId) {
      return product;
    }

    if (patch.variantId === undefined || patch.variantId === null) {
      return {
        ...product,
        focalPointX: patch.focalPointX ?? null,
        focalPointY: patch.focalPointY ?? null,
        cropZoom: patch.cropZoom ?? null,
      };
    }

    const variants = product.variants?.map((variant) => {
      if (variant.id !== patch.variantId) {
        return variant;
      }

      return {
        ...variant,
        focalPointX: patch.focalPointX ?? null,
        focalPointY: patch.focalPointY ?? null,
        cropZoom: patch.cropZoom ?? null,
      };
    });

    return {
      ...product,
      variants,
    };
  });
}
