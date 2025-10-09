import { APIClient } from '../api';
export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}
export declare function useApi<T = any>(_apiClient: APIClient): {
    execute: (apiCall: () => Promise<T>, options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
        skipLoading?: boolean;
    }) => Promise<T>;
    reset: () => void;
    isLoading: boolean;
    hasError: boolean;
    hasData: boolean;
    data: T | null;
    loading: boolean;
    error: Error | null;
};
