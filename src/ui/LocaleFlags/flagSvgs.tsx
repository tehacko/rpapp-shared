import { type ComponentType } from 'react';

export interface LocaleFlagSvgProps {
  readonly className?: string;
}

const CS_FLAG_CLIP_ID = 'locale-flag-clip-cs';
const EN_FLAG_CLIP_ID = 'locale-flag-clip-en';
const SK_FLAG_CLIP_ID = 'locale-flag-clip-sk';

/** Hairline rim so white flag edges stay visible on light surfaces. */
function FlagEdgeRim(): JSX.Element {
  return (
    <circle
      cx="16"
      cy="16"
      r="15.25"
      fill="none"
      stroke="rgba(15, 23, 42, 0.22)"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  );
}

export function CzechFlagSvg({ className }: LocaleFlagSvgProps): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
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
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
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
 * Slovak flag (official colours): white / blue / red horizontal bands with the
 * national coat of arms — red shield, white patriarchal double cross, blue hills.
 * Edge rim keeps the white band readable on light UI backgrounds.
 */
export function SlovakFlagSvg({ className }: LocaleFlagSvgProps): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <clipPath id={SK_FLAG_CLIP_ID}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${SK_FLAG_CLIP_ID})`}>
        <rect width="32" height="10.6667" fill="#ffffff" />
        <rect y="10.6667" width="32" height="10.6667" fill="#0b4ea2" />
        <rect y="21.3333" width="32" height="10.6667" fill="#ee1c25" />
        {/* Coat of arms — positioned on the hoist like the real flag */}
        <path
          d="M6.4 6.6 H15.6 V15.8 C15.6 19.4 11 22.2 11 22.2 C11 22.2 6.4 19.4 6.4 15.8 Z"
          fill="#ee1c25"
          stroke="#ffffff"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        {/* Three hills (Tatra / Matra / Fatra) */}
        <path
          d="M7.35 19.15 C7.95 17.55 9.05 16.7 10.15 16.7 C11.05 16.7 11.65 17.25 12.05 17.85 C12.45 17.25 13.05 16.7 13.95 16.7 C15.05 16.7 16.15 17.55 16.75 19.15 Z"
          fill="#0b4ea2"
        />
        {/* Patriarchal double cross — wider bars (true Slovak proportions) */}
        <g fill="#ffffff" stroke="none">
          {/* Vertical beam */}
          <rect x="10.15" y="8.35" width="1.7" height="9.35" rx="0.15" />
          {/* Upper crossbar (wider) */}
          <rect x="7.85" y="10.15" width="6.3" height="1.55" rx="0.15" />
          {/* Lower crossbar (wider, slightly shorter than upper on real arms — keep both wide) */}
          <rect x="8.15" y="12.55" width="5.7" height="1.55" rx="0.15" />
        </g>
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

export type LocaleFlagSvgComponent = ComponentType<LocaleFlagSvgProps>;
