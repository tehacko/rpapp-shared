export type LabelLocale = 'cs' | 'en';

export type LabelAudience = 'operator' | 'technical';

export interface LocalizedLabel {
  readonly cs: string;
  readonly en: string;
}

export function dotNotationToLabel(code: string): LocalizedLabel {
  const en = code
    .split('.')
    .map((segment) =>
      segment
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' — ');
  return { en, cs: en };
}

export function snakeCaseToLabel(name: string): LocalizedLabel {
  const en = name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { en, cs: en };
}
