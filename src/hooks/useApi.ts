import { useState, useCallback } from 'react';
import { APIClient } from '../api';
import { NetworkError, AppError } from '../errors';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T = any>(_apiClient: APIClient) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      skipLoading?: boolean;
    }
  ) => {
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

    } catch (error) {
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
