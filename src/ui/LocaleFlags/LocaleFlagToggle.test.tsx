/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleFlagToggle } from '../LocaleFlags/LocaleFlagToggle.js';
import { DEFAULT_LOCALE_FLAGS } from '../LocaleFlags/localeFlagRegistry.js';
import { SlovakFlagSvg } from '../LocaleFlags/flagSvgs.js';

describe('LocaleFlagToggle', () => {
  it('includes Slovak in the default locale set', () => {
    expect(DEFAULT_LOCALE_FLAGS.map((locale) => locale.code)).toEqual(['cs', 'en', 'sk']);
    expect(DEFAULT_LOCALE_FLAGS.find((locale) => locale.code === 'sk')?.Flag).toBe(SlovakFlagSvg);
  });

  it('renders flag buttons with accessible labels, contrast ring, and selection state', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const labels: Record<string, string> = {
      cs: 'Čeština',
      en: 'English',
      sk: 'Slovenčina',
    };

    render(
      <LocaleFlagToggle
        locales={DEFAULT_LOCALE_FLAGS}
        activeLocale="cs"
        onSelect={onSelect}
        getLabel={(code) => labels[code] ?? code}
        groupLabel="Jazyk rozhraní"
        surface="admin"
        placement="header"
        dataTestId="locale-flag-toggle"
      />,
    );

    const group = screen.getByTestId('locale-flag-toggle');
    expect(group).toBeInTheDocument();
    expect(group.className).toMatch(/w-fit/);
    expect(screen.getAllByRole('button')).toHaveLength(3);

    const czech = screen.getByRole('button', { name: 'Čeština' });
    const english = screen.getByRole('button', { name: 'English' });
    const slovak = screen.getByRole('button', { name: 'Slovenčina' });
    expect(czech).toHaveAttribute('aria-pressed', 'true');
    expect(english).toHaveAttribute('aria-pressed', 'false');
    expect(slovak).toHaveAttribute('aria-pressed', 'false');
    expect(english.className).toMatch(/opacity-40/);
    expect(slovak.className).toMatch(/opacity-40/);

    // Always-on contrast edge (inactive + active) — white bands must not melt into sheets.
    for (const button of [czech, english, slovak]) {
      expect(button.className).toMatch(/ring-1|ring-2/);
      expect(button.className).not.toMatch(/overflow-hidden/);
      expect(within(button).getByTestId('locale-flag-edge-rim')).toBeInTheDocument();
    }

    expect(within(slovak).getByTestId('slovak-flag-cross')).toBeInTheDocument();

    await user.click(slovak);
    expect(onSelect).toHaveBeenCalledWith('sk');
  });
});
