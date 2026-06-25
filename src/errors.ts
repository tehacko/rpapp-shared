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
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
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
  constructor(message: string, _field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Chyba připojení k serveru') {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Neplatné přihlašovací údaje') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Zdroj') {
    super(`${resource} nebyl nalezen`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Chyba při zpracování platby') {
    super(message, 'PAYMENT_ERROR', 400);
    this.name = 'PaymentError';
  }
}

export class InventoryError extends AppError {
  constructor(message: string = 'Chyba při správě zásob') {
    super(message, 'INVENTORY_ERROR', 400);
    this.name = 'InventoryError';
  }
}

export class KioskError extends AppError {
  constructor(message: string = 'Chyba konfigurace kiosku') {
    super(message, 'KIOSK_ERROR', 400);
    this.name = 'KioskError';
  }
}

/** Sales-point naming alias — retains `KIOSK_ERROR` code for v1 churn reduction. */
export class SalesPointError extends KioskError {
  constructor(message: string = 'Chyba konfigurace prodejního místa') {
    super(message);
    this.name = 'SalesPointError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Chyba databáze') {
    super(message, 'DATABASE_ERROR', 503);
    this.name = 'DatabaseError';
  }
}

// ===== Error Response & Formatting =====

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
export const formatError = (error: Error | AppError, details?: unknown): ErrorResponse => {
  const isAppError = error instanceof AppError;
  
  const errorObj: ErrorResponse['error'] = {
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
export const getErrorMessage = (error: Error | AppError): string => {
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
} as const;

export type BankErrorCode = (typeof BANK_ERROR_CODES)[keyof typeof BANK_ERROR_CODES];

export const BANK_ACCOUNT_PURPOSE_NOT_ALLOWED = BANK_ERROR_CODES.BANK_ACCOUNT_PURPOSE_NOT_ALLOWED;
export const BANK_ACCOUNT_NOT_CONFIGURED = BANK_ERROR_CODES.BANK_ACCOUNT_NOT_CONFIGURED;
export const BANK_ACCOUNT_INACTIVE = BANK_ERROR_CODES.BANK_ACCOUNT_INACTIVE;
export const DUPLICATE_BANK_REFERENCE = BANK_ERROR_CODES.DUPLICATE_BANK_REFERENCE;
export const PAYMENT_CLAIM_CAP_REACHED = BANK_ERROR_CODES.PAYMENT_CLAIM_CAP_REACHED;
export const PAYMENT_CLAIM_COOLDOWN = BANK_ERROR_CODES.PAYMENT_CLAIM_COOLDOWN;
