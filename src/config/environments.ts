// Centralized environment configuration for all services
// This ensures consistency across backend, kiosk, and admin apps

// Simplified environment variable helper
function getEnvVar(key: string, defaultValue: string): string {
  // Check for process.env (Node.js environment)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  // Check for import.meta.env (Vite environment)
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - Vite environment
      const meta = (globalThis as any).import?.meta;
      if (meta && meta.env) {
        return meta.env[key] || defaultValue;
      }
    } catch (e) {
      // Fallback for test environments
    }
  }
  return defaultValue;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key, defaultValue.toString());
  return value === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = getEnvVar(key, defaultValue.toString());
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
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
  sseHealthCheckInterval: number; // Deprecated, use sseHealthCheckInitialInterval
  sseHealthCheckInitialInterval: number;
  sseHealthCheckBackoffMultiplier: number;
  sseHealthCheckMaxInterval: number;
  sseHealthCheckMaxAttempts: number;
  sseHealthCheckMaxTotalTime: number; // Maximum total time for health checks (milliseconds)
}

// Get environment configuration dynamically
function getConfigForEnvironment(env: Environment): EnvironmentConfig {
  const urls = SERVICE_URLS[env];
  
  if (env === 'development') {
    return {
      // API Configuration
      apiUrl: getEnvVar('REACT_APP_API_URL', urls.backend),
      wsUrl: getEnvVar('REACT_APP_WS_URL', urls.backend.replace('http', 'ws')),
      // Payment Configuration
      enableMockPayments: getEnvBool('REACT_APP_ENABLE_MOCK_PAYMENTS', true),
      paymentAccountNumber: getEnvVar('REACT_APP_PAYMENT_ACCOUNT', '1234567890'),
      paymentMode: getEnvVar('REACT_APP_PAYMENT_MODE', 'mock') as 'mock' | 'sandbox' | 'production',
      // UI Configuration
      showDebugInfo: getEnvBool('REACT_APP_SHOW_DEBUG_INFO', true),
      logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'debug') as 'debug' | 'info' | 'warn' | 'error',
      // Service URLs
      kioskUrl: getEnvVar('REACT_APP_KIOSK_URL', urls.kiosk),
      adminUrl: getEnvVar('REACT_APP_ADMIN_URL', urls.admin),
      backendUrl: getEnvVar('REACT_APP_BACKEND_URL', urls.backend),
      // SSE Configuration
      sseHealthCheckInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_INTERVAL', 300000), // 5 minutes default (deprecated, use sseHealthCheckInitialInterval)
      sseHealthCheckInitialInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_INITIAL_INTERVAL', 300000), // 5 minutes default
      sseHealthCheckBackoffMultiplier: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_BACKOFF_MULTIPLIER', 2), // Double interval on each failure
      sseHealthCheckMaxInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_INTERVAL', 1800000), // 30 minutes max
      sseHealthCheckMaxAttempts: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_ATTEMPTS', 24), // 24 attempts (~2 hours at max interval)
      sseHealthCheckMaxTotalTime: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_TOTAL_TIME', 7200000), // 2 hours default (7200000ms = 2 * 60 * 60 * 1000)
    };
  } else {
    return {
      // API Configuration
      apiUrl: getEnvVar('REACT_APP_API_URL', urls.backend),
      wsUrl: getEnvVar('REACT_APP_WS_URL', urls.backend.replace('https', 'wss')),
      // Payment Configuration
      enableMockPayments: getEnvBool('REACT_APP_ENABLE_MOCK_PAYMENTS', false),
      paymentAccountNumber: getEnvVar('REACT_APP_PAYMENT_ACCOUNT', '1234567890'),
      paymentMode: getEnvVar('REACT_APP_PAYMENT_MODE', 'production') as 'mock' | 'sandbox' | 'production',
      // UI Configuration
      showDebugInfo: getEnvBool('REACT_APP_SHOW_DEBUG_INFO', false),
      logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'warn') as 'debug' | 'info' | 'warn' | 'error',
      // Service URLs
      kioskUrl: getEnvVar('REACT_APP_KIOSK_URL', urls.kiosk),
      adminUrl: getEnvVar('REACT_APP_ADMIN_URL', urls.admin),
      backendUrl: getEnvVar('REACT_APP_BACKEND_URL', urls.backend),
      // SSE Configuration
      sseHealthCheckInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_INTERVAL', 300000), // 5 minutes default (deprecated, use sseHealthCheckInitialInterval)
      sseHealthCheckInitialInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_INITIAL_INTERVAL', 300000), // 5 minutes default
      sseHealthCheckBackoffMultiplier: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_BACKOFF_MULTIPLIER', 2), // Double interval on each failure
      sseHealthCheckMaxInterval: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_INTERVAL', 1800000), // 30 minutes max
      sseHealthCheckMaxAttempts: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_ATTEMPTS', 24), // 24 attempts (~2 hours at max interval)
      sseHealthCheckMaxTotalTime: getEnvNumber('REACT_APP_SSE_HEALTH_CHECK_MAX_TOTAL_TIME', 7200000), // 2 hours default (7200000ms = 2 * 60 * 60 * 1000)
    };
  }
}

// Simplified environment detection
export const getCurrentEnvironment = (): Environment => {
  // Check for process.env (Node.js environment)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }
  // Check for import.meta.env (Vite environment)
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - Vite environment
      const meta = (globalThis as any).import?.meta;
      if (meta && meta.env) {
        return meta.env.MODE === 'production' ? 'production' : 'development';
      }
    } catch (e) {
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
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = getCurrentEnvironment();
  return getConfigForEnvironment(env);
};

// Simple environment checks
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

// Utility functions for easy access to service URLs
export const getBackendUrl = (): string => getEnvironmentConfig().backendUrl;
export const getKioskUrl = (): string => getEnvironmentConfig().kioskUrl;
export const getAdminUrl = (): string => getEnvironmentConfig().adminUrl;
export const getApiUrl = (): string => getEnvironmentConfig().apiUrl;
export const getWsUrl = (): string => getEnvironmentConfig().wsUrl;

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

