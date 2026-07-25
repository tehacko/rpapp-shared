import type { ButtonHTMLAttributes } from 'react';

export interface FilterChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'onClick'> {
  readonly label: string;
  readonly selected?: boolean;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly testId?: string;
}

/**
 * CMP-0019 FilterChip — multi-select filter chip.
 * Exclusive filters → use SegmentTabs instead.
 * Selected state uses action.primary / surface-soft (not hard-coded brand-consumer).
 */
export function FilterChip({
  label,
  selected = false,
  onClick,
  disabled = false,
  className,
  testId = 'filter-chip',
  ...rest
}: FilterChipProps): JSX.Element {
  const selectedClasses = selected
    ? 'border-[var(--color-action-primary)] bg-[var(--color-surface-soft)] text-[var(--color-action-primary)]'
    : [
        'border-[var(--color-border-default)] bg-[var(--color-surface-default)]',
        'text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-100)]',
      ].join(' ');

  return (
    <button
      type="button"
      className={[
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 py-1.5',
        'text-[length:var(--font-size-body-sm)] font-[number:var(--font-weight-semibold)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--color-border-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-[var(--color-disabled-opacity,0.55)]',
        selectedClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      data-selected={selected ? 'true' : 'false'}
      {...rest}
    >
      {label}
    </button>
  );
}
