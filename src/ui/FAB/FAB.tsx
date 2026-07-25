import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * CMP-0024 FAB — floating action button.
 */
export type FABProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  readonly icon: ReactNode;
  readonly label: string;
  readonly position?: 'bottom-right' | 'bottom-left';
};

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, label, position = 'bottom-right', className, type = 'button', ...rest }, ref) => {
    const positionClass =
      position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4';

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={[
          'fixed z-40 inline-flex h-14 w-14 items-center justify-center rounded-full',
          'bg-[var(--color-action-primary,var(--color-an-primary))] text-white shadow-lg',
          'hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-[var(--color-focus-ring,var(--color-an-primary))]',
          'disabled:cursor-not-allowed disabled:opacity-55',
          positionClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid="fab"
        {...rest}
      >
        {icon}
      </button>
    );
  },
);
FAB.displayName = 'FAB';
