// Shared types across all packages

// Enums matching backend Prisma schema
export enum TransactionStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT'
}

export enum ReceiptType {
  PLAIN = 'PLAIN',
  INVOICE = 'INVOICE',
  PROFORMA = 'PROFORMA'
}

// Base Product interface (global product data)
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

// Kiosk-specific product data (what customers see)
export interface KioskProduct extends Product {
  quantityInStock: number;
  kioskClickedOn: number;
  kioskNumberOfPurchases: number;
}

// Database model interfaces matching Prisma schema
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
  active?: boolean; // Visibility status for specific kiosk (from KioskInventory)
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

// WebSocket message type
export type WebSocketMessage = {
  type: string;
  kioskId?: number;
  timestamp?: string;
  [key: string]: any;
};

export type ScreenType = 'products' | 'payment' | 'confirmation' | 'admin-login' | 'admin-dashboard';

// API Request/Response types
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
  idempotencyKey?: string; // Optional client-provided key for duplicate prevention
}

export interface CreateMultiQRPaymentResponseData {
  paymentId: string;
  qrCodeData: string;
  amount: number;
  itemsCount: number;
  customerEmail: string;
  receiptEmailStatus?: 'sent' | 'pending' | 'failed' | 'none'; // Status of receipt email (only in idempotent responses)
}

export interface CreateMultiQRPaymentResponse {
  success: boolean;
  data: CreateMultiQRPaymentResponseData;
  message?: string; // Optional message (e.g., "QR payment already exists (idempotent)")
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
  monitoringStartTime?: number; // Optional: Timestamp (milliseconds) when monitoring started (for backward compatibility)
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
