import type { CatalogImageFocal, KioskProduct } from './types.js';

/**
 * IMG-014 metadata-only SSE patch. Clients may rewrite existing signed
 * `imageUrl` / `thumbnailUrl` query strings with a cache-bust param (`v`) —
 * never invent or replace signed URL paths from the broadcast (no imageUrl in payload).
 *
 * Contract: HMAC verify ignores `v` (not in canonical payload); stream query
 * schemas must allow optional `v` so patched URLs still validate.
 *
 * Bust key preference: `catalogSequence` → `primaryImageId` → `updatedAt`.
 * When SSE is fully unavailable, customer/kiosk fall back to ~30s catalog poll;
 * this patch path does not run until the next successful poll/refetch.
 */
export interface CatalogProductMediaPatch extends CatalogImageFocal {
  productId: number;
  variantId?: number | null;
  primaryImageId?: number | null;
  /** Product.galleryVersion from save broadcast — preferred cache-bust key. */
  catalogSequence?: number;
  updatedAt?: string;
}

const CACHE_BUST_QUERY_PARAM = 'v';

export function resolveCatalogMediaCacheBustKey(
  patch: Pick<CatalogProductMediaPatch, 'catalogSequence' | 'primaryImageId' | 'updatedAt'>
): string | null {
  if (typeof patch.catalogSequence === 'number' && Number.isFinite(patch.catalogSequence)) {
    return String(patch.catalogSequence);
  }
  if (typeof patch.primaryImageId === 'number' && Number.isFinite(patch.primaryImageId)) {
    return `i${patch.primaryImageId}`;
  }
  if (typeof patch.updatedAt === 'string' && patch.updatedAt.trim().length > 0) {
    return patch.updatedAt.trim();
  }
  return null;
}

/**
 * Append or replace client-only `v` on an existing catalog image URL.
 * Does not touch `sig` / `exp` / `imageId` (HMAC stays valid — verify ignores `v`;
 * server stream schema must accept optional `v`).
 */
export function applyCatalogMediaUrlCacheBust(
  url: string | null | undefined,
  bustKey: string
): string | null | undefined {
  if (url == null) {
    return url;
  }
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return url;
  }

  try {
    const absolute = /^https?:\/\//i.test(trimmed);
    const parsed = absolute ? new URL(trimmed) : new URL(trimmed, 'http://catalog.local');
    parsed.searchParams.set(CACHE_BUST_QUERY_PARAM, bustKey);
    if (absolute) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const hashIndex = trimmed.indexOf('#');
    const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
    const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
    const qIndex = withoutHash.indexOf('?');
    const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
    const params = new URLSearchParams(qIndex >= 0 ? withoutHash.slice(qIndex + 1) : '');
    params.set(CACHE_BUST_QUERY_PARAM, bustKey);
    const query = params.toString();
    return `${path}?${query}${hash}`;
  }
}

function applyUrlBustToProduct(
  product: KioskProduct,
  bustKey: string
): Pick<KioskProduct, 'imageUrl' | 'thumbnailUrl'> {
  return {
    imageUrl: applyCatalogMediaUrlCacheBust(product.imageUrl, bustKey) ?? product.imageUrl,
    thumbnailUrl:
      applyCatalogMediaUrlCacheBust(product.thumbnailUrl, bustKey) ?? product.thumbnailUrl,
  };
}

export function patchCatalogProductMedia(
  products: readonly KioskProduct[],
  patch: CatalogProductMediaPatch
): KioskProduct[] {
  const bustKey = resolveCatalogMediaCacheBustKey(patch);

  return products.map((product) => {
    if (product.id !== patch.productId) {
      return product;
    }

    if (patch.variantId === undefined || patch.variantId === null) {
      const urlPatch = bustKey ? applyUrlBustToProduct(product, bustKey) : {};
      return {
        ...product,
        ...urlPatch,
        focalPointX: patch.focalPointX ?? null,
        focalPointY: patch.focalPointY ?? null,
        cropZoom: patch.cropZoom ?? null,
      };
    }

    const variants = product.variants?.map((variant) => {
      if (variant.id !== patch.variantId) {
        return variant;
      }

      const thumb =
        bustKey != null
          ? (applyCatalogMediaUrlCacheBust(variant.thumbnailUrl, bustKey) ?? variant.thumbnailUrl)
          : variant.thumbnailUrl;
      const image =
        bustKey != null
          ? (applyCatalogMediaUrlCacheBust(variant.imageUrl, bustKey) ?? variant.imageUrl)
          : variant.imageUrl;

      return {
        ...variant,
        thumbnailUrl: thumb,
        ...(image !== undefined ? { imageUrl: image } : {}),
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
