/**
 * CMP-0013 Loader — spinner alias.
 */
export interface LoaderProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly label?: string;
  readonly className?: string;
  readonly testId?: string;
}

const SIZE_CLASS: Record<NonNullable<LoaderProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Loader({
  size = 'md',
  label = 'Loading',
  className,
  testId = 'loader',
}: LoaderProps): JSX.Element {
  return (
    <div
      className={['inline-flex flex-col items-center gap-2', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid={testId}
    >
      <span
        className={[
          'inline-block animate-spin rounded-full border-solid',
          'border-[var(--color-border,var(--color-an-border))]',
          'border-t-[var(--color-action-primary,var(--color-an-primary))]',
          SIZE_CLASS[size],
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Spinner alias for CMP-0013. */
export const Spinner = Loader;
