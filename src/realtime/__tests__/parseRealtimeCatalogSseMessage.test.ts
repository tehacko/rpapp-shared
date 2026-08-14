import { describe, expect, it } from '@jest/globals';
import { sha256Hex } from '../realtimeEnvelope.js';
import {
  normalizeRealtimeCatalogSseEventData,
  parseRealtimeCatalogSseMessage,
} from '../parseRealtimeCatalogSseMessage.js';

function buildEnvelope(input: {
  eventVersion: number;
  payload: Record<string, unknown>;
  checksum?: string;
  eventType?: string;
}): string {
  const checksum = input.checksum ?? sha256Hex(JSON.stringify(input.payload));
  return JSON.stringify({
    eventId: 'evt-1',
    eventVersion: input.eventVersion,
    eventType: input.eventType ?? 'inventory_update',
    tenantId: 1,
    aggregateId: 'salesPoint:1',
    sequence: 1,
    emittedAt: '2026-07-09T00:00:00.000Z',
    payload: input.payload,
    checksum,
  });
}

describe('parseRealtimeCatalogSseMessage realtime envelope contract', () => {
  it('accepts supported version with valid checksum', () => {
    const parsed = parseRealtimeCatalogSseMessage(
      buildEnvelope({ eventVersion: 1, payload: { salesPointId: 1, updateType: 'inventory_update' } }),
    );
    expect(parsed.status).toBe('ok');
    if (parsed.status !== 'ok') {
      return;
    }
    expect(parsed.message.type).toBe('inventory_update');
  });

  it('unwraps product_update envelopes to the original catalog contract', () => {
    const inner = {
      type: 'product_update',
      updateType: 'inventory_updated',
      data: { productId: 9, salesPointId: 7, quantityInStock: 20, active: true },
      timestamp: '2026-07-09T00:00:00.000Z',
    };
    const parsed = parseRealtimeCatalogSseMessage(buildEnvelope({ eventVersion: 1, payload: inner }));
    expect(parsed.status).toBe('ok');
    if (parsed.status !== 'ok') {
      return;
    }
    expect(parsed.message.type).toBe('product_update');
    expect(parsed.message.updateType).toBe('inventory_updated');
    expect(parsed.message.data).toEqual(inner.data);
  });

  it('rejects unsupported event version', () => {
    const parsed = parseRealtimeCatalogSseMessage(
      buildEnvelope({ eventVersion: 2, payload: { salesPointId: 1, updateType: 'inventory_update' } }),
    );
    expect(parsed.status).toBe('drop');
    if (parsed.status === 'drop') {
      expect(parsed.code).toBe('STREAM_UNSUPPORTED_VERSION');
    }
  });

  it('rejects checksum mismatch', () => {
    const parsed = parseRealtimeCatalogSseMessage(
      buildEnvelope({
        eventVersion: 1,
        payload: { salesPointId: 1, updateType: 'inventory_update' },
        checksum: 'tampered',
      }),
    );
    expect(parsed.status).toBe('drop');
    if (parsed.status === 'drop') {
      expect(parsed.code).toBe('STREAM_CHECKSUM_MISMATCH');
    }
  });

  it('passes through legacy product_update messages', () => {
    const legacy = {
      type: 'product_update',
      updateType: 'product_created',
      data: { productId: 12 },
    };
    const parsed = parseRealtimeCatalogSseMessage(JSON.stringify(legacy));
    expect(parsed.status).toBe('passthrough');
    if (parsed.status === 'passthrough') {
      expect(parsed.message).toEqual(legacy);
    }
  });
});

describe('normalizeRealtimeCatalogSseEventData', () => {
  it('returns JSON of unwrapped product_update payload', () => {
    const inner = {
      type: 'product_update',
      updateType: 'inventory_updated',
      data: { productId: 99, salesPointId: 7, quantityInStock: 20, active: true },
      timestamp: '2026-08-14T08:00:00.000Z',
    };
    const envelope = buildEnvelope({ eventVersion: 1, payload: inner });
    expect(JSON.parse(normalizeRealtimeCatalogSseEventData(envelope))).toEqual(inner);
  });

  it('fail-closed returns empty string on bad checksum', () => {
    const envelope = buildEnvelope({
      eventVersion: 1,
      payload: { type: 'product_update', updateType: 'inventory_updated', data: {} },
      checksum: 'bad',
    });
    expect(normalizeRealtimeCatalogSseEventData(envelope)).toBe('');
  });
});
