import { getRetryAfterMs, isRateLimitError } from '../http/rateLimitError.js';
import { formatRateLimitMessage } from '../errors/formatRateLimitMessage.js';
import {
  AppError,
  AuthenticationError,
  DatabaseError,
  InventoryError,
  KioskError,
  NetworkError,
  NotFoundError,
  PaymentError,
  SalesPointError,
  ValidationError,
  formatError,
  getErrorMessage,
} from '../errors.js';
import { looksLikeGtin } from '../barcode/looksLikeGtin.js';
import { looksLikeCustomerCard } from '../barcode/looksLikeCustomerCard.js';
import { normalizeScanPayload } from '../barcode/normalizeScanPayload.js';
import { buildFailureRecoveryUrl } from '../customerFailureRecovery.js';
import { dotNotationToLabel, snakeCaseToLabel } from '../labels/localizedLabel.js';
import {
  buildMenuOpenedMetadata,
  buildProductSelectedMetadata,
  buildQrDisplayedMetadata,
  buildScreenMetadata,
} from '../analytics/metadataBuilders.js';
import { appendTurnstileToken, fetchTurnstileConfig } from '../auth/turnstileTypes.js';
import {
  getLogRepeatCount,
  resetLogRepeatCapForTests,
  shouldEmitLogRepeat,
} from '../logging/logRepeatCap.js';
import { reportClientError } from '../logging/reportClientError.js';
import {
  getClientCorrelationId,
  resetClientCorrelationIdForTests,
  setClientCorrelationId,
} from '../logging/correlationContext.js';
import { getAnalyticsEventLabel } from '../getAnalyticsEventLabel.js';
import { getAnalyticsEventDescription } from '../getAnalyticsEventDescription.js';
import { getAuditEventLabel } from '../getAuditEventLabel.js';
import { getAuditEventDescription } from '../getAuditEventDescription.js';
import {
  clearPromoActivatedRewardHandoff,
  promoActivatedRewardStorageKey,
  readPromoActivatedRewardHandoff,
  setPromoActivatedRewardHandoff,
} from '../promo/promoSessionHandoff.js';
import { selectBarcodeScannerEngine } from '../hooks/selectEngine.js';
import {
  parsePaymentRailsKioskFromCommerceConfig,
  parsePaymentRailsMobileFromCommerceConfig,
  resolveSalesPointEntitlementCeiling,
  resolveSalesPointInteractionMode,
} from '../sales-point/salesPointPublicConfig.js';
import { simpleEntitlementStateToAxes } from '../tenant-entitlements/types.js';

describe('rateLimitError', () => {
  it('detects statusCode and status 429 shapes', () => {
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError('x')).toBe(false);
    expect(isRateLimitError({ statusCode: 429 })).toBe(true);
    expect(isRateLimitError({ status: 429 })).toBe(true);
    expect(isRateLimitError({ status: 500 })).toBe(false);
  });

  it('parses retry-after from headers, reset, and numeric fields', () => {
    expect(getRetryAfterMs({ retryAfterMs: 1500 })).toBe(1500);
    expect(
      getRetryAfterMs({
        response: { headers: { 'retry-after': '2' } },
      }),
    ).toBe(2000);
    expect(
      getRetryAfterMs({
        response: { headers: new Headers({ 'retry-after': '3' }) },
      }),
    ).toBe(3000);
    expect(
      getRetryAfterMs({
        data: { headers: { 'retry-after': ['4'] } },
      }),
    ).toBe(4000);
    expect(
      getRetryAfterMs({
        response: { headers: { 'ratelimit-reset': '5' } },
      }),
    ).toBe(5000);
    expect(getRetryAfterMs({ response: { retryAfterMs: 900 } })).toBe(900);
    expect(getRetryAfterMs({ response: { retryAfter: 2 } })).toBe(2000);
    expect(getRetryAfterMs({})).toBe(60_000);
    expect(getRetryAfterMs({ response: { headers: { 'retry-after': 'nope' } } }, 100)).toBe(100);
  });

  it('formats rate limit message with clamped seconds', () => {
    const translate = jest.fn((_key: string, options?: Record<string, unknown>) =>
      `wait ${String(options?.seconds)}`,
    );
    expect(formatRateLimitMessage(translate, 0)).toBe('wait 1');
    expect(formatRateLimitMessage(translate, 12)).toBe('wait 12');
  });
});

describe('errors helpers', () => {
  it('constructs typed errors and formats responses', () => {
    expect(new ValidationError('bad', 'field').statusCode).toBe(400);
    expect(new NetworkError().code).toBe('NETWORK_ERROR');
    expect(new AuthenticationError().statusCode).toBe(401);
    expect(new NotFoundError('X').message).toContain('X');
    expect(new PaymentError().code).toBe('PAYMENT_ERROR');
    expect(new InventoryError().code).toBe('INVENTORY_ERROR');
    expect(new KioskError().code).toBe('KIOSK_ERROR');
    expect(new SalesPointError().name).toBe('SalesPointError');
    expect(new DatabaseError().statusCode).toBe(503);
    expect(new AppError('x', 'C', 418, false).isOperational).toBe(false);

    const formatted = formatError(new ValidationError('bad'), { field: 'a' });
    expect(formatted.success).toBe(false);
    expect(formatted.error.code).toBe('VALIDATION_ERROR');
    expect(formatted.error.details).toEqual({ field: 'a' });
    expect(formatError(new Error('plain')).error.code).toBe('UNKNOWN_ERROR');
  });

  it('maps getErrorMessage branches', () => {
    expect(getErrorMessage(new NetworkError())).toContain('připojením');
    expect(getErrorMessage(new ValidationError('field bad'))).toBe('field bad');
    expect(getErrorMessage(new AuthenticationError())).toContain('přihlašovací');
    expect(getErrorMessage(new NotFoundError('Item'))).toContain('Item');
    expect(getErrorMessage(new Error('Failed to fetch'))).toContain('připojením');
    expect(getErrorMessage(new Error('401 Unauthorized'))).toContain('přihlašovací');
    expect(getErrorMessage(new Error('other'))).toBe('other');
    expect(getErrorMessage(new Error(''))).toContain('Něco se pokazilo');
  });
});

describe('barcode + recovery + labels', () => {
  it('classifies GTIN and customer card payloads', () => {
    expect(looksLikeGtin('')).toBe(false);
    expect(looksLikeGtin('12345678')).toBe(true);
    expect(looksLikeGtin('1234-5678')).toBe(true);
    expect(looksLikeGtin('12ab')).toBe(false);
    expect(looksLikeCustomerCard('kc:abc')).toBe(true);
    expect(looksLikeCustomerCard('KC:abc')).toBe(true);
    expect(looksLikeCustomerCard('x')).toBe(false);
    expect(normalizeScanPayload('  abc  ')).toBe('abc');
  });

  it('builds failure recovery URLs', () => {
    expect(
      buildFailureRecoveryUrl({
        customerPwaBaseUrl: 'https://pwa.example/',
        tenantCode: 'acme',
        reason: 'EXPIRED',
      }),
    ).toBe('https://pwa.example/acme/post-kiosk-failure?reason=EXPIRED');
    expect(
      buildFailureRecoveryUrl({
        customerPwaBaseUrl: 'https://pwa.example',
        tenantCode: 'acme',
        reason: 'NETWORK_ERROR',
        token: 'tok',
      }),
    ).toContain('token=tok');
  });

  it('localizes label helpers', () => {
    expect(snakeCaseToLabel('foo_bar').en).toBe('Foo Bar');
    expect(dotNotationToLabel('a.b_c').en).toContain('—');
  });
});

describe('metadataBuilders + turnstile + logging helpers', () => {
  it('builds funnel metadata', () => {
    expect(buildScreenMetadata({})).toEqual({});
    expect(buildScreenMetadata({ screenName: 'home', previousScreenName: 'splash' })).toEqual({
      screen_name: 'home',
      previous_screen_name: 'splash',
    });
    expect(buildMenuOpenedMetadata({ productCount: 3 })).toEqual({ product_count: 3 });
    expect(
      buildProductSelectedMetadata({ productId: 9, interactionType: 'tap' }).interaction_type,
    ).toBe('tap');
    expect(
      buildQrDisplayedMetadata({ paymentId: 'p1', surface: 'kiosk' }),
    ).toEqual({ payment_id: 'p1', surface: 'kiosk' });
  });

  it('fetches turnstile config and appends tokens', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { enabled: true, siteKey: 'site' } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    await expect(fetchTurnstileConfig('https://api.example/')).resolves.toEqual({
      enabled: true,
      siteKey: 'site',
    });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(fetchTurnstileConfig('https://api.example')).rejects.toThrow(
      /Turnstile config request failed/
    );
    fetchMock.mockRejectedValueOnce(new Error('network'));
    await expect(fetchTurnstileConfig()).rejects.toThrow(/Turnstile config is unreachable/);

    expect(appendTurnstileToken({ a: 1 }, 'tok')).toEqual({ a: 1, turnstileToken: 'tok' });
    expect(appendTurnstileToken({ a: 1 }, null)).toEqual({ a: 1 });
  });

  it('caps log repeats and reports client errors', () => {
    resetLogRepeatCapForTests();
    expect(shouldEmitLogRepeat('k', 2)).toBe(true);
    expect(shouldEmitLogRepeat('k', 2)).toBe(true);
    expect(shouldEmitLogRepeat('k', 2)).toBe(false);
    expect(getLogRepeatCount('k')).toBe(3);
    expect(getLogRepeatCount('missing')).toBe(0);

    const capture = jest.fn();
    reportClientError(new Error('boom'), { capture });
    expect(capture).toHaveBeenCalled();
    reportClientError({ code: 'VALIDATION' }, { capture: jest.fn(), onlyUnexpected: true });
    reportClientError(new Error('x'));

    resetClientCorrelationIdForTests();
    setClientCorrelationId('cid');
    expect(getClientCorrelationId()).toBe('cid');
  });

  it('resolves analytics/audit label helpers', () => {
    expect(getAnalyticsEventLabel('not_an_event', 'en')).toBeTruthy();
    expect(getAnalyticsEventDescription('not_an_event', 'en')).toBe('');
    expect(getAuditEventLabel('not_a_code', 'en')).toBe('not_a_code');
    expect(getAuditEventDescription('not_a_code', 'en')).toBe('');
  });
});

describe('promo handoff + selectEngine + sales-point parsers', () => {
  it('builds promo storage key and clears sessionStorage when available', () => {
    expect(promoActivatedRewardStorageKey('t', 's')).toBe('promo:activatedReward:t:s');
    const store: Record<string, string> = { 'promo:activatedReward:t:s': '1' };
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    });
    setPromoActivatedRewardHandoff('t', 's', 'reward-9');
    expect(readPromoActivatedRewardHandoff('t', 's')).toBe('reward-9');
    clearPromoActivatedRewardHandoff('t', 's');
    expect(store['promo:activatedReward:t:s']).toBeUndefined();
  });

  it('selects zxing when BarcodeDetector missing', async () => {
    expect(await selectBarcodeScannerEngine('retail')).toBe('zxing');
  });

  it('parses payment rails and entitlement ceiling defaults', () => {
    expect(parsePaymentRailsKioskFromCommerceConfig(null)).toBeNull();
    expect(parsePaymentRailsKioskFromCommerceConfig({})).toBeNull();
    expect(
      parsePaymentRailsKioskFromCommerceConfig({
        paymentRailsKiosk: {
          cash: true,
          bankTransfer: false,
          cardPresent: true,
          gatewayInKioskPsp: false,
          gatewayHandoff: true,
        },
      }),
    ).toEqual({
      cash: true,
      bankTransfer: false,
      cardPresent: true,
      gatewayInKioskPsp: false,
      gatewayHandoff: true,
    });
    expect(
      parsePaymentRailsMobileFromCommerceConfig({
        paymentRailsMobile: { bankTransfer: true, gateway: false },
      }),
    ).toEqual({ bankTransfer: true, gateway: false });
    expect(resolveSalesPointInteractionMode({})).toBe('CUSTOMER_FACING');
    expect(resolveSalesPointInteractionMode({ salesPointInteractionMode: 'STAFF_OPERATED' })).toBe(
      'STAFF_OPERATED',
    );
    expect(resolveSalesPointEntitlementCeiling({}).revision).toBe(0);
    expect(
      resolveSalesPointEntitlementCeiling({
        entitlementCeiling: {
          revision: 2,
          surfaceKiosk: { entitled: true, allowReads: true, allowWrites: false },
          realtimeDeviceTransport: { entitled: true, allowReads: true, allowWrites: true },
          pickupMirrorMode: true,
        },
      }).revision,
    ).toBe(2);
  });

  it('maps simple entitlement states to axes', () => {
    expect(simpleEntitlementStateToAxes('on').mutationMode).toBe('ALLOW_WRITES');
    expect(simpleEntitlementStateToAxes('softOffVisible').mutationMode).toBe('READ_ONLY');
    expect(simpleEntitlementStateToAxes('softOffHidden').visibilityMode).toBe('HIDDEN');
    expect(simpleEntitlementStateToAxes('off').runtimeMode).toBe('DISABLED');
    expect(simpleEntitlementStateToAxes('hardOff').mutationMode).toBe('BLOCK_ALL');
  });
});
