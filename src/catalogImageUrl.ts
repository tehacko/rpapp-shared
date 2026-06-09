/**
 * Catalog product images are often signed absolute API URLs (e.g. http://localhost:3015/api/...).
 * Customer/kiosk PWAs proxy `/api` on the same origin in dev — rewrite to pathname so `<img>`
 * and fetch stay same-origin (CSP + CORP safe).
 */

const LEGACY_KIOSK_IMAGE_PATH = /^\/api\/products\/(\d+)\/image$/;

export interface CatalogImageUrlOptions {
  /** Required to upgrade legacy kiosk URLs `/api/products/{id}/image` → `/api/{tenant}/v1/products/{id}/image`. */
  readonly tenantCode?: string | null;
}

function rewriteLegacyKioskImagePath(
  pathname: string,
  search: string,
  tenantCode?: string | null,
): string {
  if (!tenantCode) {
    return `${pathname}${search}`;
  }
  const match = pathname.match(LEGACY_KIOSK_IMAGE_PATH);
  if (!match) {
    return `${pathname}${search}`;
  }
  const productId = match[1];
  return `/api/${tenantCode}/v1/products/${productId}/image${search}`;
}

export function toSameOriginCatalogImageUrl(
  url: string | null | undefined,
  options?: CatalogImageUrlOptions,
): string | null {
  if (!url || url.trim().length === 0) {
    return null;
  }
  const trimmed = url.trim();
  const tenantCode = options?.tenantCode ?? null;

  if (trimmed.startsWith('/api/')) {
    const queryIndex = trimmed.indexOf('?');
    const pathname = queryIndex >= 0 ? trimmed.slice(0, queryIndex) : trimmed;
    const search = queryIndex >= 0 ? trimmed.slice(queryIndex) : '';
    return rewriteLegacyKioskImagePath(pathname, search, tenantCode);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/api/')) {
      return rewriteLegacyKioskImagePath(parsed.pathname, parsed.search, tenantCode);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function resolveCatalogDisplayImageUrl(
  thumbnailUrl: string | null | undefined,
  imageUrl: string | null | undefined,
  options?: CatalogImageUrlOptions,
): string | null {
  return toSameOriginCatalogImageUrl(thumbnailUrl ?? imageUrl, options);
}
