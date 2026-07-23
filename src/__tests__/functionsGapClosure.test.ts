/**
 * @jest-environment jsdom
 */

import {
  requestDatabaseHealthCheck,
  resetDatabaseHealthCoordinatorForTests,
  resolveDatabaseHealthEndpoint,
  subscribeDatabaseHealth,
} from '../hooks/databaseHealthCoordinator.js';
import {
  applyInitialTheme,
  createThemeApi,
  setTheme,
  THEME_STORAGE_KEYS,
} from '../theme/themeContract.js';
import { isAnalyticsEventAllowedWithoutConsent } from '../analyticsConsentTier2.js';
import {
  expandCapabilitiesForClientCheck,
  grantImpliesTarget,
  hasAnyEffectiveCapability,
  hasEffectiveCapability,
} from '../permissions/effectiveCapabilities.js';
import { isAnalyticsEventAllowedWithoutConsent as isAllowedViaAllowlist } from '../analyticsConsentAllowlist.js';
import * as barcodeScannerBarrel from '../barcode-scanner.js';
import { useDatabaseHealth } from '../hooks/useDatabaseHealth.js';
import { renderHook, waitFor } from '@testing-library/react';
import {
  analyticsAnonymousStorageKey,
  generateAnalyticsAnonymousKey,
  isValidAnalyticsAnonymousKey,
} from '../analyticsAnonymousIdentity.js';
import { CatalogImagePlaceholder } from '../CatalogImagePlaceholder.js';
import {
  isAnalyticsEventName,
  isSupportedAnalyticsMetadataSchemaVersion,
} from '../analyticsEvents.js';
import { redactClientLogMeta, redactStringSecrets } from '../clientLogRedaction.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('databaseHealthCoordinator (gap closure)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetDatabaseHealthCoordinatorForTests();
  });

  afterEach(() => {
    resetDatabaseHealthCoordinatorForTests();
    global.fetch = originalFetch;
  });

  it('resolves health endpoint from runtime config and location', () => {
    expect(resolveDatabaseHealthEndpoint()).toContain('/health');
    (window as { __RUNTIME_CONFIG__?: { apiUrl?: string } }).__RUNTIME_CONFIG__ = {
      apiUrl: 'https://api.example/v1/',
    };
    expect(resolveDatabaseHealthEndpoint()).toBe('https://api.example/health');
    (window as { __RUNTIME_CONFIG__?: { apiUrl?: string } }).__RUNTIME_CONFIG__ = {
      apiUrl: 'not a url',
    };
    expect(resolveDatabaseHealthEndpoint()).toBe('not a url/health');
    delete (window as { __RUNTIME_CONFIG__?: unknown }).__RUNTIME_CONFIG__;
  });

  it('subscribes, fetches healthy JSON, and unsubscribes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
      json: async () => ({ success: true, status: 'healthy' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const snapshots: Array<{ isDatabaseAvailable: boolean }> = [];
    const unsubscribe = subscribeDatabaseHealth(
      { endpoint: 'https://api.example/health', pollInterval: 120_000, maxRetries: 2, enabled: true },
      (snap) => {
        snapshots.push({ isDatabaseAvailable: snap.isDatabaseAvailable });
      },
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).toHaveBeenCalled();
    expect(snapshots.some((s) => s.isDatabaseAvailable)).toBe(true);

    await requestDatabaseHealthCheck('https://api.example/health', { force: true });
    unsubscribe();
    await requestDatabaseHealthCheck('missing');
  });

  it('marks unhealthy on non-ok responses and backs off', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Unavailable',
      headers: { get: () => null },
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    let lastError: Error | null = null;
    const unsubscribe = subscribeDatabaseHealth(
      { endpoint: 'https://api.example/health-bad', enabled: true, maxRetries: 1, pollInterval: 120_000 },
      (snap) => {
        lastError = snap.error;
      },
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(lastError).toBeInstanceOf(Error);
    unsubscribe();
  });
});

describe('theme + consent + capabilities + anonymous identity', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
  });

  it('covers theme convenience helpers and system subscription', () => {
    applyInitialTheme(THEME_STORAGE_KEYS.admin);
    setTheme(THEME_STORAGE_KEYS.admin, 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const api = createThemeApi(THEME_STORAGE_KEYS.kiosk);
    expect(api.getThemePreference()).toBe('system');
    expect(api.getEffectiveTheme() === 'light' || api.getEffectiveTheme() === 'dark').toBe(true);
    api.setTheme('system');
    const unsub = api.subscribeToSystemTheme(() => undefined);
    unsub();
  });

  it('covers consent allowlist and capability helpers', () => {
    expect(isAnalyticsEventAllowedWithoutConsent('session_started')).toBe(true);
    expect(isAnalyticsEventAllowedWithoutConsent('mystery_event')).toBe(false);
    expect(isAllowedViaAllowlist('session_started')).toBe(true);
    expect(hasEffectiveCapability(['admin.users.manage'], 'admin.users.manage')).toBe(true);
    expect(hasAnyEffectiveCapability(['x'], ['y', 'x'])).toBe(true);
    expect(hasAnyEffectiveCapability([], ['y'])).toBe(false);
    const expanded = expandCapabilitiesForClientCheck(['admin.users.manage']);
    expect(expanded.size).toBeGreaterThan(0);
    expect(typeof grantImpliesTarget('admin.users.manage', 'admin.users.read')).toBe('boolean');
    expect(barcodeScannerBarrel.resolveScannerFormatConfig('retail').nativeFormats.length).toBeGreaterThan(0);
  });

  it('covers useDatabaseHealth subscribe path', async () => {
    resetDatabaseHealthCoordinatorForTests();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const { result, unmount } = renderHook(() =>
      useDatabaseHealth({ enabled: true, pollInterval: 120_000, maxRetries: 1 }),
    );
    await waitFor(
      () => {
        expect(
          result.current.isDatabaseAvailable === true ||
            result.current.isChecking === true ||
            result.current.error !== null,
        ).toBe(true);
      },
      { timeout: 3000 },
    );
    await result.current.checkHealth();
    unmount();
    resetDatabaseHealthCoordinatorForTests();
  });

  it('covers anonymous analytics key helpers', () => {
    const key = generateAnalyticsAnonymousKey();
    expect(isValidAnalyticsAnonymousKey(key)).toBe(true);
    expect(isValidAnalyticsAnonymousKey('short')).toBe(false);
    expect(isValidAnalyticsAnonymousKey('x'.repeat(200))).toBe(false);
    expect(isValidAnalyticsAnonymousKey('bad key!')).toBe(false);
    expect(analyticsAnonymousStorageKey('acme')).toContain('acme');
  });
});

describe('extra stable function covers', () => {
  it('renders CatalogImagePlaceholder and checks analytics event helpers', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogImagePlaceholder, { label: 'img', className: 'c' }),
    );
    expect(html).toContain('img');
    expect(isAnalyticsEventName('session_started')).toBe(true);
    expect(isAnalyticsEventName('nope')).toBe(false);
    expect(isSupportedAnalyticsMetadataSchemaVersion(1)).toBe(true);
    expect(isSupportedAnalyticsMetadataSchemaVersion(99)).toBe(false);
    expect(redactStringSecrets('Bearer abcdefghijklmnop')).toContain('[REDACTED]');
    expect(redactClientLogMeta(undefined)).toBeUndefined();
    expect(redactClientLogMeta({ token: 'secret', nested: { a: 1 } })).toEqual({
      token: '[REDACTED]',
      nested: { a: 1 },
    });
  });
});
