import type { CSSProperties } from 'react';

export interface CatalogImagePlaceholderProps {
  label: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_STYLE: CSSProperties = {
  background: 'var(--color-surface-muted, #e8e8e8)',
  color: 'var(--color-text-muted, #6b7280)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function CatalogImagePlaceholder(props: CatalogImagePlaceholderProps): JSX.Element {
  const { label, className, style } = props;
  return (
    <div
      aria-label={label}
      className={className}
      role="img"
      style={{ ...DEFAULT_STYLE, ...style }}
    >
      <svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20">
        <rect fill="currentColor" height="14" opacity="0.2" rx="2" width="18" x="3" y="5" />
        <circle cx="9" cy="10" fill="currentColor" opacity="0.45" r="1.5" />
        <path d="M6 17l4-4 3 3 2-2 3 3H6z" fill="currentColor" opacity="0.55" />
      </svg>
    </div>
  );
}
