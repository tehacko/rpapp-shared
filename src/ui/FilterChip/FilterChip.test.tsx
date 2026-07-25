/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from './FilterChip.js';

describe('FilterChip', () => {
  it('renders label and toggles via onClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<FilterChip label="Milk" selected onClick={onClick} />);

    const chip = screen.getByTestId('filter-chip');
    expect(chip).toHaveAttribute('data-selected', 'true');
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses action.primary selected tokens (not brand-consumer hard-code)', () => {
    render(<FilterChip label="Open" selected onClick={() => undefined} />);
    const chip = screen.getByTestId('filter-chip');
    expect(chip.className).toContain('--color-action-primary');
    expect(chip.className).toContain('--color-surface-soft');
    expect(chip.className).not.toContain('brand-consumer-accent');
  });
});
