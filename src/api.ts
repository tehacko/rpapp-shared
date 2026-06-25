/**
 * Shared API Utilities
 * 
 * API endpoints and HTTP client for communicating with backend
 * Supports multi-tenant routing and authentication headers
 */

// ===== API Endpoints =====

export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/products',
  PRODUCT_CLICK: '/api/products/:id/click',
  PRODUCT_LOOKUP_BARCODE: '/api/products/lookup-barcode',

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
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
