// Tests for environment configuration
import { getCurrentEnvironment, getEnvironmentConfig, isDevelopment, isProduction } from './environments';

describe('Environment Configuration', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalReactAppEnv = {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL,
    REACT_APP_ENABLE_MOCK_PAYMENTS: process.env.REACT_APP_ENABLE_MOCK_PAYMENTS,
    REACT_APP_PAYMENT_ACCOUNT: process.env.REACT_APP_PAYMENT_ACCOUNT,
    REACT_APP_SHOW_DEBUG_INFO: process.env.REACT_APP_SHOW_DEBUG_INFO,
  };

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    // Restore original environment variables
    Object.keys(originalReactAppEnv).forEach(key => {
      if (originalReactAppEnv[key as keyof typeof originalReactAppEnv] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalReactAppEnv[key as keyof typeof originalReactAppEnv];
      }
    });
  });

  describe('getCurrentEnvironment', () => {
    test('returns development for non-production environments', () => {
      process.env.NODE_ENV = 'development';
      expect(getCurrentEnvironment()).toBe('development');

      process.env.NODE_ENV = 'test';
      expect(getCurrentEnvironment()).toBe('development');

      delete process.env.NODE_ENV;
      expect(getCurrentEnvironment()).toBe('development');
    });

    test('returns production for production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(getCurrentEnvironment()).toBe('production');
    });
  });

  describe('getEnvironmentConfig', () => {
    test('returns development config by default', () => {
      process.env.NODE_ENV = 'development';
      // Set environment variables for the test
      process.env.REACT_APP_ENABLE_MOCK_PAYMENTS = 'true';
      process.env.REACT_APP_SHOW_DEBUG_INFO = 'true';
      
      const config = getEnvironmentConfig();
      
      expect(config.apiUrl).toBe('http://localhost:3015');
      expect(config.enableMockPayments).toBe(true);
      expect(config.showDebugInfo).toBe(true);
    });

    test('returns production config for production', () => {
      process.env.NODE_ENV = 'production';
      // Clear any existing environment variables
      delete process.env.REACT_APP_ENABLE_MOCK_PAYMENTS;
      delete process.env.REACT_APP_SHOW_DEBUG_INFO;
      
      const config = getEnvironmentConfig();
      
      expect(config.enableMockPayments).toBe(false);
      expect(config.showDebugInfo).toBe(false);
    });
  });

  describe('environment checks', () => {
    test('isDevelopment works correctly', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
    });

    test('isProduction works correctly', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
    });
  });
});
