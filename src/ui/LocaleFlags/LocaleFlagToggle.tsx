import { tv } from '../tvShim.js';
import type { LocaleFlagOption } from './localeFlagRegistry.js';

export type LocaleFlagToggleSurface = 'admin' | 'kiosk' | 'customer' | 'pickup';
export type LocaleFlagTogglePlacement = 'floating' | 'inline' | 'header';

const flagGroup = tv({
  base: 'inline-flex max-w-full shrink-0 items-center',
  variants: {
    placement: {
      floating: 'gap-2',
      /** Compact segmented track — w-fit so flex parents do not stretch it full-width. */
      inline: [
        'w-fit max-w-full flex-nowrap gap-0.5 self-start rounded-full',
        'border border-[var(--color-rail-card-border,var(--color-border,var(--color-neutral-200)))]',
        'bg-[var(--color-surface-muted,var(--color-an-surface-muted,#f4f4f5))] p-1 shadow-sm',
      ].join(' '),
      header: [
        'w-fit max-w-full flex-nowrap gap-0.5 self-start rounded-full',
        'border border-[var(--color-an-border,var(--color-border,var(--color-neutral-200)))]',
        'bg-[var(--color-an-surface-muted,var(--color-surface-muted,#f4f4f5))] p-1 shadow-none',
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
    // No overflow-hidden — SVGs self-clip; hiding overflow chops contrast rims.
    'inline-flex shrink-0 items-center justify-center rounded-full',
    // Always-on inset ring so white flag bands never melt into light sheets.
    // Use ring (not only shadow) — pressed variants must not erase contrast.
    'border border-black/25',
    'bg-[var(--color-surface-elevated,#fff)]',
    'ring-1 ring-inset ring-black/20',
    'transition-[opacity,filter,box-shadow,background-color,border-color,ring-color] duration-150',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  ].join(' '),
  variants: {
    placement: {
      floating: 'h-10 w-10',
      inline: 'h-9 w-9',
      header: 'h-9 w-9',
    },
    pressed: {
      true: 'opacity-100',
      false: 'opacity-40 grayscale-[0.55] hover:opacity-70 hover:grayscale-[0.2]',
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
      class: [
        'border-[var(--color-an-primary,var(--color-brand-primary))]',
        'bg-[var(--color-an-surface,var(--color-surface-elevated,#fff))]',
        'ring-2 ring-[var(--color-an-primary,var(--color-brand-primary))]/35',
      ].join(' '),
    },
    {
      surface: 'kiosk',
      pressed: true,
      class: [
        'border-[var(--color-accent,#2563eb)]',
        'bg-[var(--color-surface-elevated,#fff)]',
        'ring-2 ring-[var(--color-accent,#2563eb)]/35',
      ].join(' '),
    },
    {
      surface: 'customer',
      pressed: true,
      class: [
        'border-[var(--color-accent)]',
        'bg-[var(--color-surface-elevated,#fff)]',
        'ring-2 ring-[var(--color-accent)]/35',
      ].join(' '),
    },
    {
      surface: 'pickup',
      pressed: true,
      class: [
        'border-[var(--color-accent,#2563eb)]',
        'bg-[var(--color-surface-elevated,#fff)]',
        'ring-2 ring-[var(--color-accent,#2563eb)]/35',
      ].join(' '),
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
