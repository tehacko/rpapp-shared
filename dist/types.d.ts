export declare enum TransactionStatus {
    INITIATED = "INITIATED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    TIMEOUT = "TIMEOUT"
}
export declare enum ReceiptType {
    PLAIN = "PLAIN",
    INVOICE = "INVOICE",
    PROFORMA = "PROFORMA"
}
export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
    imageUrl?: string;
    clickedOn: number;
    qrCodesGenerated: number;
    numberOfPurchases: number;
    createdAt: string;
    updatedAt: string;
}
export interface KioskProduct extends Product {
    quantityInStock: number;
    kioskClickedOn: number;
    kioskNumberOfPurchases: number;
}
export interface Kiosk {
    id: number;
    name: string;
    location: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Customer {
    id: number;
    email: string;
    name?: string;
    firstContactAt: string;
    purchasesRequested: number;
    purchasesCompleted: number;
    totalSpent: number;
}
export interface KioskInventory {
    id: number;
    kioskId: number;
    productId: number;
    quantityInStock: number;
    active: boolean;
    clickedOn: number;
    qrCodesGenerated: number;
    numberOfPurchases: number;
    lastRestocked?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Transaction {
    id: number;
    kioskId: number;
    customerId: number;
    productId?: number;
    requestedAt: string;
    completedAt?: string;
    status: TransactionStatus;
    amount: number;
    paymentId?: string;
    qrCodeData?: string;
    variableSymbol?: string;
    receiptType: ReceiptType;
    fioTransactionId?: string;
    lastFioCheckAt?: string;
    fioCheckCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface CartItem {
    product: KioskProduct;
    quantity: number;
}
export interface Cart {
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}
export interface PaymentData {
    productId: number;
    productName: string;
    amount: number;
    customerEmail: string;
    qrCode: string;
    paymentId: string;
    status?: TransactionStatus;
}
export interface MultiProductPaymentData {
    items: CartItem[];
    totalAmount: number;
    customerEmail: string;
    qrCode: string;
    paymentId: string;
    status?: TransactionStatus;
}
export interface AdminProduct extends Product {
    quantityInStock?: number;
    active?: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface KioskStatus {
    id: number;
    name: string;
    location: string;
    online: boolean;
    lastSeen: Date;
    salesToday: number;
}
export type WebSocketMessage = {
    type: string;
    kioskId?: number;
    timestamp?: string;
    [key: string]: any;
};
export type ScreenType = 'products' | 'payment' | 'confirmation' | 'admin-login' | 'admin-dashboard';
export interface CreateQRPaymentRequest {
    productId: number;
    customerEmail: string;
    kioskId: number;
}
export interface CreateQRPaymentResponse {
    paymentId: string;
    qrCodeData: string;
    amount: number;
    customerEmail: string;
    variableSymbol: string;
}
export interface CreateMultiQRPaymentRequest {
    items: Array<{
        productId: number;
        quantity: number;
    }>;
    totalAmount: number;
    customerEmail: string;
    kioskId: number;
    idempotencyKey?: string;
}
export interface CreateMultiQRPaymentResponseData {
    paymentId: string;
    qrCodeData: string;
    amount: number;
    itemsCount: number;
    customerEmail: string;
    receiptEmailStatus?: 'sent' | 'pending' | 'failed' | 'none';
}
export interface CreateMultiQRPaymentResponse {
    success: boolean;
    data: CreateMultiQRPaymentResponseData;
    message?: string;
}
export interface PaymentStatusResponse {
    paymentId: string;
    status: TransactionStatus;
    amount: number;
    customerEmail: string;
    requestedAt: string;
    completedAt?: string;
}
export interface StartMonitoringRequest {
    paymentId: string;
}
export interface StartMonitoringResponse {
    paymentId: string;
    status: string;
    monitoringStartTime?: number;
}
export interface ThePayCreateRequest {
    items: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    customerEmail: string;
    kioskId: number;
}
export interface ThePayCreateResponse {
    paymentId: string;
    thepayPaymentId: string;
    paymentUrl: string;
    amount: number;
    customerEmail: string;
    kioskId: number;
}
export interface ThePayStatusResponse {
    paymentId: string;
    status: string;
    amount: number;
    customerEmail: string;
}
export interface ThePayMethodsResponse {
    methods: Array<{
        name: string;
        enabled: boolean;
    }>;
}
export interface InventoryUpdateRequest {
    quantityInStock: number;
}
export interface VisibilityToggleRequest {
    visible: boolean;
}
export interface ProductClickRequest {
    kioskId: number;
}
//# sourceMappingURL=types.d.ts.map