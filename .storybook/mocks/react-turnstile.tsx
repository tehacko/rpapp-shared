import { forwardRef, useImperativeHandle } from 'react';

export interface TurnstileInstance {
  execute: () => void;
  reset: () => void;
  remove: () => void;
  render: () => string;
  getResponse: () => string | undefined;
  isExpired: () => boolean;
}

interface MockTurnstileProps {
  readonly siteKey: string;
  readonly onSuccess?: (token: string) => void;
  readonly onExpire?: () => void;
  readonly onError?: () => void;
  readonly options?: Record<string, unknown>;
}

export const Turnstile = forwardRef<TurnstileInstance, MockTurnstileProps>(function MockTurnstile(
  { siteKey, onSuccess },
  ref
) {
  useImperativeHandle(ref, () => ({
    execute: () => {
      onSuccess?.('mock-turnstile-token');
    },
    reset: () => undefined,
    remove: () => undefined,
    render: () => 'mock-widget-id',
    getResponse: () => 'mock-turnstile-token',
    isExpired: () => false,
  }));

  return (
    <div
      role="presentation"
      data-testid="storybook-mock-turnstile"
      data-site-key={siteKey}
      style={{
        padding: '0.5rem',
        border: '1px dashed #94a3b8',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        color: '#475569',
      }}
    >
      Turnstile (storybook mock)
    </div>
  );
});
