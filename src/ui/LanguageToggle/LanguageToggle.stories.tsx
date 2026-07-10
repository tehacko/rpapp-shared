import type { Meta, StoryObj } from '@storybook/react';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle.js';

const shellLanguage = {
  cs: {
    groupLabel: 'Jazyk rozhraní',
    cs: 'Čeština',
    en: 'English',
  },
  en: {
    groupLabel: 'Interface language',
    cs: 'Čeština',
    en: 'English',
  },
} as const;

const storybookNamespaces = ['admin', 'kiosk', 'customer', 'pickup'] as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'cs',
    fallbackLng: 'cs',
    ns: [...storybookNamespaces],
    defaultNS: 'customer',
    interpolation: { escapeValue: false },
    resources: {
      cs: Object.fromEntries(
        storybookNamespaces.map((namespace) => [
          namespace,
          { shell: { language: shellLanguage.cs } },
        ])
      ),
      en: Object.fromEntries(
        storybookNamespaces.map((namespace) => [
          namespace,
          { shell: { language: shellLanguage.en } },
        ])
      ),
    },
  });
}

const meta = {
  title: 'UI/LanguageToggle',
  component: LanguageToggle,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div style={{ minHeight: '6rem' }}>
          <Story />
        </div>
      </I18nextProvider>
    ),
  ],
  args: {
    surface: 'customer',
    i18nNamespace: 'customer',
  },
} satisfies Meta<typeof LanguageToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomerDefault: Story = {};

export const AdminSurface: Story = {
  args: {
    surface: 'admin',
    i18nNamespace: 'admin',
  },
};

export const KioskSurface: Story = {
  args: {
    surface: 'kiosk',
    i18nNamespace: 'kiosk',
  },
};

export const PickupSurface: Story = {
  args: {
    surface: 'pickup',
    i18nNamespace: 'pickup',
  },
};

export const HeaderPlacement: Story = {
  args: {
    surface: 'admin',
    i18nNamespace: 'admin',
    placement: 'header',
  },
};

export const EnglishActive: Story = {
  loaders: [
    async () => {
      await i18n.changeLanguage('en');
      return {};
    },
  ],
};
