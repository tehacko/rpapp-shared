/**
 * CMP-0014 Skeleton — pulse placeholders.
 */
export interface SkeletonProps {
  readonly className?: string;
  readonly 'aria-label'?: string;
  readonly testId?: string;
}

export function Skeleton({
  className,
  'aria-label': ariaLabel = 'Loading',
  testId = 'skeleton',
}: SkeletonProps): JSX.Element {
  return (
    <div
      className={[
        'animate-pulse rounded-md bg-[var(--color-border,var(--color-an-border))] motion-reduce:animate-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy="true"
      aria-label={ariaLabel}
      data-testid={testId}
    />
  );
}

const SKELETON_TEXT_KEYS = ['sk-text-1', 'sk-text-2', 'sk-text-3', 'sk-text-4', 'sk-text-5'] as const;

export interface SkeletonTextProps {
  readonly lines?: number;
  readonly className?: string;
}

export function SkeletonText({ lines = 2, className }: SkeletonTextProps): JSX.Element {
  const count = Math.min(Math.max(lines, 1), SKELETON_TEXT_KEYS.length);
  const keys = SKELETON_TEXT_KEYS.slice(0, count);

  return (
    <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')} aria-busy="true">
      {keys.map((key, index) => (
        <Skeleton
          key={key}
          className={['h-3', index === keys.length - 1 ? 'w-2/3' : 'w-full'].join(' ')}
        />
      ))}
    </div>
  );
}
