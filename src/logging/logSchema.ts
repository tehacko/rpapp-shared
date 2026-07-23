/**
 * Client logger metadata schema and reserved flat-entry keys.
 */

/** Keys that must not be supplied via structured metadata (would break flat log formatting). */
export const RESERVED_CLIENT_LOG_ENTRY_KEYS = [
  'level',
  'message',
  'timestamp',
  'service',
  'app',
  'environment',
  'appEnv',
  'deploymentEnvironment',
] as const;

export type ReservedClientLogEntryKey = (typeof RESERVED_CLIENT_LOG_ENTRY_KEYS)[number];

export type ClientLoggerMeta = {
  module?: string;
  feature?: string;
  operation?: string;
  correlationId?: string;
  errorCode?: string;
  [key: string]: unknown;
};

export type ClientLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface ClientLogger {
  info: (message: string, ...rest: unknown[]) => void;
  warn: (message: string, ...rest: unknown[]) => void;
  error: (messageOrError: string | unknown, ...rest: unknown[]) => void;
  debug: (message: string, ...rest: unknown[]) => void;
}
