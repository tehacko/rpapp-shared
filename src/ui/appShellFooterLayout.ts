import type { CSSProperties } from 'react';

export const DEFAULT_APP_COPYRIGHT_TEXT = '2026 © kupaber.cz';

export function resolveAppShellFooterBottomStyle(bottomChromeVar?: string): CSSProperties {
  if (bottomChromeVar !== undefined && bottomChromeVar.length > 0) {
    return {
      bottom: `calc(max(0.25rem, env(safe-area-inset-bottom, 0px)) + var(${bottomChromeVar}, 0px))`,
    };
  }
  return {
    bottom: 'max(0.25rem, env(safe-area-inset-bottom, 0px))',
  };
}
