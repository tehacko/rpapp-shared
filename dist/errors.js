/**
 * Shared Error Handling System
 *
 * Centralized error definitions and utilities for consistent
 * error handling across all applications
 */
// ===== Base Error Classes =====
/**
 * Base application error with code and status code
 */
export class AppError extends Error {
    code;
    statusCode;
    isOperational;
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, isOperational = true) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Ensure the stack trace is captured
        Error.captureStackTrace(this, this.constructor);
    }
}
// ===== Predefined Error Types =====
export class ValidationError extends AppError {
    constructor(message, _field) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}
export class NetworkError extends AppError {
    constructor(message = 'Chyba připojení k serveru') {
        super(message, 'NETWORK_ERROR', 503);
        this.name = 'NetworkError';
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Neplatné přihlašovací údaje') {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Zdroj') {
        super(`${resource} nebyl nalezen`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}
export class PaymentError extends AppError {
    constructor(message = 'Chyba při zpracování platby') {
        super(message, 'PAYMENT_ERROR', 400);
        this.name = 'PaymentError';
    }
}
export class InventoryError extends AppError {
    constructor(message = 'Chyba při správě zásob') {
        super(message, 'INVENTORY_ERROR', 400);
        this.name = 'InventoryError';
    }
}
export class KioskError extends AppError {
    constructor(message = 'Chyba konfigurace kiosku') {
        super(message, 'KIOSK_ERROR', 400);
        this.name = 'KioskError';
    }
}
export class DatabaseError extends AppError {
    constructor(message = 'Chyba databáze') {
        super(message, 'DATABASE_ERROR', 503);
        this.name = 'DatabaseError';
    }
}
/**
 * Format error for consistent API responses
 */
export const formatError = (error, details) => {
    const isAppError = error instanceof AppError;
    const errorObj = {
        code: isAppError ? error.code : 'UNKNOWN_ERROR',
        message: error.message || 'Došlo k neočekávané chybě',
        timestamp: new Date().toISOString(),
    };
    if (details) {
        errorObj.details = details;
    }
    return {
        success: false,
        error: errorObj
    };
};
// ===== Error Messaging (Client-side) =====
/**
 * Get user-friendly error message from error object
 * Used in React components to display to users
 */
export const getErrorMessage = (error) => {
    if (error instanceof NetworkError) {
        return 'Problém s připojením. Zkuste to znovu.';
    }
    if (error instanceof ValidationError) {
        return error.message;
    }
    if (error instanceof AuthenticationError) {
        return 'Neplatné přihlašovací údaje.';
    }
    if (error instanceof NotFoundError) {
        return error.message;
    }
    // Check for specific error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        return 'Problém s připojením. Zkuste to znovu.';
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Neplatné přihlašovací údaje.';
    }
    // Return original message if available, otherwise generic
    return error.message || 'Něco se pokazilo. Zkuste to znovu.';
};
//# sourceMappingURL=errors.js.map