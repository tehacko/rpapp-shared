// Centralized environment configuration for all services
// This ensures consistency across backend, kiosk, and admin apps
// Simplified environment variable helper
function getEnvVar(key, defaultValue) {
    // Check for process.env (Node.js environment)
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue;
    }
    // Check for import.meta.env (Vite environment)
    if (typeof window !== 'undefined') {
        try {
            // @ts-ignore - Vite environment
            const meta = globalThis.import?.meta;
            if (meta && meta.env) {
                return meta.env[key] || defaultValue;
            }
        }
        catch (e) {
            // Fallback for test environments
        }
    }
    return defaultValue;
}
function getEnvBool(key, defaultValue) {
    const value = getEnvVar(key, defaultValue.toString());
    return value === 'true';
}
// Centralized service URLs configuration
const SERVICE_URLS = {
    development: {
        backend: 'http://localhost:3015',
        kiosk: 'http://localhost:3000',
        admin: 'http://localhost:3001',
    },
    production: {
        backend: 'https://rpapp-bckend-production.up.railway.app',
        kiosk: 'https://rpapp-kiosk-production.up.railway.app',
        admin: 'https://extraordinary-healing-production-88f4.up.railway.app',
    }
};
// Get environment configuration dynamically
function getConfigForEnvironment(env) {
    const urls = SERVICE_URLS[env];
    if (env === 'development') {
        return {
            // API Configuration
            apiUrl: getEnvVar('REACT_APP_API_URL', urls.backend),
            wsUrl: getEnvVar('REACT_APP_WS_URL', urls.backend.replace('http', 'ws')),
            // Payment Configuration
            enableMockPayments: getEnvBool('REACT_APP_ENABLE_MOCK_PAYMENTS', true),
            paymentAccountNumber: getEnvVar('REACT_APP_PAYMENT_ACCOUNT', '1234567890'),
            paymentMode: getEnvVar('REACT_APP_PAYMENT_MODE', 'mock'),
            // UI Configuration
            showDebugInfo: getEnvBool('REACT_APP_SHOW_DEBUG_INFO', true),
            logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'debug'),
            // Service URLs
            kioskUrl: getEnvVar('REACT_APP_KIOSK_URL', urls.kiosk),
            adminUrl: getEnvVar('REACT_APP_ADMIN_URL', urls.admin),
            backendUrl: getEnvVar('REACT_APP_BACKEND_URL', urls.backend),
        };
    }
    else {
        return {
            // API Configuration
            apiUrl: getEnvVar('REACT_APP_API_URL', urls.backend),
            wsUrl: getEnvVar('REACT_APP_WS_URL', urls.backend.replace('https', 'wss')),
            // Payment Configuration
            enableMockPayments: getEnvBool('REACT_APP_ENABLE_MOCK_PAYMENTS', false),
            paymentAccountNumber: getEnvVar('REACT_APP_PAYMENT_ACCOUNT', '1234567890'),
            paymentMode: getEnvVar('REACT_APP_PAYMENT_MODE', 'production'),
            // UI Configuration
            showDebugInfo: getEnvBool('REACT_APP_SHOW_DEBUG_INFO', false),
            logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'warn'),
            // Service URLs
            kioskUrl: getEnvVar('REACT_APP_KIOSK_URL', urls.kiosk),
            adminUrl: getEnvVar('REACT_APP_ADMIN_URL', urls.admin),
            backendUrl: getEnvVar('REACT_APP_BACKEND_URL', urls.backend),
        };
    }
}
// Simplified environment detection
export const getCurrentEnvironment = () => {
    // Check for process.env (Node.js environment)
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    }
    // Check for import.meta.env (Vite environment)
    if (typeof window !== 'undefined') {
        try {
            // @ts-ignore - Vite environment
            const meta = globalThis.import?.meta;
            if (meta && meta.env) {
                return meta.env.MODE === 'production' ? 'production' : 'development';
            }
        }
        catch (e) {
            // Fallback: check if we're on Railway domain
            if (window.location &&
                (window.location.hostname.includes('railway.app') ||
                    window.location.hostname.includes('up.railway.app'))) {
                return 'production';
            }
        }
    }
    return 'development';
};
// Get current environment configuration
export const getEnvironmentConfig = () => {
    const env = getCurrentEnvironment();
    return getConfigForEnvironment(env);
};
// Simple environment checks
export const isDevelopment = () => getCurrentEnvironment() === 'development';
export const isProduction = () => getCurrentEnvironment() === 'production';
// Utility functions for easy access to service URLs
export const getBackendUrl = () => getEnvironmentConfig().backendUrl;
export const getKioskUrl = () => getEnvironmentConfig().kioskUrl;
export const getAdminUrl = () => getEnvironmentConfig().adminUrl;
export const getApiUrl = () => getEnvironmentConfig().apiUrl;
export const getWsUrl = () => getEnvironmentConfig().wsUrl;
// Service-specific configuration helpers
export const getPaymentConfig = () => {
    const config = getEnvironmentConfig();
    return {
        enableMockPayments: config.enableMockPayments,
        paymentAccountNumber: config.paymentAccountNumber,
        paymentMode: config.paymentMode,
    };
};
export const getUIConfig = () => {
    const config = getEnvironmentConfig();
    return {
        showDebugInfo: config.showDebugInfo,
        logLevel: config.logLevel,
    };
};
