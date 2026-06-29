/**
 * URL-first tenant code resolution for admin, kiosk, and customer PWAs.
 *
 * Tenant code is always the first path segment: `/{tenantCode}/...`
 * Never fall back to `default`, `test`, or the authenticated user's home tenant.
 */

/** First-segment path prefixes that are routes, not tenant codes. */
export const NON_TENANT_PATH_SEGMENTS = new Set(['admin', 'dev', 'api']);

export class TenantPathResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantPathResolutionError';
  }
}

export function getTenantCodeFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0) {
    return null;
  }
  const first = segments[0];
  if (!first) {
    return null;
  }
  if (NON_TENANT_PATH_SEGMENTS.has(first.toLowerCase())) {
    return null;
  }
  return first;
}

export function resolveBrowserPathname(pathname?: string): string {
  if (pathname !== undefined) {
    return pathname;
  }
  if (typeof window !== 'undefined' && typeof window.location?.pathname === 'string') {
    return window.location.pathname;
  }
  return '/';
}

export function requireTenantCodeFromPath(pathname?: string): string {
  const path = resolveBrowserPathname(pathname);
  const code = getTenantCodeFromPath(path);
  if (!code) {
    throw new TenantPathResolutionError(
      `Tenant code missing from URL path "${path}". Use /{tenantCode}/... (e.g. /railway-cafe/admin or /railway-cafe/1).`,
    );
  }
  return code;
}

/** React Router `:tenant` param — throws instead of falling back to default/test. */
export function coerceRouteTenantCode(tenantCode: string | undefined): string {
  const trimmed = tenantCode?.trim();
  if (!trimmed) {
    throw new TenantPathResolutionError('Missing :tenant route parameter');
  }
  return trimmed;
}

export function isDevDashboardApiEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('/api/dev/') || endpoint.startsWith('/api/v1/dev/');
}

export function withTenantInApiPath(endpoint: string, tenantCode: string): string {
  const trimmed = tenantCode.trim();
  if (!trimmed) {
    throw new TenantPathResolutionError('Tenant code is required for API path');
  }
  if (!endpoint.startsWith('/api/')) {
    return endpoint;
  }
  return `/api/${encodeURIComponent(trimmed)}${endpoint.slice(4)}`;
}
