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
export declare const BANK_TRANSFER_WEBHOOK_HEADERS: {
    readonly SECRET: "x-bank-transfer-webhook-secret";
    readonly TIMESTAMP: "x-webhook-timestamp";
};
/**
 * BAR-PR-00b — salesPointId / kioskId alias on kiosk-facing POST bodies:
 * `POST /api/products/lookup-barcode` and `POST /api/v1/kiosk-auth/card-lookup`
 * accept either field as a positive integer JSON number or digit-only string.
 * Validators normalize to canonical `salesPointId: number` before handlers run.
 * See `up-backend/docs/BARCODE/api-contracts.md`.
 */
export declare const API_ENDPOINTS: {
    readonly PRODUCTS: "/api/products";
    readonly PRODUCT_CLICK: "/api/products/:id/click";
    /** Body: `{ barcode, salesPointId? | kioskId? }` — alias normalized to `salesPointId`. */
    readonly PRODUCT_LOOKUP_BARCODE: "/api/products/lookup-barcode";
    /** Body: `{ cardPayload, salesPointId? | kioskId? }` — alias normalized to `salesPointId`. */
    readonly KIOSK_AUTH_CARD_LOOKUP: "/api/v1/kiosk-auth/card-lookup";
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
    readonly PAYMENT_TERMINAL_CONNECTION_TOKEN: "/api/payments/terminal/connection-token";
    readonly PAYMENT_CREATE_TERMINAL: "/api/payments/terminal/create-terminal";
    readonly PAYMENT_TERMINAL_CANCEL: "/api/payments/terminal/cancel";
    /** Public (tenant-scoped): POST /api/{tenantCode}/webhooks/payment/stripe */
    readonly PAYMENT_STRIPE_WEBHOOK_PUBLIC: "/api/{tenantCode}/webhooks/payment/stripe";
    readonly PAYMENT_BANK_TRANSFER_WEBHOOK: "/api/payments/bank-transfer-webhook";
    readonly PAYMENT_TEST_BANK_TRANSFER_CHECK: "/api/payments/test-bank-transfer-check";
    /** Authenticated kiosk fallback for post-kiosk handoff token (Phase 5). */
    readonly PAYMENT_POST_KIOSK_HANDOFF: "/api/payments/post-kiosk-handoff/:paymentId";
    /** Authenticated kiosk recovery handoff for failed/timeout payments. */
    readonly PAYMENT_POST_KIOSK_RECOVERY_HANDOFF: "/api/payments/post-kiosk-recovery-handoff/:paymentId";
    /** Enterprise outbox release gate (bucket C — backend no-ops when obligations disabled). */
    readonly PAYMENT_RELEASE_GATE: "/api/payments/release-gate/:paymentId";
    readonly PAYMENT_RECEIPT_PRINT_COMPLETE: "/api/payments/:paymentId/obligations/receipt-print/complete";
    readonly PAYMENT_RECEIPT_PRINT_FAILED: "/api/payments/:paymentId/obligations/receipt-print/failed";
    readonly ADMIN_LOGIN: "/api/admin/login";
    readonly ADMIN_FORGOT_PASSWORD: "/api/admin/forgot-password";
    readonly ADMIN_RESET_PASSWORD: "/api/admin/reset-password";
    readonly DEV_FORGOT_PASSWORD: "/api/dev/forgot-password";
    readonly DEV_RESET_PASSWORD: "/api/dev/reset-password";
    readonly ADMIN_LOGOUT: "/api/admin/logout";
    readonly ADMIN_PRODUCTS: "/api/admin/products";
    readonly ADMIN_PRODUCTS_INVENTORY: "/api/admin/products/inventory/:salesPointId";
    readonly ADMIN_PRODUCT_INVENTORY: "/api/admin/products/:id/inventory";
    readonly ADMIN_PRODUCT_INVENTORY_UPDATE: "/api/admin/products/:productId/inventory/:salesPointId";
    readonly ADMIN_PRODUCT_SALES_POINT_VISIBILITY: "/api/admin/products/:productId/sales-point/:salesPointId";
    readonly ADMIN_SALES_POINTS: "/api/v1/admin/sales-points";
    readonly ADMIN_SALES_POINT_DETAILS: "/api/v1/admin/sales-points/:id";
    /** @deprecated Use ADMIN_SALES_POINTS */
    readonly ADMIN_KIOSKS: "/api/v1/admin/sales-points";
    /** @deprecated Use ADMIN_SALES_POINT_DETAILS */
    readonly ADMIN_KIOSK_DETAILS: "/api/v1/admin/sales-points/:id";
    readonly ADMIN_LOGS: "/api/admin/logs";
    readonly ADMIN_CATEGORIES: "/api/v1/admin/categories";
    readonly HEALTH: "/health";
    readonly HEALTH_PAYMENT_PROVIDERS: "/health/payment-providers";
    readonly HEALTH_PAYMENT_PROVIDERS_CHECK_BANK_TRANSFER: "/health/payment-providers/check-bank-transfer";
    readonly CHECK_TRANSACTIONS: "/api/check-new-transactions";
    readonly EVENTS: "/events/:salesPointId";
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
    private salesPointId?;
    constructor(baseUrl: string, kioskSecret?: string, tenantCode?: string, salesPointId?: number);
    private injectTenantIntoEndpoint;
    private request;
    get<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
    /**
     * GET with conditional caching — returns 304 without parsing a body (G-12 catalog poll).
     */
    getConditional<T>(endpoint: string, ifNoneMatch?: string): Promise<{
        status: 200 | 304;
        data?: T;
        etag?: string | null;
    }>;
    post<T>(endpoint: string, data?: unknown): Promise<T>;
    put<T>(endpoint: string, data?: unknown): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
/**
 * Factory function to create API client
 * @param baseUrl - Optional API base URL (defaults to localhost:3015)
 * @param kioskSecret - Optional kiosk authentication secret
 * @param tenantCode - Optional tenant code for multi-tenant routing
 * @param salesPointId - Optional sales point id (sent as `X-Sales-Point-Id` when set; pair with secret for device auth)
 */
export declare const createAPIClient: (baseUrl?: string, kioskSecret?: string, tenantCode?: string, salesPointId?: number) => APIClient;
//# sourceMappingURL=api.d.ts.map