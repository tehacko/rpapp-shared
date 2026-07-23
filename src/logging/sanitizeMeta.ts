/**
 * Strip reserved flat-entry keys from client log metadata
 * (port of backend `sanitizeMetaForLogEntry`).
 */

import {
  RESERVED_CLIENT_LOG_ENTRY_KEYS,
  type ClientLoggerMeta,
} from './logSchema.js';

const RESERVED_LOG_ENTRY_KEYS = new Set<string>(RESERVED_CLIENT_LOG_ENTRY_KEYS);

/**
 * Removes reserved keys that would collide with the flat log entry shape.
 * A reserved `message` value is relocated to `logContext`.
 */
export function sanitizeMetaForLogEntry(
  meta: ClientLoggerMeta | Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!meta) {
    return undefined;
  }
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (RESERVED_LOG_ENTRY_KEYS.has(key)) {
      if (key === 'message') {
        safe['logContext'] = value;
      }
      continue;
    }
    safe[key] = value;
  }
  return Object.keys(safe).length > 0 ? safe : undefined;
}
