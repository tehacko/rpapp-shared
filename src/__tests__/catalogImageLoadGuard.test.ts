import { afterEach, describe, expect, it } from '@jest/globals';
import {
  catalogImageFailureKey,
  clearCatalogImageLoadGuardForTests,
  isBrokenCatalogImageUrl,
  isCatalogImageSignatureExpired,
  noteCatalogImageLoadFailure,
} from '../catalogImageLoadGuard.js';

const UNEXPIRED_EXP = 4_102_444_800; // 2100-01-01
const FIXED_NOW_MS = 1_700_000_000_000;

afterEach(() => {
  clearCatalogImageLoadGuardForTests();
});

describe('catalogImageLoadGuard', () => {
  it('treats reminted sig/exp/v as the same broken identity', () => {
    const first =
      '/api/acme/v1/products/9/image?sig=aaa&exp=1&imageId=12&size=thumbnail';
    const reminted =
      '/api/acme/v1/products/9/image?sig=bbb&exp=999&imageId=12&size=thumbnail&v=3';
    expect(catalogImageFailureKey(first)).toBe(catalogImageFailureKey(reminted));
  });

  it('does not refresh when signed_api URL is missing exp, but still marks broken', () => {
    const url = '/api/acme/v1/products/9/image?sig=abc';
    expect(isCatalogImageSignatureExpired(url, FIXED_NOW_MS)).toBe(false);

    const first = noteCatalogImageLoadFailure(url, FIXED_NOW_MS);
    expect(first).toEqual({ refreshCatalog: false, emitTelemetry: true });
    expect(isBrokenCatalogImageUrl(url)).toBe(true);

    const reminted = `/api/acme/v1/products/9/image?sig=zzz&exp=${UNEXPIRED_EXP}`;
    expect(catalogImageFailureKey(url)).toBe(catalogImageFailureKey(reminted));
    expect(isBrokenCatalogImageUrl(reminted)).toBe(true);
    expect(noteCatalogImageLoadFailure(reminted, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: false,
    });
  });

  it('does not refresh when exp is non-numeric or <= 0', () => {
    const nonNumeric = '/api/acme/v1/products/9/image?sig=abc&exp=not-a-number';
    const zero = '/api/acme/v1/products/9/image?sig=abc&exp=0';
    const negative = '/api/acme/v1/products/9/image?sig=abc&exp=-5';

    expect(isCatalogImageSignatureExpired(nonNumeric, FIXED_NOW_MS)).toBe(false);
    expect(isCatalogImageSignatureExpired(zero, FIXED_NOW_MS)).toBe(false);
    expect(isCatalogImageSignatureExpired(negative, FIXED_NOW_MS)).toBe(false);

    expect(noteCatalogImageLoadFailure(nonNumeric, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: true,
    });
    clearCatalogImageLoadGuardForTests();

    expect(noteCatalogImageLoadFailure(zero, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: true,
    });
    clearCatalogImageLoadGuardForTests();

    expect(noteCatalogImageLoadFailure(negative, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: true,
    });
  });

  it('does not refresh on non-signed_api URLs that happen to carry exp', () => {
    const external = 'https://cdn.example/x.jpg?exp=1';
    expect(isCatalogImageSignatureExpired(external, FIXED_NOW_MS)).toBe(true);

    const result = noteCatalogImageLoadFailure(external, FIXED_NOW_MS);
    expect(result).toEqual({ refreshCatalog: false, emitTelemetry: true });
    expect(isBrokenCatalogImageUrl(external)).toBe(true);
  });

  it('keeps donation absolute URL identity stable across reminted sig/exp/v', () => {
    const first =
      'https://api.example.com/api/acme/v1/donation-projects/1/image?sig=a&exp=1';
    const reminted =
      `https://api.example.com/api/acme/v1/donation-projects/1/image?sig=bbb&exp=${UNEXPIRED_EXP}&v=3`;

    expect(catalogImageFailureKey(first)).toBe(catalogImageFailureKey(reminted));

    expect(noteCatalogImageLoadFailure(first, FIXED_NOW_MS)).toEqual({
      refreshCatalog: true,
      emitTelemetry: true,
    });
    // Expired URL stays hidden while remint is pending.
    expect(isBrokenCatalogImageUrl(first, FIXED_NOW_MS)).toBe(true);
    // Fresh reminted URL is allowed exactly once.
    expect(isBrokenCatalogImageUrl(reminted, FIXED_NOW_MS)).toBe(false);
  });

  it('does not refresh catalog on a still-valid signed 404 (loop / storm guard)', () => {
    const url = `/api/acme/v1/products/9/image?sig=abc&exp=${UNEXPIRED_EXP}`;
    const first = noteCatalogImageLoadFailure(url, FIXED_NOW_MS);
    expect(first).toEqual({ refreshCatalog: false, emitTelemetry: true });
    expect(isBrokenCatalogImageUrl(url)).toBe(true);

    const reminted = `/api/acme/v1/products/9/image?sig=zzz&exp=${UNEXPIRED_EXP + 60}`;
    const second = noteCatalogImageLoadFailure(reminted, FIXED_NOW_MS);
    expect(second).toEqual({ refreshCatalog: false, emitTelemetry: false });
    expect(isBrokenCatalogImageUrl(reminted)).toBe(true);
  });

  it('allows remint-once when signed_api HMAC exp is in the past, then terminals on second fail', () => {
    const expired = '/api/acme/v1/products/9/image?sig=abc&exp=1';
    const reminted = `/api/acme/v1/products/9/image?sig=zzz&exp=${UNEXPIRED_EXP}`;

    expect(noteCatalogImageLoadFailure(expired, FIXED_NOW_MS)).toEqual({
      refreshCatalog: true,
      emitTelemetry: true,
    });
    expect(isBrokenCatalogImageUrl(expired, FIXED_NOW_MS)).toBe(true);
    expect(isBrokenCatalogImageUrl(reminted, FIXED_NOW_MS)).toBe(false);

    // Second failure after remint → terminal; reminted URL stays broken.
    expect(noteCatalogImageLoadFailure(reminted, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: false,
    });
    expect(isBrokenCatalogImageUrl(reminted, FIXED_NOW_MS)).toBe(true);
    expect(noteCatalogImageLoadFailure(reminted, FIXED_NOW_MS)).toEqual({
      refreshCatalog: false,
      emitTelemetry: false,
    });
  });
});
