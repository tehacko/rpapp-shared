import { tv } from '../tvShim.js';
import type { LocaleFlagOption } from './localeFlagRegistry.js';

export type LocaleFlagToggleSurface = 'admin' | 'kiosk' | 'customer' | 'pickup';
export type LocaleFlagTogglePlacement = 'floating' | 'inline' | 'header';

const flagGroup = tv({
  base: 'inline-flex max-w-full shrink-0 items-center',
  variants: {
    placement: {
      floating: 'gap-2',
      inline: [
        'flex-wrap gap-1.5 rounded-md border border-[var(--color-rail-card-border,var(--color-border,var(--color-neutral-200)))]',
        'bg-[var(--color-surface-elevated,#fff)] p-1.5 shadow-sm',
      ].join(' '),
      header: [
        'flex-wrap gap-1.5 rounded-full border border-[var(--color-an-border,var(--color-border,var(--color-neutral-200)))]',
        'bg-[var(--color-an-surface,var(--color-surface-elevated,#fff))] p-1.5 shadow-none',
      ].join(' '),
    },
    surface: {
      admin: '',
      kiosk: '',
      customer: '',
      pickup: '',
    },
  },
  compoundVariants: [
    {
      surface: 'admin',
      placement: 'floating',
      class: [
        'fixed top-[var(--spacing-4,1rem)] right-[var(--spacing-4,1rem)] z-[10001]',
        'rounded-[var(--radius-lg,0.5rem)] border border-[var(--color-border,var(--color-neutral-200))]',
        'bg-[var(--color-surface-elevated,#fff)] p-1.5 shadow-[var(--shadow-md,0_4px_6px_-1px_rgb(0_0_0_/_0.1))]',
      ].join(' '),
    },
    {
      surface: 'kiosk',
      placement: 'floating',
      class: [
        'fixed top-[var(--spacing-10)] right-[var(--spacing-10)] z-[var(--z-modal-backdrop)]',
        'rounded-[var(--radius-xl)] border border-[var(--color-border,var(--color-neutral-200))]',
        'bg-[var(--color-surface-elevated,#fff)] p-2 shadow-[var(--shadow-lg)]',
      ].join(' '),
    },
    {
      surface: 'customer',
      placement: 'floating',
      class: [
        'fixed top-2.5 right-2.5 z-50 rounded-xl border border-[var(--color-border)]',
        'bg-[var(--color-surface-elevated)] p-1.5 shadow-lg',
      ].join(' '),
    },
    {
      surface: 'pickup',
      placement: 'floating',
      class: [
        'fixed top-2.5 right-2.5 z-50 rounded-xl border border-[var(--color-border,var(--color-neutral-200))]',
        'bg-[var(--color-surface-elevated,#fff)] p-1.5 shadow-lg',
      ].join(' '),
    },
  ],
  defaultVariants: {
    placement: 'floating',
    surface: 'customer',
  },
});

const flagButton = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    'border-2 border-transparent transition-all duration-150',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  ].join(' '),
  variants: {
    placement: {
      floating: 'h-10 w-10',
      inline: 'h-9 w-9',
      header: 'h-9 w-9',
    },
    pressed: {
      true: 'opacity-100 shadow-sm',
      false: 'opacity-75 hover:opacity-100',
    },
    surface: {
      admin: 'focus-visible:outline-[var(--color-an-primary,var(--color-brand-primary))]',
      kiosk: 'focus-visible:outline-[var(--color-accent,#2563eb)]',
      customer: 'focus-visible:outline-[var(--color-accent)]',
      pickup: 'focus-visible:outline-[var(--color-accent,#2563eb)]',
    },
  },
  compoundVariants: [
    {
      surface: 'admin',
      pressed: true,
      class: 'border-[var(--color-an-primary,var(--color-brand-primary))] ring-2 ring-[var(--color-an-primary,var(--color-brand-primary))]/25',
    },
    {
      surface: 'kiosk',
      pressed: true,
      class: 'border-[var(--color-accent,#2563eb)] ring-2 ring-[var(--color-accent,#2563eb)]/25',
    },
    {
      surface: 'customer',
      pressed: true,
      class: 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/25',
    },
    {
      surface: 'pickup',
      pressed: true,
      class: 'border-[var(--color-accent,#2563eb)] ring-2 ring-[var(--color-accent,#2563eb)]/25',
    },
  ],
  defaultVariants: {
    placement: 'floating',
    pressed: false,
    surface: 'customer',
  },
});

const flagSize = tv({
  variants: {
    placement: {
      floating: 'h-10 w-10',
      inline: 'h-9 w-9',
      header: 'h-9 w-9',
    },
  },
  defaultVariants: {
    placement: 'floating',
  },
});

export interface LocaleFlagToggleProps {
  readonly locales: readonly LocaleFlagOption[];
  readonly activeLocale: string;
  readonly onSelect: (code: string) => void;
  readonly getLabel: (code: string) => string;
  readonly groupLabel: string;
  readonly surface?: LocaleFlagToggleSurface;
  readonly placement?: LocaleFlagTogglePlacement;
  readonly dataTestId?: string;
}

export function LocaleFlagToggle({
  locales,
  activeLocale,
  onSelect,
  getLabel,
  groupLabel,
  surface = 'customer',
  placement = 'floating',
  dataTestId,
}: LocaleFlagToggleProps): JSX.Element {
  return (
    <div
      className={flagGroup({ surface, placement })}
      role="group"
      aria-label={groupLabel}
      data-testid={dataTestId}
    >
      {locales.map((locale) => {
        const Flag = locale.Flag;
        const isActive = locale.code === activeLocale;
        const label = getLabel(locale.code);

        return (
          <button
            key={locale.code}
            type="button"
            className={flagButton({ surface, placement, pressed: isActive })}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            onClick={() => {
              if (!isActive) {
                onSelect(locale.code);
              }
            }}
          >
            <Flag className={flagSize({ placement })} />
          </button>
        );
      })}
    </div>
  );
}
