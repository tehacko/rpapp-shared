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
 * Used in React components to display to users
 */
export declare const getErrorMessage: (error: Error | AppError) => string;
//# sourceMappingURL=errors.d.ts.map