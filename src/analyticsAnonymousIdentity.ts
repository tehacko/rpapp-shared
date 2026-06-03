/**
 * PWA pseudonymous analytics identity — client-stable opaque keys (plan §Definitions).
 *
 * Keys MUST NOT be derived from IP, UA, or fingerprinting. Generation uses
 * crypto.randomUUID() only.
 */

export const ANALYTICS_ANONYMOUS_KEY_MIN_LENGTH = 8;
export const ANALYTICS_ANONYMOUS_KEY_MAX_LENGTH = 128;
export const ANALYTICS_ANONYMOUS_STORAGE_KEY_PREFIX = 'analytics:anonymous:';

const ANONYMOUS_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;

function uuidv4Fallback(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Generate a new opaque anonymous key (UUID v4). */
export function generateAnalyticsAnonymousKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return uuidv4Fallback();
}

/** Validate client-supplied anonymous key format (no PII-shaped values). */
export function isValidAnalyticsAnonymousKey(key: string): boolean {
  if (key.length < ANALYTICS_ANONYMOUS_KEY_MIN_LENGTH) {
    return false;
  }
  if (key.length > ANALYTICS_ANONYMOUS_KEY_MAX_LENGTH) {
    return false;
  }
  return ANONYMOUS_KEY_PATTERN.test(key);
}

export function analyticsAnonymousStorageKey(tenantCode: string): string {
  return `${ANALYTICS_ANONYMOUS_STORAGE_KEY_PREFIX}${tenantCode}`;
}
