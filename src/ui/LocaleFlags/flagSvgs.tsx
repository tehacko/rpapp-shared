import { type ComponentType } from 'react';

export interface LocaleFlagSvgProps {
  readonly className?: string;
}

const CS_FLAG_CLIP_ID = 'locale-flag-clip-cs';
const EN_FLAG_CLIP_ID = 'locale-flag-clip-en';
const SK_FLAG_CLIP_ID = 'locale-flag-clip-sk';

/**
 * Official Slovak coat-of-arms placement inside the 32×32 circular flag icon.
 * Paths come from Wikimedia “Flag of Slovakia” (construction matching Zákon 63/1993):
 * patriarchal double cross with amplified + concave ends — not fat rectangle bars.
 *
 * Transform maps wiki flag coords (900×600, shield center ≈ 270,300) into the icon.
 */
export const SLOVAK_COAT_OF_ARMS = {
  /** Uniform scale: shield height ≈ half the circular icon (law: half flag height). */
  scale: 0.054,
  /** Translated so the shield sits hoist-biased inside the circle. */
  translateX: 11.4 - 270 * 0.054,
  translateY: 15.2 - 300 * 0.054,
  /** Cross path `d` from Wikimedia Flag of Slovakia.svg (silver patriarchal cross). */
  crossPath:
    'M280.56 261.28c13.36.22 39.45.74 62.67-7.03 0 0-.61 8.31-.61 17.99 0 9.67.61 17.98.61 17.98-21.3-7.12-47.61-7.27-62.67-7.08v51.54h-21.12v-51.54c-15.07-.2-41.37-.04-62.68 7.08 0 0 .62-8.3.62-17.98s-.62-17.99-.62-17.99c23.23 7.77 49.31 7.25 62.68 7.03v-32.37c-12.19-.1-29.74.48-49.6 7.12 0 0 .62-8.3.62-17.98s-.62-17.98-.62-17.98c19.83 6.62 37.36 7.22 49.54 7.11-.62-20.5-6.6-46.33-6.6-46.33s12.3.96 17.22.96c4.92 0 17.21-.96 17.21-.96s-5.97 25.83-6.6 46.33c12.18.1 29.72-.49 49.55-7.11 0 0-.62 8.3-.62 17.98 0 9.67.62 17.98.62 17.98-19.86-6.64-37.42-7.22-49.6-7.12v32.37',
  shieldOutlinePath:
    'm269.993 459.98-3.906-1.867c-25.267-12.173-56.294-30.4-81.294-58.133-25-27.733-43.8-65.307-43.8-114.24 0-93.6 4.52-136.68 4.52-136.68l.84-8.067h247.28l.84 8.067s4.534 43.093 4.534 136.68c0 48.933-18.8 86.507-43.814 114.24-25 27.733-56.026 45.96-81.293 58.133Z',
  shieldFillPath:
    'M270 450c-49.38-23.76-120-70.94-120-164.25S154.46 150 154.46 150h231.07S390 192.44 390 285.75 319.37 426.24 270 450',
  hillsPath:
    'M270 329.1c-24.87 0-38.19 34.46-38.19 34.46s-7.4-16.34-27.68-16.34c-13.73 0-23.82 12.2-30.25 23.5 24.97 39.7 64.8 64.2 96.11 79.28 31.32-15.07 71.16-39.58 96.13-79.28-6.43-11.3-16.52-23.5-30.25-23.5a30.52 30.52 0 0 0-27.69 16.34s-13.32-34.46-38.19-34.46Z',
} as const;

/** @deprecated Use SLOVAK_COAT_OF_ARMS — kept as alias for existing imports. */
export const SLOVAK_FLAG_CROSS = SLOVAK_COAT_OF_ARMS;

/** Dual-tone rim radius — must stay inside the viewBox so strokes are not clipped. */
export const FLAG_EDGE_RIM_RADIUS = 14.35;

/**
 * Dual-tone rim drawn fully inside the 32×32 viewBox so white flag bands
 * stay readable on light sheets (and the silhouette stays clear on dark UI).
 */
function FlagEdgeRim(): JSX.Element {
  return (
    <g data-testid="locale-flag-edge-rim" aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r={FLAG_EDGE_RIM_RADIUS}
        fill="none"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth="2"
      />
      <circle
        cx="16"
        cy="16"
        r={FLAG_EDGE_RIM_RADIUS}
        fill="none"
        stroke="rgba(15, 23, 42, 0.45)"
        strokeWidth="1.35"
      />
    </g>
  );
}

export function CzechFlagSvg({ className }: LocaleFlagSvgProps): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" data-locale-flag="cs">
      <defs>
        <clipPath id={CS_FLAG_CLIP_ID}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${CS_FLAG_CLIP_ID})`}>
        <rect width="32" height="16" fill="#ffffff" />
        <rect y="16" width="32" height="16" fill="#d7141a" />
        <path d="M0 0 L18 16 L0 32 Z" fill="#11457e" />
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

export function EnglishFlagSvg({ className }: LocaleFlagSvgProps): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" data-locale-flag="en">
      <defs>
        <clipPath id={EN_FLAG_CLIP_ID}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${EN_FLAG_CLIP_ID})`}>
        <rect width="32" height="32" fill="#012169" />
        <path d="M0 0 L32 32 M32 0 L0 32" stroke="#ffffff" strokeWidth="6" />
        <path d="M0 0 L32 32 M32 0 L0 32" stroke="#c8102e" strokeWidth="3" />
        <path d="M16 0 V32 M0 16 H32" stroke="#ffffff" strokeWidth="10" />
        <path d="M16 0 V32 M0 16 H32" stroke="#c8102e" strokeWidth="6" />
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

/**
 * Slovak flag: white / blue / red + official coat of arms (patriarchal double
 * cross with flared concave ends on three hills — Zákon 63/1993 geometry).
 */
export function SlovakFlagSvg({ className }: LocaleFlagSvgProps): JSX.Element {
  const arms = SLOVAK_COAT_OF_ARMS;
  const coatTransform = `translate(${arms.translateX} ${arms.translateY}) scale(${arms.scale})`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" data-locale-flag="sk">
      <defs>
        <clipPath id={SK_FLAG_CLIP_ID}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${SK_FLAG_CLIP_ID})`}>
        <rect width="32" height="10.6667" fill="#ffffff" />
        <rect y="10.6667" width="32" height="10.6667" fill="#0b4ea2" />
        <rect y="21.3333" width="32" height="10.6667" fill="#ee1c25" />
        {/* Official coat of arms (wiki paths, uniformly scaled — preserves cross proportions) */}
        <g transform={coatTransform}>
          <path fill="#ffffff" d={arms.shieldOutlinePath} />
          <path data-testid="slovak-flag-shield" fill="#ee1c25" d={arms.shieldFillPath} />
          <path
            data-testid="slovak-flag-cross"
            fill="#ffffff"
            d={arms.crossPath}
          />
          <path data-testid="slovak-flag-hills" fill="#0b4ea2" d={arms.hillsPath} />
        </g>
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

export type LocaleFlagSvgComponent = ComponentType<LocaleFlagSvgProps>;
