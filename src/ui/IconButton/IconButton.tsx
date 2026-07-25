import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from '../Icon/index.js';
import { Icon } from '../Icon/Icon.js';
import { tv, type VariantProps } from '../tvShim.js';

const iconButton = tv({
  base: [
    'inline-flex items-center justify-center rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border-default,var(--color-border))]',
    'bg-[var(--color-surface-default,var(--color-surface))] text-[var(--color-text-primary,var(--color-on-surface))]',
    'hover:bg-[var(--color-surface-hover,var(--color-neutral-100))]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-border-focus,var(--color-focus-ring))]',
    'disabled:cursor-not-allowed disabled:opacity-[var(--color-disabled-opacity,0.55)]',
  ].join(' '),
  variants: {
    tone: {
      default: '',
      danger: [
        'border-[var(--color-status-error,var(--color-danger))]',
        'text-[var(--color-status-error,var(--color-danger))]',
        'hover:bg-[var(--color-surface-soft,var(--color-danger-foreground))]',
      ].join(' '),
      muted: 'text-[var(--color-text-muted,var(--color-on-surface-muted))]',
    },
    size: {
      sm: 'h-9 w-9 min-h-9 min-w-9',
      md: 'h-11 w-11 min-h-11 min-w-11',
    },
  },
  defaultVariants: { tone: 'default', size: 'md' },
});

type IconButtonVariants = VariantProps<typeof iconButton>;

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> &
  IconButtonVariants & {
    readonly icon: LucideIcon;
    /** Required accessible name (visible label is icon-only). */
    readonly 'aria-label': string;
  };

/**
 * CMP-0018 IconButton — icon-only control with required `aria-label`.
 * Glyphs must come from the shared Lucide map (`pi-kiosk-shared/ui`), not app `lucide-react` imports.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tone, size, icon, type = 'button', ...rest }, ref): JSX.Element => (
    <button ref={ref} type={type} className={iconButton({ tone, size, className })} {...rest}>
      <Icon icon={icon} size={20} aria-hidden={true} />
    </button>
  ),
);
IconButton.displayName = 'IconButton';
