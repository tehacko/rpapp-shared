/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Select } from './Select.js';

const OPTIONS = [
  { value: '1', label: 'Point A' },
  { value: '2', label: 'Point B' },
] as const;

describe('Select', () => {
  it('renders trigger with 44px min touch target classes', () => {
    render(
      <Select
        surface="pickup"
        options={OPTIONS}
        value="1"
        onValueChange={() => undefined}
        testId="select-touch"
      />,
    );

    const trigger = screen.getByTestId('select-touch');
    expect(trigger.className).toContain('min-h-[44px]');
    expect(trigger.className).toContain('min-w-[44px]');
  });

  it('renders selected value when controlled', () => {
    render(
      <Select
        surface="pickup"
        options={OPTIONS}
        value="2"
        onValueChange={() => undefined}
        testId="select-value"
      />,
    );

    expect(screen.getByTestId('select-value')).toHaveTextContent('Point B');
  });

  it('disables when options are empty', () => {
    render(
      <Select
        surface="pickup"
        options={[]}
        onValueChange={() => undefined}
        testId="select-empty"
      />,
    );

    expect(screen.getByTestId('select-empty')).toBeDisabled();
  });
});
