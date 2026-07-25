/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography.js';

describe('Typography', () => {
  it('renders body as paragraph by default', () => {
    render(<Typography>Hello</Typography>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('P');
    expect(el.className).toContain('font-size-body');
  });

  it('maps h1 variant to h1 element', () => {
    render(<Typography variant="h1">Title</Typography>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
  });

  it('allows as override', () => {
    render(
      <Typography variant="caption" as="div">
        Cap
      </Typography>
    );
    expect(screen.getByText('Cap').tagName).toBe('DIV');
  });

  it('does not expose displayXl', () => {
    // Compile-time: TypographyVariant has no displayXl; runtime smoke for display only.
    render(<Typography variant="display">Hero</Typography>);
    expect(screen.getByText('Hero').className).toContain('font-size-display');
    expect(screen.getByText('Hero').className).not.toContain('display-xl');
  });

  it('Body Large uses weight 400 via --font-weight-regular', () => {
    render(<Typography variant="bodyLg">Large body</Typography>);
    const el = screen.getByText('Large body');
    expect(el.className).toContain('font-size-body-lg');
    expect(el.className).toContain('font-weight-regular');
    expect(el.className).not.toContain('font-weight-bold');
    expect(el.className).not.toContain('font-weight-semibold');
  });

  it('applies font-weight roles 700/600/400 by variant', () => {
    const { rerender } = render(<Typography variant="h1">H</Typography>);
    expect(screen.getByText('H').className).toContain('font-weight-bold');
    rerender(<Typography variant="h4">H4</Typography>);
    expect(screen.getByText('H4').className).toContain('font-weight-semibold');
    rerender(<Typography variant="body">B</Typography>);
    expect(screen.getByText('B').className).toContain('font-weight-regular');
  });
});
