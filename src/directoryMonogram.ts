/**
 * Directory entity monogram (tenant / sales-point / org list thumbs).
 *
 * Single shared algorithm for customer directory surfaces and admin
 * list/table fallbacks when no branding image is available.
 *
 * Do **not** use `CatalogImagePlaceholder` as a directory entity fallback —
 * that component is catalog/product (and donation) media chrome only.
 * Broken or missing directory images cascade to this monogram instead.
 *
 * Admin call sites (migrated — consume `resolveDirectoryMonogram` / label helpers):
 * - `admin-app/.../DevDashboard/devDashboardTenantList.ts` → `resolveTenantDirectoryMonogram`
 * - `admin-app/.../DevDashboard/DevDashboardTenantTable.tsx`
 * - `admin-app/.../SalesPointAvatar/SalesPointAvatar.tsx` (table + list-card fallback)
 *
 * Related but out of directory branding scope (do not blindly replace):
 * - `shared/src/ui/Avatar/Avatar.tsx` → `initialsFromName` (CMP-0025 user avatar)
 * - `admin-app/.../PickupPointListCard.tsx` → local `initialsFromName`
 * - `admin-app/.../DevCustomerTable.tsx` → `customerMonogram`
 * - `rpapp-customer/.../headerAccountBadge.ts` → account badge text
 */

export interface DirectoryMonogramInput {
  /** Stable numeric entity id (tenantId, salesPointId, etc.). */
  readonly id: number;
  /** Preferred display name (name-first). */
  readonly displayName: string;
  /** Fallback when displayName yields no graphemes (tenant code, slug, etc.). */
  readonly code?: string | null;
}

export interface DirectoryMonogramColors {
  /** Background fill as `#RRGGBB`. */
  readonly backgroundColor: string;
  /** Foreground text as `#RRGGBB` meeting WCAG AA ≥ 4.5:1 vs background. */
  readonly textColor: string;
}

export interface DirectoryMonogram extends DirectoryMonogramColors {
  /** 1–2 uppercase graphemes for the thumb label. */
  readonly label: string;
}

const WCAG_AA_CONTRAST = 4.5;
const TEXT_LIGHT = { r: 255, g: 255, b: 255 } as const;
const TEXT_DARK = { r: 17, g: 24, b: 39 } as const;

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

function segmentGraphemes(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return [];
  }
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    type SegmenterCtor = new (
      locales?: string | string[],
      options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
    ) => { segment: (input: string) => Iterable<{ segment: string }> };
    const Segmenter = (Intl as unknown as { Segmenter: SegmenterCtor }).Segmenter;
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(trimmed), (part) => part.segment);
  }
  return Array.from(trimmed);
}

function firstGrapheme(value: string): string | null {
  const parts = segmentGraphemes(value);
  return parts[0] ?? null;
}

function takeGraphemes(value: string, count: number): string {
  return segmentGraphemes(value).slice(0, count).join('');
}

function labelFromWhitespaceWords(text: string): string | null {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (words.length === 0) {
    return null;
  }
  if (words.length === 1) {
    const only = words[0];
    if (only === undefined) {
      return null;
    }
    const taken = takeGraphemes(only, 2);
    return taken.length > 0 ? taken : null;
  }
  const first = firstGrapheme(words[0] ?? '');
  const second = firstGrapheme(words[1] ?? '');
  if (first === null) {
    return null;
  }
  if (second === null) {
    return first;
  }
  return `${first}${second}`;
}

function labelFromDelimitedCode(code: string): string | null {
  const segments = code
    .trim()
    .split(/[-_.]+/)
    .filter((part) => part.length > 0);
  if (segments.length >= 2) {
    const first = firstGrapheme(segments[0] ?? '');
    const second = firstGrapheme(segments[1] ?? '');
    if (first !== null && second !== null) {
      return `${first}${second}`;
    }
  }
  if (segments.length === 1) {
    const only = segments[0];
    if (only === undefined) {
      return null;
    }
    const taken = takeGraphemes(only, 2);
    return taken.length > 0 ? taken : null;
  }
  return null;
}

/**
 * 1–2 graphemes from display name; falls back to code (whitespace, then
 * hyphen/underscore/dot segments, then raw graphemes). Empty → `"?"`.
 */
export function directoryMonogramLabel(displayName: string, code?: string | null): string {
  const fromName = labelFromWhitespaceWords(displayName);
  if (fromName !== null) {
    return fromName.toLocaleUpperCase();
  }

  const codeValue = code ?? '';
  // Codes often use kebab/snake form — prefer segment initials over raw prefix.
  const fromCodeDelimited = labelFromDelimitedCode(codeValue);
  if (fromCodeDelimited !== null) {
    return fromCodeDelimited.toLocaleUpperCase();
  }

  const fromCodeWords = labelFromWhitespaceWords(codeValue);
  if (fromCodeWords !== null) {
    return fromCodeWords.toLocaleUpperCase();
  }

  const raw = takeGraphemes(codeValue, 2);
  if (raw.length > 0) {
    return raw.toLocaleUpperCase();
  }

  return '?';
}

/** Stable 32-bit mix of a numeric id (deterministic across runtimes). */
export function hashDirectoryMonogramId(id: number): number {
  let x = Math.trunc(id) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = x ^ (x >>> 16);
  return x >>> 0;
}

/**
 * Stable monogram seed from a string key (e.g. tenantCode when tenantId unknown).
 * Same key → same color across cards; never use per-row ids (transactionId).
 */
export function hashDirectoryMonogramKey(key: string): number {
  const trimmed = key.trim();
  let h = 2166136261;
  for (let i = 0; i < trimmed.length; i += 1) {
    h ^= trimmed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Prefer numeric tenantId; otherwise hash tenantCode so the same org shares one color.
 */
export function resolveDirectoryMonogramEntityId(input: {
  readonly tenantId?: number | null;
  readonly tenantCode?: string | null;
}): number {
  const tenantId = input.tenantId;
  if (typeof tenantId === 'number' && Number.isFinite(tenantId) && tenantId > 0) {
    return Math.trunc(tenantId);
  }
  const code = typeof input.tenantCode === 'string' ? input.tenantCode.trim() : '';
  if (code.length > 0) {
    return hashDirectoryMonogramKey(code);
  }
  return 0;
}

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hp = hue / 60;
  const x = chroma * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp < 1) {
    r1 = chroma;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = chroma;
  } else if (hp < 3) {
    g1 = chroma;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = chroma;
  } else if (hp < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }
  const m = l - chroma / 2;
  return {
    r: clampByte((r1 + m) * 255),
    g: clampByte((g1 + m) * 255),
    b: clampByte((b1 + m) * 255),
  };
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

/** WCAG 2.x contrast ratio between two sRGB colors. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(rgb: Rgb): string {
  const toHex = (n: number): string => clampByte(n).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function pickTextColor(background: Rgb): Rgb {
  const lightRatio = contrastRatio(background, TEXT_LIGHT);
  const darkRatio = contrastRatio(background, TEXT_DARK);
  if (lightRatio >= WCAG_AA_CONTRAST && lightRatio >= darkRatio) {
    return TEXT_LIGHT;
  }
  if (darkRatio >= WCAG_AA_CONTRAST) {
    return TEXT_DARK;
  }
  return lightRatio >= darkRatio ? TEXT_LIGHT : TEXT_DARK;
}

/**
 * Background from stable id hash; text color chosen for WCAG AA ≥ 4.5:1.
 * Lightness is nudged when needed so at least one of white/dark text passes.
 */
export function directoryMonogramColors(id: number): DirectoryMonogramColors {
  const hash = hashDirectoryMonogramId(id);
  const hue = hash % 360;
  const saturation = 0.42 + ((hash >>> 8) % 21) / 100;

  let lightness = 0.36 + ((hash >>> 16) % 17) / 100;
  let background = hslToRgb(hue, saturation, lightness);
  let text = pickTextColor(background);

  for (let step = 0; step < 24; step += 1) {
    if (contrastRatio(background, text) >= WCAG_AA_CONTRAST) {
      return {
        backgroundColor: rgbToHex(background),
        textColor: rgbToHex(text),
      };
    }
    const bgLum = relativeLuminance(background);
    lightness = bgLum > 0.5 ? Math.max(0.12, lightness - 0.04) : Math.min(0.78, lightness + 0.04);
    background = hslToRgb(hue, saturation, lightness);
    text = pickTextColor(background);
  }

  // Guaranteed AA pair if HSL search failed (should be rare).
  return {
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
  };
}

/** Full directory monogram: label + WCAG AA color pair from stable numeric id. */
export function resolveDirectoryMonogram(input: DirectoryMonogramInput): DirectoryMonogram {
  const colors = directoryMonogramColors(input.id);
  return {
    label: directoryMonogramLabel(input.displayName, input.code),
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
  };
}
