/**
 * Catalog product images are often signed absolute API URLs (e.g. http://localhost:3015/api/...).
 * Customer/kiosk PWAs proxy `/api` on the same origin in dev — rewrite to pathname so `<img>`
 * and fetch stay same-origin (CSP + CORP safe).
 */
export function toSameOriginCatalogImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim().length === 0) {
    return null;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('/api/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/api/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function resolveCatalogDisplayImageUrl(
  thumbnailUrl: string | null | undefined,
  imageUrl: string | null | undefined,
): string | null {
  return toSameOriginCatalogImageUrl(thumbnailUrl ?? imageUrl);
}
