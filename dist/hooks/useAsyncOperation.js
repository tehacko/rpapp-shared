import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
/**
 * Consistent hook for handling async operations with loading states and error handling
 */
export function useAsyncOperation(options = {}) {
    const [state, setState] = useState({
        data: options.initialData || null,
        loading: false,
        error: null
    });
    const { handleError } = useErrorHandler();
    const execute = useCallback(async (operation, context) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const result = await operation();
            setState({
                data: result,
                loading: false,
                error: null
            });
            options.onSuccess?.(result);
            return result;
        }
        catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorObj
            }));
            handleError(errorObj, context || 'useAsyncOperation');
            options.onError?.(errorObj);
            return null;
        }
    }, [handleError, options]);
    const reset = useCallback(() => {
        setState({
            data: options.initialData || null,
            loading: false,
            error: null
        });
    }, [options.initialData]);
    const setData = useCallback((data) => {
        setState(prev => ({ ...prev, data }));
    }, []);
    return {
        ...state,
        execute,
        reset,
        setData,
        // Computed properties
        isLoading: state.loading,
        hasError: !!state.error,
        hasData: !!state.data,
        isIdle: !state.loading && !state.error && !state.data
    };
}
//# sourceMappingURL=useAsyncOperation.js.map