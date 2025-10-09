// Tests for environment configuration
import { getCurrentEnvironment, getEnvironmentConfig, isDevelopment, isProduction } from './environments';
describe('Environment Configuration', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
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
            const config = getEnvironmentConfig();
            expect(config.apiUrl).toBe('http://localhost:3015');
            expect(config.enableMockPayments).toBe(true);
            expect(config.showDebugInfo).toBe(true);
        });
        test('returns production config for production', () => {
            process.env.NODE_ENV = 'production';
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
