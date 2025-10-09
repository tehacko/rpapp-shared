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
    readonly PAYMENT_THEPAY_CREATE: "/api/payments/create-thepay";
    readonly PAYMENT_THEPAY_STATUS: "/api/payments/thepay-status/:paymentId";
    readonly PAYMENT_THEPAY_CANCEL: "/api/payments/thepay-cancel";
    readonly PAYMENT_THEPAY_METHODS: "/api/payments/thepay-methods";
    readonly ADMIN_LOGIN: "/admin/login";
    readonly ADMIN_PRODUCTS: "/admin/products";
    readonly ADMIN_PRODUCTS_INVENTORY: "/admin/products/inventory/:kioskId";
    readonly ADMIN_PRODUCT_INVENTORY: "/admin/products/:id/inventory";
    readonly ADMIN_PRODUCT_INVENTORY_UPDATE: "/admin/products/:productId/inventory/:kioskId";
    readonly ADMIN_PRODUCT_KIOSK_VISIBILITY: "/admin/products/:productId/kiosk/:kioskId";
    readonly ADMIN_KIOSKS: "/admin/kiosks";
    readonly ADMIN_KIOSK_DETAILS: "/admin/kiosks/:id";
    readonly ADMIN_LOGS: "/admin/logs";
    readonly HEALTH: "/health";
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
