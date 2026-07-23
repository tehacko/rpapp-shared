import {
  readRequestId,
  setClientCorrelationId,
} from './logging/index.js';
import { setSentryCorrelationId } from './sentry/initSentry.js';

/**
 * Shared API Utilities
 * 
 * API endpoints and HTTP client for communicating with backend
 * Supports multi-tenant routing and authentication headers
 */

/**
 * Bank transfer webhook contract (H7 — manual / Postman testing):
 * - Header `x-bank-transfer-webhook-secret` — shared secret (required when webhooks enabled)
 * - Header `x-webhook-timestamp` — Unix epoch seconds (required; default max skew 900s)
 * - Body `providerEventId` — required provider event id (dedupe key; duplicate → HTTP 409)
 * - Body `paymentId`, `amount` — required; `bankTransactionId` optional (defaults to providerEventId)
 */
export const BANK_TRANSFER_WEBHOOK_HEADERS = {
  SECRET: 'x-bank-transfer-webhook-secret',
  TIMESTAMP: 'x-webhook-timestamp',
} as const;

/**
 * BAR-PR-00b — salesPointId / kioskId alias on kiosk-facing POST bodies:
 * `POST /api/products/lookup-barcode` and `POST /api/v1/kiosk-auth/card-lookup`
 * accept either field as a positive integer JSON number or digit-only string.
 * Validators normalize to canonical `salesPointId: number` before handlers run.
 * See `up-backend/docs/BARCODE/api-contracts.md`.
 */

// ===== API Endpoints =====

export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/products',
  PRODUCT_CLICK: '/api/products/:id/click',
  /** Body: `{ barcode, salesPointId? | kioskId? }` — alias normalized to `salesPointId`. */
  PRODUCT_LOOKUP_BARCODE: '/api/products/lookup-barcode',
  /** Body: `{ cardPayload, salesPointId? | kioskId? }` — alias normalized to `salesPointId`. */
  KIOSK_AUTH_CARD_LOOKUP: '/api/v1/kiosk-auth/card-lookup',

  // Payment endpoints
  PAYMENT_CREATE_QR: '/api/payments/create-qr',
  PAYMENT_CHECK_STATUS: '/api/payments/check-status/:paymentId',
  PAYMENT_COMPLETE: '/api/payments/complete',
  PAYMENT_CANCEL: '/api/payments/cancel',
  PAYMENT_START_MONITORING: '/api/payments/start-monitoring',
  PAYMENT_STOP_MONITORING: '/api/payments/stop-monitoring',
  
  // Redirect gateway payment endpoints
  PAYMENT_GATEWAY_CREATE: '/api/payments/create-gateway',
  PAYMENT_GATEWAY_STATUS: '/api/payments/gateway-status/:paymentId',
  PAYMENT_GATEWAY_CANCEL: '/api/payments/gateway-cancel',
  PAYMENT_GATEWAY_METHODS: '/api/payments/gateway-methods',
  PAYMENT_TERMINAL_CONNECTION_TOKEN: '/api/payments/terminal/connection-token',
  PAYMENT_CREATE_TERMINAL: '/api/payments/terminal/create-terminal',
  PAYMENT_TERMINAL_CANCEL: '/api/payments/terminal/cancel',
  /** Public (tenant-scoped): POST /api/{tenantCode}/webhooks/payment/stripe */
  PAYMENT_STRIPE_WEBHOOK_PUBLIC: '/api/{tenantCode}/webhooks/payment/stripe',
  PAYMENT_BANK_TRANSFER_WEBHOOK: '/api/payments/bank-transfer-webhook',
  PAYMENT_TEST_BANK_TRANSFER_CHECK: '/api/payments/test-bank-transfer-check',
  /** Authenticated kiosk fallback for post-kiosk handoff token (Phase 5). */
  PAYMENT_POST_KIOSK_HANDOFF: '/api/payments/post-kiosk-handoff/:paymentId',
  /** Authenticated kiosk recovery handoff for failed/timeout payments. */
  PAYMENT_POST_KIOSK_RECOVERY_HANDOFF: '/api/payments/post-kiosk-recovery-handoff/:paymentId',
  /** Enterprise outbox release gate (bucket C — backend no-ops when obligations disabled). */
  PAYMENT_RELEASE_GATE: '/api/payments/release-gate/:paymentId',
  PAYMENT_RECEIPT_PRINT_COMPLETE: '/api/payments/:paymentId/obligations/receipt-print/complete',
  PAYMENT_RECEIPT_PRINT_FAILED: '/api/payments/:paymentId/obligations/receipt-print/failed',

  // Admin endpoints
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_FORGOT_PASSWORD: '/api/admin/forgot-password',
  ADMIN_RESET_PASSWORD: '/api/admin/reset-password',
  DEV_FORGOT_PASSWORD: '/api/dev/forgot-password',
  DEV_RESET_PASSWORD: '/api/dev/reset-password',
  ADMIN_LOGOUT: '/api/admin/logout',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_PRODUCTS_INVENTORY: '/api/admin/products/inventory/:salesPointId',
  ADMIN_PRODUCT_INVENTORY: '/api/admin/products/:id/inventory',
  ADMIN_PRODUCT_INVENTORY_UPDATE: '/api/admin/products/:productId/inventory/:salesPointId',
  ADMIN_PRODUCT_SALES_POINT_VISIBILITY: '/api/admin/products/:productId/sales-point/:salesPointId',
  ADMIN_SALES_POINTS: '/api/v1/admin/sales-points',
  ADMIN_SALES_POINT_DETAILS: '/api/v1/admin/sales-points/:id',
  /** @deprecated Use ADMIN_SALES_POINTS */
  ADMIN_KIOSKS: '/api/v1/admin/sales-points',
  /** @deprecated Use ADMIN_SALES_POINT_DETAILS */
  ADMIN_KIOSK_DETAILS: '/api/v1/admin/sales-points/:id',
  ADMIN_LOGS: '/api/admin/logs',
  ADMIN_CATEGORIES: '/api/v1/admin/categories',

  // System endpoints
  HEALTH: '/health',
  HEALTH_PAYMENT_PROVIDERS: '/health/payment-providers',
  HEALTH_PAYMENT_PROVIDERS_CHECK_BANK_TRANSFER: '/health/payment-providers/check-bank-transfer',
  CHECK_TRANSACTIONS: '/api/check-new-transactions',
  EVENTS: '/events/:salesPointId'
} as const;

// ===== API Client =====

/**
 * Typed HTTP client for API communication
 * Features:
 * - Multi-tenant support (automatic path injection)
 * - Kiosk secret authentication
 * - Type-safe requests and responses
 * - URL validation before requests
 */
export class APIClient {
  private baseUrl: string;
  private kioskSecret?: string;
  private tenantCode?: string;
  private salesPointId?: number;

  constructor(
    baseUrl: string,
    kioskSecret?: string,
    tenantCode?: string,
    salesPointId?: number
  ) {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('APIClient: baseUrl is required and must be a string');
    }
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.kioskSecret = kioskSecret;
    this.tenantCode = tenantCode;
    this.salesPointId = salesPointId;
  }

  private injectTenantIntoEndpoint(endpoint: string): string {
    if (!this.tenantCode) {
      return endpoint;
    }
    if (endpoint.startsWith('/api/')) {
      // Handle query strings - split endpoint and query, inject tenant into path only
      const [pathPart, query] = endpoint.split('?');
      const path = pathPart ?? endpoint;
      const tenantPath = `/api/${this.tenantCode}${path.slice(4)}`;
      return query ? `${tenantPath}?${query}` : tenantPath;
    }
    return endpoint;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error(`APIClient: endpoint is required and must be a string, got: ${typeof endpoint}`);
    }

    // Inject tenant into endpoint path if tenant is configured
    const tenantEndpoint = this.injectTenantIntoEndpoint(endpoint);
    const url = `${this.baseUrl}${tenantEndpoint}`;

    // Validate URL before making request
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`APIClient: Invalid URL constructed: ${url}. baseUrl: ${this.baseUrl}, endpoint: ${endpoint}`);
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add sales point device headers when available
    if (this.kioskSecret) {
      headers['X-Sales-Point-Secret'] = this.kioskSecret;
    }
    if (
      typeof this.salesPointId === 'number' &&
      Number.isInteger(this.salesPointId) &&
      this.salesPointId > 0
    ) {
      headers['X-Sales-Point-Id'] = String(this.salesPointId);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const retryAfter = response.headers.get('Retry-After');
      let code: string | undefined;
      let message = response.statusText;
      let requestId: string | undefined = readRequestId(response);
      try {
        const parsed = (await response.json()) as
          | { error?: string; message?: string; code?: string; requestId?: string }
          | undefined;
        message = parsed?.error ?? parsed?.message ?? message;
        code = parsed?.code;
        if (requestId === undefined && typeof parsed?.requestId === 'string') {
          requestId = parsed.requestId;
        }
      } catch {
        // keep statusText
      }
      if (requestId !== undefined) {
        setClientCorrelationId(requestId);
        setSentryCorrelationId(requestId);
      }
      const err = new Error(`HTTP ${response.status}: ${message}`) as Error & {
        statusCode?: number;
        code?: string;
        retryAfterSeconds?: number;
        requestId?: string;
      };
      err.statusCode = response.status;
      err.code = code;
      if (requestId !== undefined) {
        err.requestId = requestId;
      }
      if (retryAfter) {
        const sec = Number(retryAfter);
        if (Number.isFinite(sec) && sec > 0) {
          err.retryAfterSeconds = sec;
        }
      }
      throw err;
    }

    const okId = readRequestId(response);
    if (okId !== undefined) {
      setClientCorrelationId(okId);
      setSentryCorrelationId(okId);
    }

    return response.json();
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * GET with conditional caching — returns 304 without parsing a body (G-12 catalog poll).
   */
  async getConditional<T>(
    endpoint: string,
    ifNoneMatch?: string,
  ): Promise<{ status: 200 | 304; data?: T; etag?: string | null }> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error(`APIClient: endpoint is required and must be a string, got: ${typeof endpoint}`);
    }
    const tenantEndpoint = this.injectTenantIntoEndpoint(endpoint);
    const url = `${this.baseUrl}${tenantEndpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (ifNoneMatch) {
      headers['If-None-Match'] = ifNoneMatch;
    }
    if (this.kioskSecret) {
      headers['X-Sales-Point-Secret'] = this.kioskSecret;
    }
    if (
      typeof this.salesPointId === 'number' &&
      Number.isInteger(this.salesPointId) &&
      this.salesPointId > 0
    ) {
      headers['X-Sales-Point-Id'] = String(this.salesPointId);
    }
    const response = await fetch(url, { method: 'GET', headers });
    const etag = response.headers.get('etag');
    const conditionalId = readRequestId(response);
    if (conditionalId !== undefined) {
      setClientCorrelationId(conditionalId);
      setSentryCorrelationId(conditionalId);
    }
    if (response.status === 304) {
      return { status: 304, etag };
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = (await response.json()) as T;
    return { status: 200, data, etag };
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Factory function to create API client
 * @param baseUrl - Optional API base URL (defaults to localhost:3015)
 * @param kioskSecret - Optional kiosk authentication secret
 * @param tenantCode - Optional tenant code for multi-tenant routing
 * @param salesPointId - Optional sales point id (sent as `X-Sales-Point-Id` when set; pair with secret for device auth)
 */
export const createAPIClient = (
  baseUrl?: string,
  kioskSecret?: string,
  tenantCode?: string,
  salesPointId?: number
): APIClient => {
  // Fallback to default if not provided
  const url = baseUrl || 'http://localhost:3015';

  return new APIClient(url, kioskSecret, tenantCode, salesPointId);
};
