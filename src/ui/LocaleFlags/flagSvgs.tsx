import { type ComponentType } from 'react';

export interface LocaleFlagSvgProps {
  readonly className?: string;
}

const CS_FLAG_CLIP_ID = 'locale-flag-clip-cs';
const EN_FLAG_CLIP_ID = 'locale-flag-clip-en';

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
    </svg>
  );
}

export type LocaleFlagSvgComponent = ComponentType<LocaleFlagSvgProps>;
