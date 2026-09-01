import type { CSSProperties } from 'react';
import { resolveAppShellFooterBottomStyle } from '../appShellFooterLayout.js';

export interface AppVersionCornerProps {
  readonly label: string;
  readonly className?: string;
  /** Shell bottom chrome CSS variable (e.g. `--customer-bottom-chrome`) for offset above nav. */
  readonly bottomChromeVar?: string;
}

/**
 * Subtle fixed version stamp — bottom-right, non-interactive, for support/debug.
 */
export function AppVersionCorner({
  label,
  className,
  bottomChromeVar,
}: AppVersionCornerProps): JSX.Element | null {
  const trimmed = label.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const bottomStyle: CSSProperties = resolveAppShellFooterBottomStyle(bottomChromeVar);

  return (
    <div
      className={[
        'pointer-events-none fixed right-[max(0.25rem,env(safe-area-inset-right,0px))] z-50',
        'select-none text-[10px] leading-none tabular-nums',
        'text-[var(--color-on-surface-muted,var(--color-gray-500,#6b7280))] opacity-40',
        className ?? '',
      ].join(' ')}
      style={bottomStyle}
      data-testid="app-version-corner"
      aria-hidden="true"
    >
      {trimmed}
    </div>
  );
}
