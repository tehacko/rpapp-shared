/**
 * Module-scoped client logger — merges scope into meta like admin `createAppLogger`.
 */

import type { ClientLogger, ClientLoggerMeta } from './logSchema.js';

export interface ClientLoggerScope {
  readonly module?: string;
  readonly feature?: string;
  readonly operation?: string;
}

export type ScopedClientLogger = ClientLogger;

function mergeScope(scope: ClientLoggerScope, rest: unknown[]): unknown[] {
  if (rest.length === 0) {
    return [scope];
  }
  const first = rest[0];
  if (
    typeof first === 'object' &&
    first !== null &&
    !Array.isArray(first) &&
    !(first instanceof Error)
  ) {
    return [{ ...scope, ...(first as ClientLoggerMeta) }, ...rest.slice(1)];
  }
  return [scope, ...rest];
}

/**
 * Wraps a base client logger so every call includes the given scope fields.
 */
export function createScopedLogger(
  base: ClientLogger,
  scope: ClientLoggerScope
): ScopedClientLogger {
  return {
    info: (message, ...rest) => {
      base.info(message, ...mergeScope(scope, rest));
    },
    warn: (message, ...rest) => {
      base.warn(message, ...mergeScope(scope, rest));
    },
    error: (messageOrError, ...rest) => {
      base.error(messageOrError, ...mergeScope(scope, rest));
    },
    debug: (message, ...rest) => {
      base.debug(message, ...mergeScope(scope, rest));
    },
  };
}
