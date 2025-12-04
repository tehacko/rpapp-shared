export type Environment = 'development' | 'production';
export interface EnvironmentConfig {
    apiUrl: string;
    wsUrl: string;
    enableMockPayments: boolean;
    paymentAccountNumber: string;
    paymentMode: 'mock' | 'sandbox' | 'production';
    showDebugInfo: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    kioskUrl: string;
    adminUrl: string;
    backendUrl: string;
    sseHealthCheckInitialInterval: number;
    sseHealthCheckBackoffMultiplier: number;
    sseHealthCheckMaxInterval: number;
    sseHealthCheckMaxAttempts: number;
    sseHealthCheckMaxTotalTime: number;
}
export declare const getCurrentEnvironment: () => Environment;
export declare const getEnvironmentConfig: () => EnvironmentConfig;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const getBackendUrl: () => string;
export declare const getKioskUrl: () => string;
export declare const getAdminUrl: () => string;
export declare const getApiUrl: () => string;
export declare const getWsUrl: () => string;
export declare const getPaymentConfig: () => {
    enableMockPayments: boolean;
    paymentAccountNumber: string;
    paymentMode: "production" | "mock" | "sandbox";
};
export declare const getUIConfig: () => {
    showDebugInfo: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
};
//# sourceMappingURL=environments.d.ts.map