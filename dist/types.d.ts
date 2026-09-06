/**
 * Shared Types
 *
 * Database models, API contracts, and type definitions
 * used across kiosk, admin, and backend applications.
 */
import type { LocalizedNameMap, LocalizedTextMap } from './labels/localizedNameMap.js';
export declare enum TransactionStatus {
    INITIATED = "INITIATED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    AWAITING_CASH_CONFIRMATION = "AWAITING_CASH_CONFIRMATION",
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
export declare enum TenantStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DEACTIVATED = "DEACTIVATED",
    DELETED = "DELETED"
}
export declare enum KioskStatus {
    ACTIVE = "ACTIVE",
    DEACTIVATED = "DEACTIVATED",
    DELETED = "DELETED"
}
export declare enum ProductStatus {
    ACTIVE = "ACTIVE",
    DEACTIVATED = "DEACTIVATED",
    DELETED = "DELETED"
}
export declare enum LegalBasis {
    LEGAL_OBLIGATION = "LEGAL_OBLIGATION",
    CONTRACT = "CONTRACT",
    LEGITIMATE_INTEREST = "LEGITIMATE_INTEREST",
    CONSENT = "CONSENT"
}
export declare enum RetentionClass {
    STATUTORY = "STATUTORY",
    GOVERNANCE = "GOVERNANCE",
    RUNTIME = "RUNTIME"
}
export interface OffboardingDecisionDTO {
    tenantId: number;
    tenantCode: string;
    legalBasis: LegalBasis;
    retentionClass: RetentionClass;
    exportAcknowledged: boolean;
    legalHoldApplied: boolean;
    decidedAt: string;
}
export interface Product {
    id: number;
    name: string;
    /** Optional per-locale display-name overrides; omit/null = use `name`. */
    nameLocales?: LocalizedNameMap | null;
    price: number;
    description: string;
    /**
     * Customer PWA path segment for product detail:
     * `/{tenantCode}/{storeCode}/{slug}` — omit/null when API has not projected it yet.
     */
    slug?: string | null;
    image?: string;
    imageUrl?: string;
    thumbnailUrl?: string | null;
    galleryVersion?: number;
    clickedOn: number;
    qrCodesGenerated: number;
    numberOfPurchases: number;
    createdAt: string;
    updatedAt: string;
}
export interface CatalogImageFocal {
    focalPointX?: number | null;
    focalPointY?: number | null;
    cropZoom?: number | null;
}
/** Slim variant row for kiosk/customer catalog UIs and public variant list API. */
export interface CatalogVariantSummary extends CatalogImageFocal {
    id: number;
    name: string;
    /**
     * Customer PWA path segment (flat Spec Lock):
     * `/{tenantCode}/{storeCode}/{slug}` — omit/null when API has not projected it yet.
     */
    slug?: string | null;
    price: number;
    quantityInStock: number;
    active: boolean;
    /** Spec Lock G4 — preferred Detail URL when product has multiple variants. */
    isDominant?: boolean;
    barcode?: string;
    thumbnailUrl: string;
    imageUrl?: string;
}
export interface KioskProduct extends Product, CatalogImageFocal {
    quantityInStock: number;
    kioskClickedOn: number;
    kioskNumberOfPurchases: number;
    categoryId?: number | null;
    thumbnailUrl?: string | null;
    variants?: CatalogVariantSummary[];
    variantCount?: number;
}
export type SalesPointOperationalMode = 'PRODUCTS' | 'DONATION';
/**
 * Canonical product collection mode (Transaction / payment / admin / customer).
 * Alias `SalesPointProductCollectionMode` kept for existing sales-point call sites.
 */
export type ProductCollectionMode = 'PAY_AT_KIOSK' | 'PREPAY_COLLECT_LATER';
export type SalesPointProductCollectionMode = ProductCollectionMode;
export type SalesPointInteractionMode = 'CUSTOMER_FACING' | 'STAFF_OPERATED';
/** Stable publish-gate codes for Obchody directory eligibility (Wave 6). */
export type CustomerDirectoryPublishGateCode = 'STRUCTURAL' | 'STOCK' | 'PAY_READY' | 'PRODUCT' | 'SALES_POINT' | 'BANK_METHOD' | 'METHOD_READINESS';
/** REQUIRED per-SP Obchody eligibility on admin list/detail responses. */
export interface CustomerDirectorySalesPointEligibility {
    readonly salesPointId: number;
    readonly listable: boolean;
    readonly listedAt: string | null;
    readonly hasPublishablePay: boolean;
    readonly failedPublishGates: readonly CustomerDirectoryPublishGateCode[];
    readonly stickyOos: boolean;
    readonly delistRisk: boolean;
}
export interface SalesPoint {
    id: number;
    code?: string | null;
    name: string;
    /** Optional per-locale display-name overrides; null when none stored. */
    nameLocales?: LocalizedNameMap | null;
    location: string;
    description?: string;
    /** Optional per-locale description overrides; null when none stored. */
    descriptionLocales?: LocalizedTextMap | null;
    /** WGS84 latitude; null when unset. */
    lat?: number | null;
    /** WGS84 longitude; null when unset. */
    lng?: number | null;
    isActive: boolean;
    defaultVatRate?: number | null;
    lastHeartbeat?: string | null;
    salesPointOperationalMode: SalesPointOperationalMode;
    salesPointInteractionMode?: SalesPointInteractionMode;
    defaultProductCollectionMode?: SalesPointProductCollectionMode;
    productBankAccountId?: string | null;
    donationBankAccountId?: string | null;
    cardPresentLocationId?: string | null;
    /** Side-table SalesPointImage present (admin list enrichment). */
    hasImage?: boolean;
    /** REQUIRED Obchody eligibility on admin SP list/detail responses. */
    directoryEligibility: CustomerDirectorySalesPointEligibility;
    /** Optional signed/auth stream hint — not a Prisma column. */
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
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
    bankTransferTransactionId?: string;
    lastBankCheckAt?: string;
    bankCheckCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface CartItem {
    product: KioskProduct;
    quantity: number;
    variantId?: number | null;
    variant?: {
        id: number;
        name?: string;
    };
}
export interface Cart {
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}
/**
 * Post-kiosk QR handoff v3 - shared classifier types (Phase 6 contract train).
 *
 * Mirrors the backend domain enums in
 * `up-backend/src/domain/entities/Transaction.ts`. Kept as string literal
 * unions in the shared package so consumers (kiosk + customer) do not
 * depend on the backend's domain layer.
 */
export type TxPurposeType = 'PRODUCT_PURCHASE' | 'DONATION';
export type TxFlowType = 'POST_KIOSK' | 'PHONE_FIRST';
export type TxEntryChannel = 'KIOSK_QR' | 'DIRECT_LINK' | 'RESOLVER' | 'SHARED_LINK' | 'PHONE_FIRST_PWA' | 'POST_KIOSK_PWA';
export interface PaymentData {
    productId: number;
    productName: string;
    amount: number;
    customerEmail: string;
    qrCode: string;
    paymentId: string;
    status?: TransactionStatus;
    /**
     * Post-kiosk QR handoff token (raw, opaque), included when the backend
     * issued a handoff for the completed transaction. See
     * `up-backend/docs/CUSTOMER/CUSTOMER_PWA.md`.
     */
    postKioskHandoffToken?: string;
    /**
     * Tenant customer PWA base URL when a post-kiosk handoff was issued —
     * used by the kiosk to build the success QR without calling the fallback.
     */
    postKioskCustomerFrontendUrl?: string;
}
export interface MultiProductPaymentData {
    items: CartItem[];
    totalAmount: number;
    customerEmail: string;
    qrCode: string;
    paymentId: string;
    status?: TransactionStatus;
    /** See `PaymentData.postKioskHandoffToken`. */
    postKioskHandoffToken?: string;
    /** See `PaymentData.postKioskCustomerFrontendUrl`. */
    postKioskCustomerFrontendUrl?: string;
}
export interface AdminProduct extends Product {
    quantityInStock?: number;
    active?: boolean;
    isActive?: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface KioskRuntimeStatus {
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
export type ScreenType = 'products' | 'payment' | 'confirmation' | 'pickup-ticket' | 'admin-login' | 'admin-dashboard' | 'donation-amount' | 'donation-project' | 'donation-method' | 'donation-pay-qr' | 'donation-pay-gateway' | 'donation-misconfig';
export interface CreateQRPaymentRequest {
    items: Array<{
        productId: number;
        variantId?: number | null;
        quantity: number;
    }>;
    totalAmount?: number;
    customerEmail: string;
    kioskId: number;
    idempotencyKey?: string;
    /**
     * Phase 6 contract train: optional classifier fields used by post-kiosk
     * handoff and customer-flow analytics. Defaults applied in the backend
     * (purposeType=`PRODUCT_PURCHASE`).
     */
    purposeType?: TxPurposeType;
    flowType?: TxFlowType;
    entryChannel?: TxEntryChannel;
    donationProjectCode?: string;
}
export interface CreateQRPaymentResponseData {
    paymentId: string;
    qrCodeData?: string;
    qrAccess?: 'allowed' | 'denied';
    productCollectionMode?: ProductCollectionMode;
    amount: number;
    itemsCount: number;
    customerEmail?: string;
    receiptEmailStatus?: 'sent' | 'pending' | 'failed' | 'none';
    transactionStatus?: TransactionStatus;
}
export interface CreateQRPaymentResponse {
    success: boolean;
    data: CreateQRPaymentResponseData;
    message?: string;
}
export interface PaymentStatusResponse {
    paymentId: string;
    status: TransactionStatus;
    amount: number;
    customerEmail: string;
    requestedAt: string;
    completedAt?: string;
    qrVisible?: boolean;
}
export interface StartMonitoringRequest {
    paymentId: string;
}
export interface StartMonitoringResponse {
    paymentId: string;
    status: string;
    monitoringStartTime?: number;
}
export interface GatewayCreateRequest {
    items: Array<{
        productId: number;
        variantId?: number | null;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    customerEmail: string;
    kioskId: number;
    idempotencyKey?: string;
    /** See `CreateQRPaymentRequest` for semantics. */
    purposeType?: TxPurposeType;
    flowType?: TxFlowType;
    entryChannel?: TxEntryChannel;
    donationProjectCode?: string;
    /** UI language (BCP-47 / ISO 639-1) for gateway checkout localization. */
    language?: string;
}
/**
 * Post-kiosk QR handoff v3 - realtime payload contract (Phase 6).
 *
 * Shape of the `payment_completed` event broadcast over the kiosk
 * realtime channel after a successful first-transition-to-COMPLETED.
 * `postKioskHandoffToken` is present only when the feature is enabled
 * AND `AUTH_CUSTOMER_APP_BASE_URL` is configured.
 */
export interface PaymentCompletedRealtimePayload {
    paymentId: string;
    kioskId?: number;
    amount?: number;
    customerEmail?: string;
    postKioskHandoffToken?: string;
    postKioskCustomerFrontendUrl?: string;
}
/**
 * Post-kiosk QR handoff v3 - kiosk fallback response (Phase 5).
 *
 * Authenticated kiosk pull payload returned by
 * `GET /api/payments/post-kiosk-handoff/:paymentId`.
 */
export interface PostKioskHandoffFallbackResponse {
    paymentId: string;
    postKioskHandoffToken: string;
    expiresAt: string;
    customerFrontendUrl: string;
}
/** Kiosk recovery handoff for failed/timeout payments. */
export interface PostKioskRecoveryHandoffResponse {
    paymentId: string;
    token: string;
    expiresAt: string;
    customerFrontendUrl: string;
}
export interface GatewayCreateResponse {
    paymentId: string;
    gatewayPaymentId: string;
    paymentUrl: string;
    amount: number;
    customerEmail: string;
    kioskId: number;
}
export interface GatewayStatusResponse {
    paymentId: string;
    externalPaymentUid: string;
    status: string;
    gatewayState: string;
    amount?: number;
    customerEmail?: string;
}
export interface GatewayMethodDescriptor {
    name: string;
    enabled: boolean;
    readinessBlocked?: boolean;
    readinessCode?: string;
}
export interface GatewayMethodsResponse {
    methods: GatewayMethodDescriptor[];
    readinessBlocked?: boolean;
    readinessCode?: string;
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