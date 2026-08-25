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
import { pickLocalizedApiMessage } from './errors/pickLocalizedApiMessage.js';
/** CS / SK / EN user-facing copy (Czech-first wire format; UI picks via pickLocalizedApiMessage). */
function csSkEn(cs, sk, en) {
    return `${cs} / ${sk} / ${en}`;
}
// ===== Predefined Error Types =====
export class ValidationError extends AppError {
    constructor(message, _field) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}
export class NetworkError extends AppError {
    constructor(message = csSkEn('Chyba připojení k serveru', 'Chyba pripojenia k serveru', 'Server connection error')) {
        super(message, 'NETWORK_ERROR', 503);
        this.name = 'NetworkError';
    }
}
export class AuthenticationError extends AppError {
    constructor(message = csSkEn('Neplatné přihlašovací údaje', 'Neplatné prihlasovacie údaje', 'Invalid credentials')) {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Zdroj') {
        super(csSkEn(`${resource} nebyl nalezen`, `${resource === 'Zdroj' ? 'Zdroj' : resource} nebol nájdený`, `${resource === 'Zdroj' ? 'Resource' : resource} was not found`), 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}
export class PaymentError extends AppError {
    constructor(message = csSkEn('Chyba při zpracování platby', 'Chyba pri spracovaní platby', 'Payment processing error')) {
        super(message, 'PAYMENT_ERROR', 400);
        this.name = 'PaymentError';
    }
}
export class InventoryError extends AppError {
    constructor(message = csSkEn('Chyba při správě zásob', 'Chyba pri správe zásob', 'Inventory management error')) {
        super(message, 'INVENTORY_ERROR', 400);
        this.name = 'InventoryError';
    }
}
export class KioskError extends AppError {
    constructor(message = csSkEn('Chyba konfigurace kiosku', 'Chyba konfigurácie kiosku', 'Kiosk configuration error')) {
        super(message, 'KIOSK_ERROR', 400);
        this.name = 'KioskError';
    }
}
/** Sales-point naming alias — retains `KIOSK_ERROR` code for v1 churn reduction. */
export class SalesPointError extends KioskError {
    constructor(message = csSkEn('Chyba konfigurace prodejního místa', 'Chyba konfigurácie platobného miesta', 'Sales point configuration error')) {
        super(message);
        this.name = 'SalesPointError';
    }
}
export class DatabaseError extends AppError {
    constructor(message = csSkEn('Chyba databáze', 'Chyba databázy', 'Database error')) {
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
        message: error.message ||
            csSkEn('Došlo k neočekávané chybě', 'Došlo k neočakávanej chybe', 'An unexpected error occurred'),
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
 * Used in React components to display to users.
 * Pass `locale` (UI language) so CS/SK/EN slash-joined API copy is reduced to one language.
 */
export const getErrorMessage = (error, locale) => {
    let message;
    if (error instanceof NetworkError) {
        message = csSkEn('Problém s připojením. Zkuste to znovu.', 'Problém s pripojením. Skúste to znova.', 'Connection problem. Please try again.');
    }
    else if (error instanceof ValidationError) {
        message = error.message;
    }
    else if (error instanceof AuthenticationError) {
        message = csSkEn('Neplatné přihlašovací údaje.', 'Neplatné prihlasovacie údaje.', 'Invalid credentials.');
    }
    else if (error instanceof NotFoundError) {
        message = error.message;
    }
    else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        message = csSkEn('Problém s připojením. Zkuste to znovu.', 'Problém s pripojením. Skúste to znova.', 'Connection problem. Please try again.');
    }
    else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = csSkEn('Neplatné přihlašovací údaje.', 'Neplatné prihlasovacie údaje.', 'Invalid credentials.');
    }
    else {
        message =
            error.message ||
                csSkEn('Něco se pokazilo. Zkuste to znovu.', 'Niečo sa pokazilo. Skúste to znova.', 'Something went wrong. Please try again.');
    }
    if (locale !== undefined && locale.trim().length > 0) {
        return pickLocalizedApiMessage(message, locale);
    }
    return message;
};
// Multi-bank reconciliation codes (Wave 1 forward compatibility).
export const BANK_ERROR_CODES = {
    BANK_ACCOUNT_PURPOSE_NOT_ALLOWED: 'BANK_ACCOUNT_PURPOSE_NOT_ALLOWED',
    BANK_ACCOUNT_NOT_CONFIGURED: 'BANK_ACCOUNT_NOT_CONFIGURED',
    BANK_ACCOUNT_NOT_FOUND: 'BANK_ACCOUNT_NOT_FOUND',
    BANK_ACCOUNT_INACTIVE: 'BANK_ACCOUNT_INACTIVE',
    DUPLICATE_BANK_REFERENCE: 'DUPLICATE_BANK_REFERENCE',
    PAYMENT_CLAIM_CAP_REACHED: 'PAYMENT_CLAIM_CAP_REACHED',
    PAYMENT_CLAIM_COOLDOWN: 'PAYMENT_CLAIM_COOLDOWN',
    BANK_RECONCILIATION_FAILED: 'BANK_RECONCILIATION_FAILED',
    BANK_RECONCILIATION_CONFLICT: 'BANK_RECONCILIATION_CONFLICT',
};
export const BANK_ACCOUNT_PURPOSE_NOT_ALLOWED = BANK_ERROR_CODES.BANK_ACCOUNT_PURPOSE_NOT_ALLOWED;
export const BANK_ACCOUNT_NOT_CONFIGURED = BANK_ERROR_CODES.BANK_ACCOUNT_NOT_CONFIGURED;
export const BANK_ACCOUNT_INACTIVE = BANK_ERROR_CODES.BANK_ACCOUNT_INACTIVE;
export const DUPLICATE_BANK_REFERENCE = BANK_ERROR_CODES.DUPLICATE_BANK_REFERENCE;
export const PAYMENT_CLAIM_CAP_REACHED = BANK_ERROR_CODES.PAYMENT_CLAIM_CAP_REACHED;
export const PAYMENT_CLAIM_COOLDOWN = BANK_ERROR_CODES.PAYMENT_CLAIM_COOLDOWN;
//# sourceMappingURL=errors.js.map