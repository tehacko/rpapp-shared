/**
 * Branding stream URLs are HMAC-signed with a fresh `sig` + `exp` on every list mint.
 * Soft-refresh / focus refetch must not treat that as a new asset — remounting `<img>`
 * causes visible logo flicker on org pickers and login brand chrome.
 */

const EPHEMERAL_QUERY_KEYS = new Set(['sig', 'exp']);

function trimOrNull(url: string | null | undefined): string | null {
  if (typeof url !== 'string') {
    return null;
  }
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Stable identity for a signed branding (or catalog) media URL — path + durable query
 * params (`galleryVersion`, `tenantId`, …), excluding `sig` / `exp`.
 */
export function brandingSignedMediaIdentity(
  url: string | null | undefined,
): string | null {
  const trimmed = trimOrNull(url);
  if (trimmed === null) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, 'http://branding.local');
    const durable = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!EPHEMERAL_QUERY_KEYS.has(key)) {
        durable.append(key, value);
      }
    });
    durable.sort();
    const query = durable.toString();
    return query.length > 0 ? `${parsed.pathname}?${query}` : parsed.pathname;
  } catch {
    return trimmed;
  }
}

/**
 * When soft-refresh returns a newly signed URL for the same asset, keep the prior URL
 * so browsers keep the decoded image (no blank remount). Prefer `next` when identity differs
 * or there was no prior.
 */
export function preferStableBrandingMediaUrl(
  previous: string | null | undefined,
  next: string | null | undefined,
): string | null {
  const prev = trimOrNull(previous);
  const nxt = trimOrNull(next);
  if (nxt === null) {
    return null;
  }
  if (prev === null) {
    return nxt;
  }
  const prevId = brandingSignedMediaIdentity(prev);
  const nextId = brandingSignedMediaIdentity(nxt);
  if (prevId !== null && prevId === nextId) {
    return prev;
  }
  return nxt;
}
