/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';
import { LayoutDashboard } from 'lucide-react';
import { Icon, ICON_SIZES } from './Icon.js';

describe('Icon', () => {
  it('renders Lucide glyph at frozen size with stroke 2', () => {
    const { container } = render(<Icon icon={LayoutDashboard} size={24} data-testid="icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it('exposes frozen size scale only', () => {
    expect([...ICON_SIZES]).toEqual([16, 20, 24, 32, 48, 64]);
  });
});
