import type { LucideIcon, LucideProps } from 'lucide-react';
import { createElement } from 'react';

/** CMP-0012 Icon sizes — intermediate sizes forbidden. */
export const ICON_SIZES = [16, 20, 24, 32, 48, 64] as const;
export type IconSize = (typeof ICON_SIZES)[number];

export type IconProps = Omit<LucideProps, 'ref' | 'size' | 'strokeWidth'> & {
  readonly icon: LucideIcon;
  /** Pixel size from frozen scale (default 24). */
  readonly size?: IconSize;
  /** Lucide default stroke is 2 — keep unless an explicit override is required. */
  readonly strokeWidth?: number;
};

/**
 * Greenfield Lucide wrapper (CMP-0012).
 * Apps must import Lucide glyphs via `pi-kiosk-shared/ui` (this module), not `lucide-react`.
 * Payment provider marks stay on ProviderIcon.
 */
export function Icon({
  icon: LucideComp,
  size = 24,
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
  ...rest
}: IconProps): JSX.Element {
  return createElement(LucideComp, {
    size,
    strokeWidth,
    'aria-hidden': ariaHidden,
    ...rest,
  });
}
