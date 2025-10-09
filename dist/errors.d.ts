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
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        timestamp: string;
        details?: any;
    };
}
export declare const formatError: (error: Error | AppError, details?: any) => ErrorResponse;
export declare const getErrorMessage: (error: Error | AppError) => string;
