export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
    imageUrl?: string;
    quantityInStock: number;
    clickedOn: number;
    numberOfPurchases: number;
}
export interface CartItem {
    product: Product;
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
}
export interface MultiProductPaymentData {
    items: CartItem[];
    totalAmount: number;
    customerEmail: string;
    qrCode: string;
    paymentId: string;
}
export interface AdminProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    imageUrl?: string;
    clickedOn: number;
    qrCodesGenerated: number;
    numberOfPurchases: number;
    createdAt: string;
    updatedAt: string;
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
export interface WebSocketMessage {
    type: string;
    updateType?: string;
    data?: any;
    kioskId?: number;
    timestamp?: string;
}
export type ScreenType = 'products' | 'payment' | 'confirmation' | 'admin-login' | 'admin-dashboard';
