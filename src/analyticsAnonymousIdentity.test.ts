import {
  ANALYTICS_ANONYMOUS_KEY_MAX_LENGTH,
  ANALYTICS_ANONYMOUS_KEY_MIN_LENGTH,
  analyticsAnonymousStorageKey,
  generateAnalyticsAnonymousKey,
  isValidAnalyticsAnonymousKey,
} from './analyticsAnonymousIdentity.js';

describe('analyticsAnonymousIdentity', () => {
  it('generateAnalyticsAnonymousKey returns UUID-shaped string', () => {
    const key = generateAnalyticsAnonymousKey();
    expect(key.length).toBeGreaterThanOrEqual(ANALYTICS_ANONYMOUS_KEY_MIN_LENGTH);
    expect(isValidAnalyticsAnonymousKey(key)).toBe(true);
  });

  it('isValidAnalyticsAnonymousKey accepts alphanumeric underscore hyphen', () => {
    expect(isValidAnalyticsAnonymousKey('abcd1234')).toBe(true);
    expect(isValidAnalyticsAnonymousKey('a-b_c12345678')).toBe(true);
  });

  it('isValidAnalyticsAnonymousKey rejects short, long, and invalid charset', () => {
    expect(isValidAnalyticsAnonymousKey('short')).toBe(false);
    expect(isValidAnalyticsAnonymousKey('a'.repeat(ANALYTICS_ANONYMOUS_KEY_MAX_LENGTH + 1))).toBe(
      false,
    );
    expect(isValidAnalyticsAnonymousKey('has space inside')).toBe(false);
    expect(isValidAnalyticsAnonymousKey('email@user.com')).toBe(false);
  });

  it('analyticsAnonymousStorageKey is tenant-scoped', () => {
    expect(analyticsAnonymousStorageKey('acme')).toBe('analytics:anonymous:acme');
  });
});
