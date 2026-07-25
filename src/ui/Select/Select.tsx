import * as RadixSelect from '@radix-ui/react-select';
import { forwardRef, type ReactElement } from 'react';
import { tv, type VariantProps } from '../tvShim.js';

export type SelectSurface = 'admin' | 'customer' | 'kiosk' | 'pickup';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

const selectRecipe = tv({
  slots: {
    trigger: [
      'inline-flex min-h-[44px] min-w-[44px] items-center justify-between gap-2',
      'rounded-lg border px-3 text-left touch-manipulation',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
    ].join(' '),
    icon: 'h-4 w-4 shrink-0',
    content: 'z-50 overflow-hidden rounded-lg border shadow-lg',
    viewport: 'max-h-64 p-1',
    item: [
      'relative flex min-h-[44px] min-w-[44px] cursor-pointer select-none items-center',
      'rounded-md px-3 py-2 outline-none',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'data-[state=checked]:font-semibold',
    ].join(' '),
  },
  variants: {
    surface: {
      admin: {
        trigger: [
          'border-[var(--color-an-border)] bg-[var(--color-an-surface)]',
          'text-sm text-[var(--color-an-text)]',
          'focus-visible:outline-[var(--color-an-primary)]',
        ].join(' '),
        icon: 'text-[var(--color-an-text-muted)]',
        content:
          'border-[var(--color-an-border)] bg-[var(--color-an-surface)] text-[var(--color-an-text)]',
        item: [
          'text-sm text-[var(--color-an-text)]',
          'data-[highlighted]:bg-[var(--color-an-primary-soft)] data-[highlighted]:text-[var(--color-an-primary)]',
        ].join(' '),
      },
      customer: {
        trigger: [
          'border-[var(--color-border)] bg-[var(--color-surface)]',
          'text-base text-[var(--color-on-surface)]',
          'focus-visible:outline-[var(--color-focus-ring)]',
        ].join(' '),
        icon: 'text-[var(--color-on-surface-muted)]',
        content:
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]',
        item: [
          'text-sm text-[var(--color-on-surface)]',
          'data-[highlighted]:bg-[var(--brand-consumer-accent-soft)] data-[highlighted]:text-[var(--brand-consumer-accent)]',
        ].join(' '),
      },
      kiosk: {
        trigger: [
          'border-[var(--color-border)] bg-[var(--color-surface)]',
          'text-base text-[var(--color-on-surface)]',
          'focus-visible:outline-[var(--color-focus-ring)]',
        ].join(' '),
        icon: 'text-[var(--color-on-surface-muted)]',
        content:
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]',
        item: [
          'text-base text-[var(--color-on-surface)]',
          'data-[highlighted]:bg-[var(--color-surface-muted)] data-[highlighted]:text-[var(--color-on-surface)]',
        ].join(' '),
      },
      pickup: {
        trigger: [
          'border-[var(--color-border)] bg-[var(--color-surface)]',
          'text-sm text-[var(--color-on-surface)]',
          'focus-visible:outline-[var(--color-focus-ring)]',
        ].join(' '),
        icon: 'text-[var(--color-on-surface-muted)]',
        content: [
          'z-[var(--pickup-z-80,80)] border-[var(--color-border)]',
          'bg-[var(--color-surface)] text-[var(--color-on-surface)]',
        ].join(' '),
        item: [
          'text-sm text-[var(--color-on-surface)]',
          'data-[highlighted]:bg-[var(--brand-consumer-accent-soft)] data-[highlighted]:text-[var(--brand-consumer-accent)]',
        ].join(' '),
      },
    },
  },
  defaultVariants: {
    surface: 'customer',
  },
});

type SelectRecipeVariants = VariantProps<typeof selectRecipe>;

export interface SelectProps {
  readonly id?: string;
  readonly options: readonly SelectOption[];
  readonly value?: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly contentClassName?: string;
  readonly surface?: SelectSurface;
  readonly testId?: string;
  readonly itemTestIdPrefix?: string;
  readonly name?: string;
  readonly 'aria-busy'?: boolean;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
}

function ChevronIcon({ className }: { readonly className?: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Shared Select API (CMP-0005 / Q24=C).
 * Radix is an implementation detail — apps must not import `@radix-ui/react-select` for new UI.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    id,
    options,
    value,
    onValueChange,
    disabled = false,
    placeholder,
    className,
    triggerClassName,
    contentClassName,
    surface = 'customer',
    testId = 'select-trigger',
    itemTestIdPrefix,
    name,
    'aria-busy': ariaBusy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  },
  ref,
): ReactElement {
  const slots = selectRecipe({ surface: surface as SelectRecipeVariants['surface'] });
  const resolvedValue = value !== undefined && value !== '' ? value : undefined;

  return (
    <RadixSelect.Root
      value={resolvedValue}
      disabled={disabled || options.length === 0}
      name={name}
      onValueChange={onValueChange}
    >
      <RadixSelect.Trigger
        ref={ref}
        id={id}
        className={slots.trigger({ className: [triggerClassName, className].filter(Boolean).join(' ') })}
        data-testid={testId}
        aria-busy={ariaBusy || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronIcon className={slots.icon()} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={slots.content({ className: contentClassName })}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className={slots.viewport()}>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={slots.item()}
                data-testid={
                  itemTestIdPrefix !== undefined
                    ? `${itemTestIdPrefix}${option.value}`
                    : undefined
                }
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});

Select.displayName = 'Select';
