import { useState, useCallback } from 'react';
import { NetworkError, AppError } from '../errors';
export function useApi(_apiClient) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null
    });
    const execute = useCallback(async (apiCall, options) => {
        try {
            if (!options?.skipLoading) {
                setState(prev => ({ ...prev, loading: true, error: null }));
            }
            const data = await apiCall();
            setState({
                data,
                loading: false,
                error: null
            });
            options?.onSuccess?.(data);
            return data;
        }
        catch (error) {
            const appError = error instanceof AppError
                ? error
                : new NetworkError('Chyba při komunikaci se serverem');
            setState(prev => ({
                ...prev,
                loading: false,
                error: appError
            }));
            options?.onError?.(appError);
            throw appError;
        }
    }, []);
    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null
        });
    }, []);
    return {
        ...state,
        execute,
        reset,
        isLoading: state.loading,
        hasError: !!state.error,
        hasData: !!state.data
    };
}
//# sourceMappingURL=useApi.js.map