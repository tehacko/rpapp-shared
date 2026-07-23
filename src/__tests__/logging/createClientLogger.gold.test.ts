import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createClientLogger } from '../../logging/createClientLogger.js';

describe('createClientLogger (gold)', () => {
  const originalEnv = process.env['NODE_ENV'];
  let errorSpy: jest.SpiedFunction<typeof console.error>;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalEnv;
    errorSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('flattens meta into production JSON entry (no nested meta key)', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'rpapp-admin' });
    logger.info('hello', { operation: 'checkout', feature: 'pay' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed['message']).toBe('hello');
    expect(parsed['app']).toBe('rpapp-admin');
    expect(parsed['level']).toBe('info');
    expect(parsed['operation']).toBe('checkout');
    expect(parsed['feature']).toBe('pay');
    expect(parsed['meta']).toBeUndefined();
    expect(logSpy.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ operation: 'checkout', feature: 'pay' })
    );
  });

  it('flattens meta into production JSON entry for rpapp-pickup (no nested meta key)', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'rpapp-pickup' });
    logger.info('hello', { operation: 'fulfill', feature: 'pickup' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed['message']).toBe('hello');
    expect(parsed['app']).toBe('rpapp-pickup');
    expect(parsed['level']).toBe('info');
    expect(parsed['operation']).toBe('fulfill');
    expect(parsed['feature']).toBe('pickup');
    expect(parsed['meta']).toBeUndefined();
    expect(logSpy.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ operation: 'fulfill', feature: 'pickup' })
    );
  });

  it('maps non-string error() to Unhandled error', () => {
    process.env['NODE_ENV'] = 'development';
    const logger = createClientLogger({ app: 'rpapp-admin' });
    const err = new Error('boom');
    logger.error(err);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain('Unhandled error');
    const metaArg = errorSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    // Error.message is relocated — reserved `message` must not overwrite flat entry
    expect(metaArg['logContext']).toBe('boom');
    expect(metaArg['name']).toBe('Error');
  });

  it('relocates reserved message key to logContext', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'rpapp-admin' });
    logger.warn('outer', { message: 'inner-context', operation: 'x' });

    const line = String(warnSpy.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed['message']).toBe('outer');
    expect(parsed['logContext']).toBe('inner-context');
    expect(parsed['operation']).toBe('x');
  });

  it('strips reserved app/level/timestamp keys from meta', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'gold-app' });
    logger.info('keep', {
      app: 'spoof',
      level: 'error',
      timestamp: 'fake',
      environment: 'spoof-env',
      operation: 'ok',
    });

    const line = String(logSpy.mock.calls[0]?.[0]);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed['app']).toBe('gold-app');
    expect(parsed['level']).toBe('info');
    expect(parsed['environment']).toBe('production');
    expect(parsed['operation']).toBe('ok');
    expect(typeof parsed['timestamp']).toBe('string');
    expect(parsed['timestamp']).not.toBe('fake');
  });

  it('gates debug to development/test only', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'rpapp-admin' });
    logger.debug('secret-debug', { operation: 'x' });
    expect(logSpy).not.toHaveBeenCalled();

    process.env['NODE_ENV'] = 'development';
    logger.debug('dev-debug', { operation: 'y' });
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('redacts secrets in production message and meta', () => {
    process.env['NODE_ENV'] = 'production';
    const logger = createClientLogger({ app: 'rpapp-admin' });
    logger.error('failed buyer@example.com', {
      token: 'super-secret',
      operation: 'pay',
    });

    const line = String(errorSpy.mock.calls[0]?.[0]);
    expect(line).not.toContain('buyer@example.com');
    expect(line).not.toContain('super-secret');
    const metaArg = errorSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(metaArg['token']).toBe('[REDACTED]');
  });
});
