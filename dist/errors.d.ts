/**
 * Shared Error Handling System
 *
 * Centralized error definitions and utilities for consistent
 * error handling across all applications
 */
/**
 * Base application error with code and status code
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, code?: string, statusCode?: number, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string, _field?: string);
}
export declare class NetworkError extends AppError {
    constructor(message?: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class PaymentError extends AppError {
    constructor(message?: string);
}
export declare class InventoryError extends AppError {
    constructor(message?: string);
}
export declare class KioskError extends AppError {
    constructor(message?: string);
}
/** Sales-point naming alias — retains `KIOSK_ERROR` code for v1 churn reduction. */
export declare class SalesPointError extends KioskError {
    constructor(message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        timestamp: string;
        details?: unknown;
    };
}
/**
 * Format error for consistent API responses
 */
export declare const formatError: (error: Error | AppError, details?: unknown) => ErrorResponse;
/**
 * Get user-friendly error message from error object
 * Used in React components to display to users.
 * Pass `locale` (UI language) so CS/SK/EN slash-joined API copy is reduced to one language.
 */
export declare const getErrorMessage: (error: Error | AppError, locale?: string) => string;
export declare const BANK_ERROR_CODES: {
    readonly BANK_ACCOUNT_PURPOSE_NOT_ALLOWED: "BANK_ACCOUNT_PURPOSE_NOT_ALLOWED";
    readonly BANK_ACCOUNT_NOT_CONFIGURED: "BANK_ACCOUNT_NOT_CONFIGURED";
    readonly BANK_ACCOUNT_NOT_FOUND: "BANK_ACCOUNT_NOT_FOUND";
    readonly BANK_ACCOUNT_INACTIVE: "BANK_ACCOUNT_INACTIVE";
    readonly DUPLICATE_BANK_REFERENCE: "DUPLICATE_BANK_REFERENCE";
    readonly PAYMENT_CLAIM_CAP_REACHED: "PAYMENT_CLAIM_CAP_REACHED";
    readonly PAYMENT_CLAIM_COOLDOWN: "PAYMENT_CLAIM_COOLDOWN";
    readonly BANK_RECONCILIATION_FAILED: "BANK_RECONCILIATION_FAILED";
    readonly BANK_RECONCILIATION_CONFLICT: "BANK_RECONCILIATION_CONFLICT";
};
export type BankErrorCode = (typeof BANK_ERROR_CODES)[keyof typeof BANK_ERROR_CODES];
export declare const BANK_ACCOUNT_PURPOSE_NOT_ALLOWED: "BANK_ACCOUNT_PURPOSE_NOT_ALLOWED";
export declare const BANK_ACCOUNT_NOT_CONFIGURED: "BANK_ACCOUNT_NOT_CONFIGURED";
export declare const BANK_ACCOUNT_INACTIVE: "BANK_ACCOUNT_INACTIVE";
export declare const DUPLICATE_BANK_REFERENCE: "DUPLICATE_BANK_REFERENCE";
export declare const PAYMENT_CLAIM_CAP_REACHED: "PAYMENT_CLAIM_CAP_REACHED";
export declare const PAYMENT_CLAIM_COOLDOWN: "PAYMENT_CLAIM_COOLDOWN";
//# sourceMappingURL=errors.d.ts.map