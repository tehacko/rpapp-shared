import type { ReactNode } from 'react';

/**
 * CMP-0026 Breadcrumbs — linear trail; last crumb is current (non-link).
 */

export interface BreadcrumbItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

export interface BreadcrumbsProps {
  readonly items: readonly BreadcrumbItem[];
  readonly ariaLabel?: string;
  readonly separator?: ReactNode;
  readonly className?: string;
  readonly testId?: string;
}

export function Breadcrumbs({
  items,
  ariaLabel = 'Breadcrumb',
  separator = '/',
  className,
  testId = 'breadcrumbs',
}: BreadcrumbsProps): JSX.Element {
  return (
    <nav aria-label={ariaLabel} className={className} data-testid={testId}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.id} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <span className="text-[var(--color-on-surface-muted,var(--color-an-text-muted))]" aria-hidden="true">
                  {separator}
                </span>
              ) : null}
              {isLast || (!item.href && !item.onClick) ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-[var(--color-on-surface,var(--color-an-text))]"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-[var(--color-action-primary,var(--color-an-primary))] underline-offset-2 hover:underline"
                  onClick={
                    item.onClick
                      ? (event) => {
                          event.preventDefault();
                          item.onClick?.();
                        }
                      : undefined
                  }
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
