/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleFlagToggle } from '../LocaleFlags/LocaleFlagToggle.js';
import { DEFAULT_LOCALE_FLAGS } from '../LocaleFlags/localeFlagRegistry.js';

describe('LocaleFlagToggle', () => {
  it('renders flag buttons with accessible labels and selection state', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <LocaleFlagToggle
        locales={DEFAULT_LOCALE_FLAGS}
        activeLocale="cs"
        onSelect={onSelect}
        getLabel={(code) => (code === 'cs' ? 'Čeština' : 'English')}
        groupLabel="Jazyk rozhraní"
        surface="admin"
        placement="header"
        dataTestId="locale-flag-toggle"
      />,
    );

    expect(screen.getByTestId('locale-flag-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Čeština' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(onSelect).toHaveBeenCalledWith('en');
  });
});
