/**
 * Pi Kiosk Shared Package
 *
 * Exports shared types, API contracts, error classes, and utilities
 * for use across kiosk, admin, and backend applications.
 *
 * Note: relative imports use explicit `.js` extensions so the compiled
 * `dist/*.js` is consumable by native Node ESM (e.g. backend running
 * under tsx). Without extensions, Node fails to enumerate re-exports
 * for named imports across the `export * from` chain.
 */
export * from './types.js';
export * from './types/kioskPublicConfig.js';
export * from './api.js';
export * from './errors.js';
export * from './components/DatabaseUnavailable.js';
export * from './hooks/useDatabaseHealth.js';
export * from './analyticsEvents.js';
export * from './analyticsExploreCaps.js';
//# sourceMappingURL=index.d.ts.map