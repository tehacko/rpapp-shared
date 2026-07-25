import {
  createElement,
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from '../tvShim.js';

/**
 * Shared Typography atom (CMP-0022).
 * Size/weight from brand-bridge type scale; line-height = unitless Size/line multipliers.
 * Display XL is forbidden — no `displayXl` variant.
 */

const typography = tv({
  base: 'font-[family-name:var(--font-family-primary)] m-0',
  variants: {
    variant: {
      display:
        'text-[length:var(--font-size-display)] leading-[1.2] font-[number:var(--font-weight-bold)]',
      h1: 'text-[length:var(--font-size-h1)] leading-[1.25] font-[number:var(--font-weight-bold)]',
      h2: 'text-[length:var(--font-size-h2)] leading-[1.2857] font-[number:var(--font-weight-bold)]',
      h3: 'text-[length:var(--font-size-h3)] leading-[1.3333] font-[number:var(--font-weight-bold)]',
      h4: 'text-[length:var(--font-size-h4)] leading-[1.4] font-[number:var(--font-weight-semibold)]',
      bodyLg:
        'text-[length:var(--font-size-body-lg)] leading-[1.5556] font-[number:var(--font-weight-regular)]',
      body: 'text-[length:var(--font-size-body)] leading-[1.5] font-[number:var(--font-weight-regular)]',
      bodySm:
        'text-[length:var(--font-size-body-sm)] leading-[1.4286] font-[number:var(--font-weight-regular)]',
      caption:
        'text-[length:var(--font-size-caption)] leading-[1.3333] font-[number:var(--font-weight-regular)]',
      label:
        'text-[length:var(--font-size-label)] leading-[1.4286] font-[number:var(--font-weight-semibold)]',
      button:
        'text-[length:var(--font-size-button)] leading-[1.4286] font-[number:var(--font-weight-semibold)]',
      overline:
        'text-[length:var(--font-size-overline)] leading-[1.3333] font-[number:var(--font-weight-semibold)] uppercase tracking-[0.06em]',
      mono: [
        'text-[length:var(--font-size-mono)] leading-[1.5385] font-[number:var(--font-weight-regular)]',
        'font-[family-name:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace]',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type TypographyVariants = VariantProps<typeof typography>;

export type TypographyVariant = NonNullable<TypographyVariants['variant']>;

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  display: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  bodyLg: 'p',
  body: 'p',
  bodySm: 'p',
  caption: 'span',
  label: 'span',
  button: 'span',
  overline: 'span',
  mono: 'code',
};

export type TypographyProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  readonly variant?: TypographyVariant;
  readonly as?: ElementType;
  readonly children?: ReactNode;
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', as, className, children, ...rest }, ref) => {
    const Component = as ?? DEFAULT_ELEMENT[variant];
    return createElement(
      Component,
      {
        ref,
        className: typography({ variant, className }),
        ...rest,
      },
      children
    );
  }
);

Typography.displayName = 'Typography';
