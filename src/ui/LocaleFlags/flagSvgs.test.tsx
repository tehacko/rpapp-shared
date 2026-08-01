/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import {
  CzechFlagSvg,
  EnglishFlagSvg,
  FLAG_EDGE_RIM_RADIUS,
  SLOVAK_COAT_OF_ARMS,
  SlovakFlagSvg,
} from './flagSvgs.js';

describe('locale flag SVGs', () => {
  it('keeps the dual-tone rim fully inside the 32×32 viewBox', () => {
    // Outer half of stroke must remain ≤ 16 or the SVG viewport clips it.
    const outerExtent = FLAG_EDGE_RIM_RADIUS + 2 / 2;
    expect(outerExtent).toBeLessThanOrEqual(16);
  });

  it.each([
    ['cs', CzechFlagSvg],
    ['en', EnglishFlagSvg],
    ['sk', SlovakFlagSvg],
  ] as const)('renders %s flag with an edge rim for white-on-light contrast', (_code, Flag) => {
    const { container } = render(<Flag />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    expect(within(container).getByTestId('locale-flag-edge-rim')).toBeInTheDocument();
    const rimCircles = within(container)
      .getByTestId('locale-flag-edge-rim')
      .querySelectorAll('circle');
    expect(rimCircles).toHaveLength(2);
    for (const circle of rimCircles) {
      expect(circle).toHaveAttribute('r', String(FLAG_EDGE_RIM_RADIUS));
    }
  });

  it('renders the official Slovak patriarchal cross path (not fat rectangle bars)', () => {
    const { container } = render(<SlovakFlagSvg />);

    expect(screen.getByTestId('slovak-flag-shield')).toBeInTheDocument();
    expect(screen.getByTestId('slovak-flag-hills')).toBeInTheDocument();

    const cross = screen.getByTestId('slovak-flag-cross');
    expect(cross.tagName.toLowerCase()).toBe('path');
    expect(cross).toHaveAttribute('d', SLOVAK_COAT_OF_ARMS.crossPath);

    // No chunky <rect> bars — those over-thickened the horizontal arms.
    expect(container.querySelector('[data-testid="slovak-flag-cross-upper"]')).toBeNull();
    expect(container.querySelector('[data-testid="slovak-flag-cross-lower"]')).toBeNull();
    expect(container.querySelector('[data-testid="slovak-flag-cross-vertical"]')).toBeNull();

    // Official path includes flared concave tips (cubic segments), not a plus of slabs.
    expect(SLOVAK_COAT_OF_ARMS.crossPath).toContain('c13.36');
    expect(SLOVAK_COAT_OF_ARMS.crossPath).toContain('h-21.12');
  });

  it('uses official Slovak tricolour band fills', () => {
    const { container } = render(<SlovakFlagSvg />);
    const bands = container.querySelectorAll('g[clip-path] > rect');
    expect(bands[0]).toHaveAttribute('fill', '#ffffff');
    expect(bands[1]).toHaveAttribute('fill', '#0b4ea2');
    expect(bands[2]).toHaveAttribute('fill', '#ee1c25');
  });
});
