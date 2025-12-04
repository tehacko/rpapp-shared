interface UseAsyncOperationOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T;
}
/**
 * Consistent hook for handling async operations with loading states and error handling
 */
export declare function useAsyncOperation<T = any>(options?: UseAsyncOperationOptions<T>): {
    execute: (operation: () => Promise<T>, context?: string) => Promise<T | null>;
    reset: () => void;
    setData: (data: T) => void;
    isLoading: boolean;
    hasError: boolean;
    hasData: boolean;
    isIdle: boolean;
    data: T | null;
    loading: boolean;
    error: Error | null;
};
export {};
//# sourceMappingURL=useAsyncOperation.d.ts.map