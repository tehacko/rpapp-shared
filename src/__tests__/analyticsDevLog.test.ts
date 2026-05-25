import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logAnalyticsDevError } from '../analyticsDevLog.js';

describe('logAnalyticsDevError', () => {
  const originalNodeEnv = process.env['NODE_ENV'];

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it('uses console.warn in production without PII payload expansion', () => {
    process.env['NODE_ENV'] = 'production';
    logAnalyticsDevError('ingest_failed', { status: 500 });
    expect(console.warn).toHaveBeenCalledWith('[analytics] ingest_failed', { status: 500 });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('uses console.error in non-production', () => {
    process.env['NODE_ENV'] = 'development';
    logAnalyticsDevError('ingest_failed', { status: 500 });
    expect(console.error).toHaveBeenCalledWith('[analytics] ingest_failed', { status: 500 });
  });
});
