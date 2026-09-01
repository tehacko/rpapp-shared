import {
  DEFAULT_APP_COPYRIGHT_TEXT,
  resolveAppShellFooterBottomStyle,
} from '../appShellFooterLayout.js';

export interface AppShellChromeFooterProps {
  readonly versionLabel: string;
  readonly copyrightText?: string;
  readonly className?: string;
  /** Shell bottom chrome CSS variable (e.g. `--customer-bottom-chrome`) for offset above nav. */
  readonly bottomChromeVar?: string;
}

/**
 * Bottom shell chrome — centered copyright + subtle version stamp (bottom-right).
 */
export function AppShellChromeFooter({
  versionLabel,
  copyrightText = DEFAULT_APP_COPYRIGHT_TEXT,
  className,
  bottomChromeVar,
}: AppShellChromeFooterProps): JSX.Element | null {
  const version = versionLabel.trim();
  const copyright = copyrightText.trim();
  if (version.length === 0 && copyright.length === 0) {
    return null;
  }

  const bottomStyle = resolveAppShellFooterBottomStyle(bottomChromeVar);

  return (
    <>
      {copyright.length > 0 ? (
        <div
          className={[
            'pointer-events-none fixed inset-x-0 z-50 flex justify-center',
            'px-[max(0.25rem,env(safe-area-inset-left,0px))]',
            className ?? '',
          ].join(' ')}
          style={bottomStyle}
          data-testid="app-copyright-notice"
          aria-hidden="true"
        >
          <span className="select-none text-[10px] leading-none text-black dark:text-white">
            {copyright}
          </span>
        </div>
      ) : null}
      {version.length > 0 ? (
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
          {version}
        </div>
      ) : null}
    </>
  );
}
