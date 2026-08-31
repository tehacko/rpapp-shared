export type LogoChipMarkResolvedChrome = {
  readonly rim: { readonly show: boolean; readonly color: string };
  readonly background: { readonly show: boolean; readonly color: string };
};

/** Where the square mark appears — shadow treatment differs on login hero only. */
export type LogoChipMarkStyleVariant = 'orgPicker' | 'loginHero';

export type LogoChipMarkInlineStyle = Record<string, string>;

/**
 * Inline styles for logo chip rim + background fill.
 * SSOT for admin org picker, login hero, and branding previews.
 */
export function buildLogoChipMarkStyle(
  resolved: LogoChipMarkResolvedChrome,
  variant: LogoChipMarkStyleVariant = 'orgPicker',
): LogoChipMarkInlineStyle | undefined {
  const showRim = resolved.rim.show;
  const showBackground = resolved.background.show;
  if (!showRim && !showBackground) {
    return undefined;
  }

  const style: LogoChipMarkInlineStyle = {};
  if (showRim) {
    style['--logo-chip-rim'] = resolved.rim.color;
    style.boxShadow =
      variant === 'loginHero'
        ? '0 0 0 1px var(--logo-chip-rim), 0 4px 12px rgba(0,0,0,0.16)'
        : '0 0 0 1px var(--logo-chip-rim)';
  }
  if (showBackground) {
    style['--logo-chip-background'] = resolved.background.color;
    style.backgroundColor = 'var(--logo-chip-background)';
    style.backgroundImage = 'none';
  }
  return style;
}
