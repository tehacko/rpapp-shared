import { AppError } from '../errors';
export interface ErrorState {
    error: AppError | Error | null;
    message: string;
    isVisible: boolean;
}
export declare function useErrorHandler(): {
    error: Error | AppError | null;
    errorMessage: string;
    isErrorVisible: boolean;
    handleError: (error: Error | AppError, context?: string) => void;
    clearError: () => void;
    retryAction: (action: () => Promise<void> | void) => void;
};
