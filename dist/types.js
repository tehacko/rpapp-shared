// Shared types across all packages
// Enums matching backend Prisma schema
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
//# sourceMappingURL=types.js.map