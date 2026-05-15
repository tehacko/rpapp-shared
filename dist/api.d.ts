/**
 * Shared API Utilities
 *
 * API endpoints and HTTP client for communicating with backend
 * Supports multi-tenant routing and authentication headers
 */
export declare const API_ENDPOINTS: {
    readonly PRODUCTS: "/api/products";
    readonly PRODUCT_CLICK: "/api/products/:id/click";
    readonly PRODUCT_LOOKUP_BARCODE: "/api/products/lookup-barcode";
    readonly PAYMENT_CREATE_QR: "/api/payments/create-qr";
    readonly PAYMENT_CHECK_STATUS: "/api/payments/check-status/:paymentId";
    readonly PAYMENT_COMPLETE: "/api/payments/complete";
    readonly PAYMENT_CANCEL: "/api/payments/cancel";
    readonly PAYMENT_START_MONITORING: "/api/payments/start-monitoring";
    readonly PAYMENT_STOP_MONITORING: "/api/payments/stop-monitoring";
    readonly PAYMENT_GATEWAY_CREATE: "/api/payments/create-gateway";
    readonly PAYMENT_GATEWAY_STATUS: "/api/payments/gateway-status/:paymentId";
    readonly PAYMENT_GATEWAY_CANCEL: "/api/payments/gateway-cancel";
    readonly PAYMENT_GATEWAY_METHODS: "/api/payments/gateway-methods";
    readonly PAYMENT_BANK_TRANSFER_WEBHOOK: "/api/payments/bank-transfer-webhook";
    readonly PAYMENT_TEST_BANK_TRANSFER_CHECK: "/api/payments/test-bank-transfer-check";
    /** Authenticated kiosk fallback for post-kiosk handoff token (Phase 5). */
    readonly PAYMENT_POST_KIOSK_HANDOFF: "/api/payments/post-kiosk-handoff/:paymentId";
    readonly CONSENT_ANALYTICS: "/api/consents/analytics";
    readonly CONSENT_MARKETING: "/api/consents/marketing";
    /**
     * @deprecated Cutover R1 — use tenant-scoped
     * `/api/{tenant}/v1/analytics/events` instead. Kept for backward
     * compatibility with any stale imports; kiosk/customer PWAs must not
     * call this global path.
     */
    readonly ANALYTICS_EVENTS: "/api/analytics/events";
    readonly ADMIN_LOGIN: "/api/admin/login";
    readonly ADMIN_PRODUCTS: "/api/admin/products";
    readonly ADMIN_PRODUCTS_INVENTORY: "/api/admin/products/inventory/:kioskId";
    readonly ADMIN_PRODUCT_INVENTORY: "/api/admin/products/:id/inventory";
    readonly ADMIN_PRODUCT_INVENTORY_UPDATE: "/api/admin/products/:productId/inventory/:kioskId";
    readonly ADMIN_PRODUCT_KIOSK_VISIBILITY: "/api/admin/products/:productId/kiosk/:kioskId";
    readonly ADMIN_KIOSKS: "/api/admin/kiosks";
    readonly ADMIN_KIOSK_DETAILS: "/api/admin/kiosks/:id";
    readonly ADMIN_LOGS: "/api/admin/logs";
    readonly ADMIN_CATEGORIES: "/api/v1/admin/categories";
    readonly HEALTH: "/health";
    readonly HEALTH_PAYMENT_PROVIDERS: "/health/payment-providers";
    readonly HEALTH_PAYMENT_PROVIDERS_CHECK_BANK_TRANSFER: "/health/payment-providers/check-bank-transfer";
    readonly CHECK_TRANSACTIONS: "/api/check-new-transactions";
    readonly EVENTS: "/events/:kioskId";
};
/**
 * Typed HTTP client for API communication
 * Features:
 * - Multi-tenant support (automatic path injection)
 * - Kiosk secret authentication
 * - Type-safe requests and responses
 * - URL validation before requests
 */
export declare class APIClient {
    private baseUrl;
    private kioskSecret?;
    private tenantCode?;
    private kioskId?;
    constructor(baseUrl: string, kioskSecret?: string, tenantCode?: string, kioskId?: number);
    private injectTenantIntoEndpoint;
    private request;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data?: unknown): Promise<T>;
    put<T>(endpoint: string, data?: unknown): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
/**
 * Factory function to create API client
 * @param baseUrl - Optional API base URL (defaults to localhost:3015)
 * @param kioskSecret - Optional kiosk authentication secret
 * @param tenantCode - Optional tenant code for multi-tenant routing
 * @param kioskId - Optional kiosk id (sent as `X-Kiosk-Id` when set; pair with secret for post-kiosk handoff fallback)
 */
export declare const createAPIClient: (baseUrl?: string, kioskSecret?: string, tenantCode?: string, kioskId?: number) => APIClient;
//# sourceMappingURL=api.d.ts.map