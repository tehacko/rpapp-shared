import { createElement } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { UseTurnstileExecuteResult } from './useTurnstileExecute.js';

export interface TurnstileExecuteWidgetProps {
  readonly turnstile: Pick<
    UseTurnstileExecuteResult,
    | 'required'
    | 'siteKey'
    | 'widgetKey'
    | 'isLoading'
    | 'isError'
    | 'turnstileRef'
    | 'onWidgetLoad'
    | 'onSuccess'
    | 'onExpire'
    | 'onError'
  >;
  readonly className?: string;
  readonly testId?: string;
}

/**
 * Execute-on-submit Turnstile — widget stays idle until `execute()` is called.
 */
export function TurnstileExecuteWidget({
  turnstile,
  className,
  testId,
}: TurnstileExecuteWidgetProps): JSX.Element | null {
  if (turnstile.isLoading) {
    return createElement('div', {
      className,
      'data-testid': testId,
      'aria-busy': 'true',
      'data-turnstile-state': 'loading',
    });
  }

  if (turnstile.isError) {
    return createElement('div', {
      className,
      'data-testid': testId,
      role: 'alert',
      'data-turnstile-state': 'error',
    });
  }

  if (!turnstile.required || turnstile.siteKey === null) {
    return null;
  }

  return createElement(
    'div',
    { className, 'data-testid': testId, 'data-turnstile-state': 'ready' },
    createElement(Turnstile, {
      ref: turnstile.turnstileRef,
      key: turnstile.widgetKey,
      siteKey: turnstile.siteKey,
      onWidgetLoad: turnstile.onWidgetLoad,
      onSuccess: turnstile.onSuccess,
      onExpire: turnstile.onExpire,
      onError: turnstile.onError,
      options: { execution: 'execute', appearance: 'interaction-only', theme: 'auto' },
    })
  );
}
