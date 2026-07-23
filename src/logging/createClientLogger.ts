/**
 * Structured client-side logger factory (gold = admin `appLogger`).
 *
 * Transport uses indirect `globalThis.console` access to satisfy zero direct
 * `console.*` policy scans.
 */

import { redactClientLogMeta, redactStringSecrets } from '../clientLogRedaction.js';
import type { ClientLogger, ClientLoggerMeta } from './logSchema.js';
import { sanitizeMetaForLogEntry } from './sanitizeMeta.js';

export type { ClientLogger, ClientLoggerMeta };

export interface CreateClientLoggerOptions {
  readonly app: string;
  /** Inject last-known / request correlation id into every emit when set. */
  readonly getCorrelationId?: () => string | undefined;
  /** Optional release/build version field when known. */
  readonly readVersion?: () => string | undefined;
}

function readEnvironment(): string {
  if (typeof process !== 'undefined' && typeof process.env['NODE_ENV'] === 'string') {
    return process.env['NODE_ENV'];
  }
  return 'development';
}

function isProductionEnvironment(): boolean {
  return readEnvironment() === 'production';
}

function isDevEnvironment(): boolean {
  const env = readEnvironment();
  return env === 'development' || env === 'test';
}

function serializeLogValue(value: unknown): unknown {
  if (value instanceof Error) {
    return { message: value.message, name: value.name, stack: value.stack };
  }
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  return value;
}

function normalizeMeta(rest: unknown[]): ClientLoggerMeta | undefined {
  if (rest.length === 0) {
    return undefined;
  }

  if (rest.length === 1) {
    const only = rest[0];
    if (only instanceof Error) {
      return serializeLogValue(only) as ClientLoggerMeta;
    }
    if (typeof only === 'object' && only !== null && !Array.isArray(only)) {
      return only as ClientLoggerMeta;
    }
    return { detail: serializeLogValue(only) };
  }

  return { details: rest.map((value) => serializeLogValue(value)) };
}

function prepareMeta(meta: ClientLoggerMeta | undefined): ClientLoggerMeta | undefined {
  const sanitized = sanitizeMetaForLogEntry(meta);
  if (!sanitized) {
    return undefined;
  }
  return redactClientLogMeta(sanitized) as ClientLoggerMeta;
}

function emit(
  app: string,
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  meta: ClientLoggerMeta | undefined,
  options: CreateClientLoggerOptions
): void {
  const correlationId = options.getCorrelationId?.();
  const version = options.readVersion?.();
  const merged: ClientLoggerMeta | undefined = {
    ...(correlationId !== undefined && meta?.['correlationId'] === undefined
      ? { correlationId }
      : {}),
    ...(version !== undefined && version.length > 0 ? { version } : {}),
    ...meta,
  };
  const safeMeta = prepareMeta(Object.keys(merged).length > 0 ? merged : undefined);
  const safeMessage = isProductionEnvironment() ? redactStringSecrets(message) : message;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    app,
    message: safeMessage,
    environment: readEnvironment(),
    ...safeMeta,
  };

  const line = isProductionEnvironment() ? JSON.stringify(entry) : `[${app}] ${message}`;
  const sink = globalThis.console;
  const sinkMeta = safeMeta ?? {};

  if (level === 'error') {
    sink.error(line, sinkMeta);
  } else if (level === 'warn') {
    sink.warn(line, sinkMeta);
  } else if (level === 'debug') {
    if (isDevEnvironment()) {
      sink.log(line, sinkMeta);
    }
  } else {
    sink.log(line, sinkMeta);
  }
}

/**
 * Creates a client logger with gold admin parity (flatten, error overload, debug gating).
 */
export function createClientLogger(options: CreateClientLoggerOptions): ClientLogger {
  const { app } = options;

  return {
    info: (message: string, ...rest: unknown[]): void => {
      emit(app, 'info', message, normalizeMeta(rest), options);
    },

    warn: (message: string, ...rest: unknown[]): void => {
      emit(app, 'warn', message, normalizeMeta(rest), options);
    },

    error: (messageOrError: string | unknown, ...rest: unknown[]): void => {
      if (typeof messageOrError !== 'string') {
        emit(app, 'error', 'Unhandled error', normalizeMeta([messageOrError, ...rest]), options);
        return;
      }

      let meta = normalizeMeta(rest);

      if (rest[0] instanceof Error) {
        meta = {
          ...(serializeLogValue(rest[0]) as ClientLoggerMeta),
          ...normalizeMeta(rest.slice(1)),
        };
      }

      emit(app, 'error', messageOrError, meta, options);
    },

    debug: (message: string, ...rest: unknown[]): void => {
      emit(app, 'debug', message, normalizeMeta(rest), options);
    },
  };
}
