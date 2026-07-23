import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('setSentryCorrelationId', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('calls Sentry.setTag(correlationId) after initSentry', async () => {
    const setTag = jest.fn();
    jest.doMock('@sentry/react', () => ({
      init: jest.fn(),
      setTag,
      captureException: jest.fn(),
      withScope: jest.fn((cb: (scope: { setTag: typeof setTag }) => void) => {
        cb({ setTag });
      }),
    }));

    const { initSentry, setSentryCorrelationId, isSentryInitialized } = await import(
      '../initSentry.js'
    );

    initSentry({
      app: 'customer',
      isProd: true,
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      environment: 'test',
    });

    expect(isSentryInitialized()).toBe(true);
    setSentryCorrelationId('corr-test-1');
    expect(setTag).toHaveBeenCalledWith('correlationId', 'corr-test-1');
  });

  it('no-ops setTag when Sentry is not initialized', async () => {
    const setTag = jest.fn();
    jest.doMock('@sentry/react', () => ({
      init: jest.fn(),
      setTag,
      captureException: jest.fn(),
    }));

    const { setSentryCorrelationId, isSentryInitialized } = await import('../initSentry.js');
    expect(isSentryInitialized()).toBe(false);
    setSentryCorrelationId('corr-ignored');
    expect(setTag).not.toHaveBeenCalled();
  });
});
