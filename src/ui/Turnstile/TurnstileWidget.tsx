import { createElement } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { UseTurnstileAuthResult } from './useTurnstileAuth.js';

export interface TurnstileWidgetProps {
  readonly turnstile: Pick<
    UseTurnstileAuthResult,
    'required' | 'siteKey' | 'widgetKey' | 'setToken' | 'resetTurnstile' | 'isLoading'
  >;
  readonly loadingText?: string;
  readonly className?: string;
  readonly testId?: string;
}

export function TurnstileWidget({
  turnstile,
  loadingText,
  className,
  testId,
}: TurnstileWidgetProps): JSX.Element | null {
  if (!turnstile.required || turnstile.siteKey === null) {
    return null;
  }

  return createElement(
    'div',
    { className, 'data-testid': testId },
    createElement(Turnstile, {
      key: turnstile.widgetKey,
      siteKey: turnstile.siteKey,
      onSuccess: turnstile.setToken,
      onExpire: turnstile.resetTurnstile,
      onError: turnstile.resetTurnstile,
      options: { theme: 'auto', size: 'normal' },
    }),
    turnstile.isLoading && loadingText !== undefined
      ? createElement('p', { className: 'text-xs text-[var(--color-on-surface-muted)]' }, loadingText)
      : null
  );
}
