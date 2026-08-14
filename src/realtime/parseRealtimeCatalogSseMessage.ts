/**
 * Shared realtime catalog SSE envelope unwrap (kiosk + customer).
 *
 * Backend SSEService wraps events as `{ eventId, eventVersion, eventType, payload, checksum, … }`.
 * Fail-closed: unsupported version or bad checksum → drop.
 * product_update unwrap: when `payload.type` is a string, use payload as the normalized message.
 */

import {
  isRealtimeEnvelope,
  isSupportedRealtimeEnvelopeVersion,
  REALTIME_SSE_VALIDATION_CODES,
  verifyEnvelopeChecksum,
  type RealtimeEnvelope,
} from './realtimeEnvelope.js';

export type ParseRealtimeCatalogSseStatus = 'ok' | 'passthrough' | 'drop' | 'invalid_json';

export interface ParseRealtimeCatalogSseOk {
  readonly status: 'ok';
  readonly message: Record<string, unknown>;
  readonly envelope: RealtimeEnvelope;
}

export interface ParseRealtimeCatalogSsePassthrough {
  readonly status: 'passthrough';
  readonly message: unknown;
}

export interface ParseRealtimeCatalogSseDrop {
  readonly status: 'drop';
  readonly code?: (typeof REALTIME_SSE_VALIDATION_CODES)[keyof typeof REALTIME_SSE_VALIDATION_CODES];
}

export interface ParseRealtimeCatalogSseInvalidJson {
  readonly status: 'invalid_json';
}

export type ParseRealtimeCatalogSseResult =
  | ParseRealtimeCatalogSseOk
  | ParseRealtimeCatalogSsePassthrough
  | ParseRealtimeCatalogSseDrop
  | ParseRealtimeCatalogSseInvalidJson;

/**
 * Unwrap a parsed JSON value that may be a realtime envelope.
 * Non-envelopes pass through unchanged.
 */
export function unwrapRealtimeCatalogSsePayload(parsed: unknown): ParseRealtimeCatalogSseResult {
  if (!isRealtimeEnvelope(parsed)) {
    return { status: 'passthrough', message: parsed };
  }

  if (!isSupportedRealtimeEnvelopeVersion(parsed)) {
    return {
      status: 'drop',
      code: REALTIME_SSE_VALIDATION_CODES.UNSUPPORTED_VERSION,
    };
  }

  if (!verifyEnvelopeChecksum(parsed)) {
    return {
      status: 'drop',
      code: REALTIME_SSE_VALIDATION_CODES.CHECKSUM_MISMATCH,
    };
  }

  const payload = parsed.payload;
  if (typeof payload['type'] === 'string') {
    return { status: 'ok', message: payload, envelope: parsed };
  }

  const salesPointId = payload['salesPointId'];
  const message: Record<string, unknown> = {
    type: parsed.eventType,
    updateType: parsed.eventType,
    data: payload,
    timestamp: parsed.emittedAt,
  };
  if (typeof salesPointId === 'number') {
    message.kioskId = salesPointId;
  }

  return { status: 'ok', message, envelope: parsed };
}

/**
 * Parse raw EventSource `data` and unwrap realtime envelopes for catalog handlers.
 */
export function parseRealtimeCatalogSseMessage(rawData: string): ParseRealtimeCatalogSseResult {
  if (typeof rawData !== 'string' || rawData.trim().length === 0) {
    return { status: 'passthrough', message: rawData };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData.trim());
  } catch {
    return { status: 'invalid_json' };
  }

  return unwrapRealtimeCatalogSsePayload(parsed);
}

/**
 * Customer EventSource detail helper: return JSON string of unwrapped message,
 * original raw for non-envelopes, or empty string when fail-closed drop / bad JSON.
 */
export function normalizeRealtimeCatalogSseEventData(rawData: string): string {
  const result = parseRealtimeCatalogSseMessage(rawData);
  if (result.status === 'ok') {
    return JSON.stringify(result.message);
  }
  if (result.status === 'passthrough') {
    return typeof result.message === 'string' ? result.message : rawData;
  }
  return '';
}
