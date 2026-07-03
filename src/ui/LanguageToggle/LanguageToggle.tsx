import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';

export type LanguageToggleSurface = 'admin' | 'kiosk' | 'customer';
export type LanguageToggleNamespace = 'admin' | 'kiosk' | 'customer';

type SupportedLocale = 'cs' | 'en';

const toggle = tv({
  slots: {
    group: 'inline-flex items-stretch overflow-hidden',
    btn: 'm-0 cursor-pointer border-none font-semibold transition-colors',
    divider: 'w-px self-stretch bg-[var(--color-border)]',
  },
  variants: {
    surface: {
      admin: {
        group: [
          'fixed top-[var(--spacing-4,1rem)] right-[var(--spacing-4,1rem)] z-[10001]',
          'rounded-[var(--radius-lg,0.5rem)] border border-[var(--color-border,#e2e8f0)]',
          'bg-[var(--color-surface-elevated,#fff)] shadow-[var(--shadow-md,0_4px_6px_-1px_rgb(0_0_0_/_0.1))]',
        ].join(' '),
        btn: 'px-4 py-2 text-sm text-[var(--color-text-secondary,#475569)] hover:bg-[var(--color-surface-muted,#f1f5f9)] hover:text-[var(--color-text-primary,#0f172a)]',
        divider: 'bg-[var(--color-border,#e2e8f0)]',
      },
      kiosk: {
        group: [
          'fixed top-[var(--spacing-10)] right-[var(--spacing-10)] z-[var(--z-modal-backdrop)]',
          'rounded-[var(--radius-xl)] border border-[var(--color-border,#e2e8f0)]',
          'bg-[var(--color-surface-elevated,#fff)] shadow-[var(--shadow-lg)]',
        ].join(' '),
        btn: 'px-8 py-4 text-sm text-[var(--color-on-surface-muted,#475569)] hover:bg-[var(--color-surface-muted,#f1f5f9)] hover:text-[var(--color-on-surface,#0f172a)]',
        divider: 'bg-[var(--color-border,#e2e8f0)]',
      },
      customer: {
        group: [
          'fixed top-2.5 right-2.5 z-50 rounded-xl border border-[var(--color-border)]',
          'bg-[var(--color-surface-elevated)] shadow-lg',
        ].join(' '),
        btn: 'px-3 py-1.5 text-sm text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-on-surface)]',
        divider: 'bg-[var(--color-border)]',
      },
    },
  },
  defaultVariants: {
    surface: 'customer',
  },
});

const activeBtn = tv({
  variants: {
    surface: {
      admin:
        'bg-[var(--color-primary,#6366f1)] text-white hover:bg-[var(--color-primary-hover,#4f46e5)] hover:text-white',
      kiosk:
        'bg-[var(--color-accent,#2563eb)] text-[var(--color-accent-foreground,#fff)] hover:opacity-95',
      customer:
        'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90',
    },
  },
  defaultVariants: {
    surface: 'customer',
  },
});

function normalizeLocale(lng: string | undefined): SupportedLocale {
  if (lng == null || lng === '') {
    return 'cs';
  }
  return lng.startsWith('en') ? 'en' : 'cs';
}

export interface LanguageToggleProps {
  readonly surface: LanguageToggleSurface;
  readonly i18nNamespace: LanguageToggleNamespace;
}

export function LanguageToggle({ surface, i18nNamespace }: LanguageToggleProps): JSX.Element {
  const { t, i18n } = useTranslation(i18nNamespace);
  const active = normalizeLocale(i18n.language);
  const slots = toggle({ surface });

  useEffect(() => {
    document.documentElement.lang = active === 'en' ? 'en' : 'cs';
  }, [active]);

  const select = (locale: SupportedLocale): void => {
    if (locale === active) {
      return;
    }
    void i18n.changeLanguage(locale);
  };

  const btnClass = (locale: SupportedLocale): string => {
    const base = slots.btn();
    if (active === locale) {
      return [base, activeBtn({ surface })].join(' ');
    }
    return [base, 'bg-transparent'].join(' ');
  };

  return (
    <div className={slots.group()} role="group" aria-label={t('shell.language.groupLabel')}>
      <button
        type="button"
        className={btnClass('cs')}
        aria-pressed={active === 'cs'}
        onClick={() => {
          select('cs');
        }}
      >
        {t('shell.language.cs')}
      </button>
      <span className={slots.divider()} aria-hidden="true" />
      <button
        type="button"
        className={btnClass('en')}
        aria-pressed={active === 'en'}
        onClick={() => {
          select('en');
        }}
      >
        {t('shell.language.en')}
      </button>
    </div>
  );
}
