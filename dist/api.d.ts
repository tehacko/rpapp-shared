export declare const API_ENDPOINTS: {
    readonly PRODUCTS: "/api/products";
    readonly PRODUCT_CLICK: "/api/products/:id/click";
    readonly PAYMENT_CREATE_QR: "/api/payments/create-qr";
    readonly PAYMENT_CREATE_MULTI_QR: "/api/payments/create-multi-qr";
    readonly PAYMENT_CHECK_STATUS: "/api/payments/check-status/:paymentId";
    readonly PAYMENT_COMPLETE: "/api/payments/complete";
    readonly PAYMENT_COMPLETE_MULTI: "/api/payments/complete-multi";
    readonly PAYMENT_CANCEL: "/api/payments/cancel";
    readonly PAYMENT_START_MONITORING: "/api/payments/start-monitoring";
    readonly PAYMENT_STOP_MONITORING: "/api/payments/stop-monitoring";
    readonly PAYMENT_THEPAY_CREATE: "/api/payments/create-thepay";
    readonly PAYMENT_THEPAY_STATUS: "/api/payments/thepay-status/:paymentId";
    readonly PAYMENT_THEPAY_CANCEL: "/api/payments/thepay-cancel";
    readonly PAYMENT_THEPAY_METHODS: "/api/payments/thepay-methods";
    readonly ADMIN_LOGIN: "/api/admin/login";
    readonly ADMIN_PRODUCTS: "/api/admin/products";
    readonly ADMIN_PRODUCTS_INVENTORY: "/api/admin/products/inventory/:kioskId";
    readonly ADMIN_PRODUCT_INVENTORY: "/api/admin/products/:id/inventory";
    readonly ADMIN_PRODUCT_INVENTORY_UPDATE: "/api/admin/products/:productId/inventory/:kioskId";
    readonly ADMIN_PRODUCT_KIOSK_VISIBILITY: "/api/admin/products/:productId/kiosk/:kioskId";
    readonly ADMIN_KIOSKS: "/api/admin/kiosks";
    readonly ADMIN_KIOSK_DETAILS: "/api/admin/kiosks/:id";
    readonly ADMIN_LOGS: "/api/admin/logs";
    readonly HEALTH: "/health";
    readonly HEALTH_PAYMENT_PROVIDERS: "/health/payment-providers";
    readonly HEALTH_PAYMENT_PROVIDERS_CHECK_FIO: "/health/payment-providers/check-fio";
    readonly CHECK_TRANSACTIONS: "/api/check-new-transactions";
    readonly EVENTS: "/events/:kioskId";
};
export declare class APIClient {
    private baseUrl;
    private kioskSecret?;
    constructor(baseUrl: string, kioskSecret?: string);
    private request;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data?: any): Promise<T>;
    put<T>(endpoint: string, data?: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare const createAPIClient: (baseUrl?: string, kioskSecret?: string) => APIClient;
//# sourceMappingURL=api.d.ts.map