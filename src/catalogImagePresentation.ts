import type { CatalogImageFocal } from './types.js';

export interface CatalogMediaPresentationSettings {
  readonly cardAspectRatio?: string | null;
  readonly thumbnailAspectRatio?: string | null;
  readonly objectFit?: 'cover' | 'contain' | null;
}

export type CatalogImagePresentationVariant = 'card' | 'thumbnail';

export interface CatalogImagePresentationInput extends CatalogImageFocal {
  readonly variant?: CatalogImagePresentationVariant;
  readonly catalogMedia?: CatalogMediaPresentationSettings | null;
}

export interface CatalogImagePresentation {
  readonly aspectRatio: string;
  readonly objectFit: 'cover' | 'contain';
  readonly objectPosition: string;
}

const DEFAULT_CARD_ASPECT = '4 / 3';
const DEFAULT_THUMB_ASPECT = '1 / 1';
const FOCAL_NUDGE_MAX_PERCENT = 5;

function parseAspectRatio(value: string | null | undefined, fallback: string): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  const trimmed = value.trim();
  const colonMatch = /^(\d+)\s*:\s*(\d+)$/.exec(trimmed);
  if (colonMatch) {
    return `${colonMatch[1]} / ${colonMatch[2]}`;
  }
  const slashMatch = /^(\d+)\s*\/\s*(\d+)$/.exec(trimmed);
  if (slashMatch) {
    return `${slashMatch[1]} / ${slashMatch[2]}`;
  }
  return fallback;
}

function focalToObjectPositionPercent(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 50;
  }
  const normalized = Math.min(1, Math.max(0, value));
  const nudge = (normalized - 0.5) * (FOCAL_NUDGE_MAX_PERCENT * 2);
  return Math.min(50 + FOCAL_NUDGE_MAX_PERCENT, Math.max(50 - FOCAL_NUDGE_MAX_PERCENT, 50 + nudge));
}

export function resolveCatalogImagePresentation(
  input: CatalogImagePresentationInput = {}
): CatalogImagePresentation {
  const variant = input.variant ?? 'card';
  const catalogMedia = input.catalogMedia ?? null;
  const aspectRatio =
    variant === 'thumbnail'
      ? parseAspectRatio(catalogMedia?.thumbnailAspectRatio, DEFAULT_THUMB_ASPECT)
      : parseAspectRatio(catalogMedia?.cardAspectRatio, DEFAULT_CARD_ASPECT);
  const objectFit = catalogMedia?.objectFit === 'contain' ? 'contain' : 'cover';
  const x = focalToObjectPositionPercent(input.focalPointX);
  const y = focalToObjectPositionPercent(input.focalPointY);

  return {
    aspectRatio,
    objectFit,
    objectPosition: `${x}% ${y}%`,
  };
}

export function catalogImagePresentationStyle(
  input: CatalogImagePresentationInput = {}
): Record<string, string> {
  const presentation = resolveCatalogImagePresentation(input);
  return {
    aspectRatio: presentation.aspectRatio,
    objectFit: presentation.objectFit,
    objectPosition: presentation.objectPosition,
  };
}
