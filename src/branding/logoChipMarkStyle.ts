export type LogoChipMarkResolvedChrome = {
  readonly rim: { readonly show: boolean; readonly color: string };
  readonly background: { readonly show: boolean; readonly color: string };
};

/** Where the square mark appears — shadow treatment differs on login hero only. */
export type LogoChipMarkStyleVariant = 'orgPicker' | 'loginHero';

export type LogoChipMarkInlineStyle = Record<string, string>;

export type LogoChipMarkPartitionedStyles = {
  readonly shell: LogoChipMarkInlineStyle | undefined;
  readonly fill: LogoChipMarkInlineStyle | undefined;
};

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

/**
 * Rim (box-shadow) on the outer shell; background fill on an inner layer.
 * Prevents the background colour picker from appearing to recolour the rim when both are on.
 */
export function partitionLogoChipMarkStyle(
  resolved: LogoChipMarkResolvedChrome,
  variant: LogoChipMarkStyleVariant = 'orgPicker',
): LogoChipMarkPartitionedStyles {
  if (!resolved.background.show) {
    return { shell: buildLogoChipMarkStyle(resolved, variant), fill: undefined };
  }

  const fill: LogoChipMarkInlineStyle = {
    '--logo-chip-background': resolved.background.color,
    backgroundColor: 'var(--logo-chip-background)',
    backgroundImage: 'none',
  };

  if (!resolved.rim.show) {
    return { shell: undefined, fill };
  }

  return {
    shell: buildLogoChipMarkStyle(
      {
        rim: resolved.rim,
        background: { show: false, color: resolved.background.color },
      },
      variant,
    ),
    fill,
  };
}

/** Partition a combined {@link buildLogoChipMarkStyle} result when background is enabled. */
export function partitionLogoChipMarkInlineStyle(
  style: LogoChipMarkInlineStyle | undefined,
  showBackground: boolean,
): LogoChipMarkPartitionedStyles {
  if (!style || !showBackground) {
    return { shell: style, fill: undefined };
  }

  const fill: LogoChipMarkInlineStyle = {};
  if (style['--logo-chip-background'] != null) {
    fill['--logo-chip-background'] = style['--logo-chip-background'];
  }
  if (style.backgroundColor != null) {
    fill.backgroundColor = style.backgroundColor;
  }
  if (style.backgroundImage != null) {
    fill.backgroundImage = style.backgroundImage;
  }

  const shell: LogoChipMarkInlineStyle = { ...style };
  delete shell['--logo-chip-background'];
  delete shell.backgroundColor;
  delete shell.backgroundImage;

  const hasShell =
    shell.boxShadow != null
    || shell['--logo-chip-rim'] != null;

  return {
    shell: hasShell ? shell : undefined,
    fill,
  };
}
