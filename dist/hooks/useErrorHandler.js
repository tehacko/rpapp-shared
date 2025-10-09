import { useCallback, useState } from 'react';
import { getErrorMessage, formatError } from '../errors';
export function useErrorHandler() {
    const [errorState, setErrorState] = useState({
        error: null,
        message: '',
        isVisible: false
    });
    const handleError = useCallback((error, context) => {
        console.error(`Error in ${context || 'unknown context'}:`, error);
        const userMessage = getErrorMessage(error);
        setErrorState({
            error,
            message: userMessage,
            isVisible: true
        });
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            setErrorState(prev => ({ ...prev, isVisible: false }));
        }, 5000);
        // Send to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
            console.warn('Production error logged:', formatError(error));
        }
    }, []);
    const clearError = useCallback(() => {
        setErrorState({
            error: null,
            message: '',
            isVisible: false
        });
    }, []);
    const retryAction = useCallback((action) => {
        clearError();
        try {
            const result = action();
            if (result instanceof Promise) {
                result.catch(handleError);
            }
        }
        catch (error) {
            handleError(error);
        }
    }, [handleError, clearError]);
    return {
        error: errorState.error,
        errorMessage: errorState.message,
        isErrorVisible: errorState.isVisible,
        handleError,
        clearError,
        retryAction
    };
}
