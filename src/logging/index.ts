/**
 * Shared client logging public API (`pi-kiosk-shared/logging`).
 */

export type {
  ClientLogger,
  ClientLoggerMeta,
  ClientLogLevel,
  ReservedClientLogEntryKey,
} from './logSchema.js';
export { RESERVED_CLIENT_LOG_ENTRY_KEYS } from './logSchema.js';

export { createClientLogger } from './createClientLogger.js';
export type { CreateClientLoggerOptions } from './createClientLogger.js';

export { createScopedLogger } from './createScopedLogger.js';
export type { ClientLoggerScope, ScopedClientLogger } from './createScopedLogger.js';

export {
  getClientCorrelationId,
  setClientCorrelationId,
  resetClientCorrelationIdForTests,
} from './correlationContext.js';

export { readRequestId } from './readRequestId.js';

export { sanitizeMetaForLogEntry } from './sanitizeMeta.js';

export {
  shouldEmitLogRepeat,
  getLogRepeatCount,
  resetLogRepeatCapForTests,
  DEFAULT_CLIENT_LOG_REPEAT_CAP,
} from './logRepeatCap.js';

export { isUnexpectedClientError } from './isUnexpectedClientError.js';

export { reportClientError } from './reportClientError.js';
export type { CaptureClientErrorFn, ReportClientErrorOptions } from './reportClientError.js';
