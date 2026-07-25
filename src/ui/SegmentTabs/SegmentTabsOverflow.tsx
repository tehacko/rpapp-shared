import { useMemo, useState } from 'react';
import type { SegmentTabItem } from './SegmentTabs.js';

/**
 * CMP-0021 companion — overflow "+N" for dense admin tab rows (&lt;1024px).
 * Kept Radix-free; menu is a native details/summary pattern.
 */
export interface SegmentTabsOverflowProps {
  readonly visibleTabs: readonly SegmentTabItem[];
  readonly overflowTabs: readonly SegmentTabItem[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly ariaLabel?: string;
  readonly overflowLabel?: string;
  readonly idPrefix?: string;
  readonly className?: string;
}

export function SegmentTabsOverflow({
  visibleTabs,
  overflowTabs,
  activeId,
  onChange,
  ariaLabel,
  overflowLabel = '+ more',
  idPrefix = 'segment-overflow',
  className,
}: SegmentTabsOverflowProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const overflowActive = useMemo(
    () => overflowTabs.some((tab) => tab.id === activeId),
    [overflowTabs, activeId],
  );

  return (
    <div
      className={['mb-4 flex flex-wrap items-center gap-1', className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={ariaLabel}
      data-testid="segment-tabs-overflow"
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-an-primary,var(--color-action-primary))] text-white'
                : 'bg-[var(--color-an-surface,var(--color-surface))] text-[var(--color-an-text-muted,var(--color-on-surface-muted))]',
            ].join(' ')}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
      {overflowTabs.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            className={[
              'rounded-md px-2 py-1.5 text-sm font-medium',
              overflowActive
                ? 'bg-[var(--color-an-primary-soft,var(--color-surface-soft))] text-[var(--color-an-primary,var(--color-action-primary))]'
                : 'text-[var(--color-an-text-muted,var(--color-on-surface-muted))]',
            ].join(' ')}
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((prev) => !prev)}
            data-testid="segment-tabs-overflow-trigger"
          >
            {overflowLabel}
          </button>
          {open ? (
            <ul
              role="menu"
              className="absolute z-20 mt-1 min-w-[10rem] rounded-md border border-[var(--color-an-border,var(--color-border))] bg-[var(--color-an-surface,var(--color-surface))] p-1 shadow-md"
            >
              {overflowTabs.map((tab) => (
                <li key={tab.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[var(--color-an-bg,var(--color-surface-muted))]"
                    onClick={() => {
                      onChange(tab.id);
                      setOpen(false);
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
