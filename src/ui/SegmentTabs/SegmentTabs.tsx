/**
 * CMP-0021 SegmentTabs — exclusive filter chrome (Radix-free; ≠ FilterChip).
 */

export interface SegmentTabItem {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

export type SegmentTabsVariant = 'default' | 'analytics' | 'sic';

export interface SegmentTabsProps {
  readonly tabs: readonly SegmentTabItem[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly idPrefix?: string;
  readonly variant?: SegmentTabsVariant;
  readonly testId?: string;
}

function tabListClass(variant: SegmentTabsVariant, className?: string): string {
  if (variant === 'analytics' || variant === 'sic') {
    return ['mb-4 flex flex-wrap gap-1', className ?? ''].filter(Boolean).join(' ');
  }
  return [
    'flex w-full flex-wrap gap-1 rounded-lg border border-[var(--color-border,var(--color-an-border))]',
    'bg-[var(--color-surface-muted,var(--color-an-bg))] p-1',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function tabClass(variant: SegmentTabsVariant, isActive: boolean): string {
  if (variant === 'analytics' || variant === 'sic') {
    return [
      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-[var(--color-an-primary,var(--color-action-primary))] text-white'
        : 'bg-[var(--color-an-surface,var(--color-surface))] text-[var(--color-an-text-muted,var(--color-on-surface-muted))] hover:text-[var(--color-an-text,var(--color-on-surface))]',
    ].join(' ');
  }
  return [
    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium',
    isActive
      ? 'bg-[var(--color-surface,var(--color-an-surface))] text-[var(--color-on-surface,var(--color-an-text))] shadow-sm'
      : 'text-[var(--color-on-surface-muted,var(--color-an-text-muted))] hover:text-[var(--color-on-surface,var(--color-an-text))]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-accent,var(--color-an-primary))]',
  ].join(' ');
}

function countClass(variant: SegmentTabsVariant, isActive: boolean): string {
  if ((variant === 'analytics' || variant === 'sic') && isActive) {
    return 'inline-flex min-w-[1.25rem] items-center justify-center rounded-md bg-white/20 px-1.5 text-xs font-semibold tabular-nums';
  }
  return [
    'inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums',
    'bg-[var(--color-surface,var(--color-an-surface-muted,var(--color-an-bg)))] text-[var(--color-on-surface-muted,var(--color-an-text-muted))]',
  ].join(' ');
}

export function SegmentTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel,
  className,
  idPrefix = 'segment',
  variant = 'default',
  testId = 'segment-tabs',
}: SegmentTabsProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={tabListClass(variant, className)}
      data-testid={testId}
      data-variant={variant}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const tabId = `${idPrefix}-tab-${tab.id}`;
        const panelId = `${idPrefix}-panel-${tab.id}`;
        return (
          <button
            key={tab.id}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            className={tabClass(variant, isActive)}
            data-testid={`${testId}-tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined ? (
                <span className={countClass(variant, isActive)}>{tab.count}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
