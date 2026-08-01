import { type ComponentType } from 'react';

export interface LocaleFlagSvgProps {
  readonly className?: string;
}

const CS_FLAG_CLIP_ID = 'locale-flag-clip-cs';
const EN_FLAG_CLIP_ID = 'locale-flag-clip-en';
const SK_FLAG_CLIP_ID = 'locale-flag-clip-sk';

/**
 * Dual-tone outer rim + soft inner edge so circular flags (esp. white bands)
 * stay readable on both light sheets and dark surfaces.
 */
function FlagEdgeRim(): JSX.Element {
  return (
    <g aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="15.15"
        fill="none"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth="2.4"
      />
      <circle
        cx="16"
        cy="16"
        r="15.15"
        fill="none"
        stroke="rgba(15, 23, 42, 0.42)"
        strokeWidth="1.25"
      />
    </g>
  );
}

/** Drawn inside the clip so white flag area does not melt into light UI. */
function FlagInnerEdge(): JSX.Element {
  return (
    <circle
      cx="16"
      cy="16"
      r="15.2"
      fill="none"
      stroke="rgba(15, 23, 42, 0.32)"
      strokeWidth="1.6"
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
        <FlagInnerEdge />
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
        <FlagInnerEdge />
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

/**
 * Slovak flag: white / blue / red + coat of arms (double cross on three hills).
 * Cross bars are optically widened for ~36px circular icons.
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
        {/* Red shield */}
        <path
          d="M5.9 6.1 H16.1 V15.4 C16.1 19.5 11 22.7 11 22.7 C11 22.7 5.9 19.5 5.9 15.4 Z"
          fill="#ee1c25"
          stroke="#ffffff"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />
        {/* Patriarchal double cross — bold for small icons (true Slovak form) */}
        <g fill="#ffffff">
          <rect x="9.55" y="7.7" width="2.9" height="10.6" rx="0.25" />
          <rect x="6.55" y="9.45" width="8.9" height="2.25" rx="0.25" />
          <rect x="7.05" y="12.45" width="7.9" height="2.25" rx="0.25" />
        </g>
        {/* Three hills under the cross */}
        <path
          d="M6.95 19.55 C7.7 17.55 9.05 16.4 10.35 16.4 C11.35 16.4 12.05 17.05 12.45 17.85 C12.9 17.05 13.6 16.4 14.6 16.4 C15.9 16.4 17.25 17.55 18 19.55 Z"
          fill="#0b4ea2"
        />
        <FlagInnerEdge />
      </g>
      <FlagEdgeRim />
    </svg>
  );
}

export type LocaleFlagSvgComponent = ComponentType<LocaleFlagSvgProps>;
