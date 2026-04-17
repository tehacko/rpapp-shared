/**
 * Shared Types
 *
 * Database models, API contracts, and type definitions
 * used across kiosk, admin, and backend applications.
 */
// ===== Transaction & Receipt Status Enums =====
export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["INITIATED"] = "INITIATED";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["TIMEOUT"] = "TIMEOUT";
})(TransactionStatus || (TransactionStatus = {}));
export var ReceiptType;
(function (ReceiptType) {
    ReceiptType["PLAIN"] = "PLAIN";
    ReceiptType["INVOICE"] = "INVOICE";
    ReceiptType["PROFORMA"] = "PROFORMA";
})(ReceiptType || (ReceiptType = {}));
export var TenantStatus;
(function (TenantStatus) {
    TenantStatus["PENDING"] = "PENDING";
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["DEACTIVATED"] = "DEACTIVATED";
    TenantStatus["DELETED"] = "DELETED";
})(TenantStatus || (TenantStatus = {}));
export var KioskStatus;
(function (KioskStatus) {
    KioskStatus["ACTIVE"] = "ACTIVE";
    KioskStatus["DEACTIVATED"] = "DEACTIVATED";
    KioskStatus["DELETED"] = "DELETED";
})(KioskStatus || (KioskStatus = {}));
export var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["DEACTIVATED"] = "DEACTIVATED";
    ProductStatus["DELETED"] = "DELETED";
})(ProductStatus || (ProductStatus = {}));
export var LegalBasis;
(function (LegalBasis) {
    LegalBasis["LEGAL_OBLIGATION"] = "LEGAL_OBLIGATION";
    LegalBasis["CONTRACT"] = "CONTRACT";
    LegalBasis["LEGITIMATE_INTEREST"] = "LEGITIMATE_INTEREST";
    LegalBasis["CONSENT"] = "CONSENT";
})(LegalBasis || (LegalBasis = {}));
export var RetentionClass;
(function (RetentionClass) {
    RetentionClass["STATUTORY"] = "STATUTORY";
    RetentionClass["GOVERNANCE"] = "GOVERNANCE";
    RetentionClass["RUNTIME"] = "RUNTIME";
})(RetentionClass || (RetentionClass = {}));
//# sourceMappingURL=types.js.map