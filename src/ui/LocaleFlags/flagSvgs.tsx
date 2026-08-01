import { type ComponentType } from 'react';

export interface LocaleFlagSvgProps {
  readonly className?: string;
}

const CS_FLAG_CLIP_ID = 'locale-flag-clip-cs';
const EN_FLAG_CLIP_ID = 'locale-flag-clip-en';
const SK_FLAG_CLIP_ID = 'locale-flag-clip-sk';

/** Dual-tone rim: readable on both light sheets and dark surfaces. */
function FlagEdgeRim(): JSX.Element {
  return (
    <g aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="15.1"
        fill="none"
        stroke="rgba(255, 255, 255, 0.92)"
        strokeWidth="2.25"
      />
      <circle
        cx="16"
        cy="16"
        r="15.1"
        fill="none"
        stroke="rgba(15, 23, 42, 0.38)"
        strokeWidth="1.15"
      />
    </g>
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
 * Dual-tone rim keeps white band + circular silhouette readable on any surface.
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
        {/* Coat of arms on the hoist */}
        <path
          d="M6.15 6.35 H15.85 V15.55 C15.85 19.35 11 22.45 11 22.45 C11 22.45 6.15 19.35 6.15 15.55 Z"
          fill="#ee1c25"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* Three hills */}
        <path
          d="M7.1 19.35 C7.75 17.55 8.95 16.55 10.2 16.55 C11.15 16.55 11.8 17.15 12.2 17.85 C12.6 17.15 13.25 16.55 14.2 16.55 C15.45 16.55 16.65 17.55 17.3 19.35 Z"
          fill="#0b4ea2"
        />
        {/* Patriarchal double cross — wider bars matching real Slovak arms */}
        <g fill="#ffffff">
          <rect x="9.85" y="8.05" width="2.3" height="10.15" rx="0.2" />
          <rect x="7.15" y="9.85" width="7.7" height="1.85" rx="0.2" />
          <rect x="7.55" y="12.55" width="6.9" height="1.85" rx="0.2" />
        </g>
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

export type LocaleFlagSvgComponent = ComponentType<LocaleFlagSvgProps>;
