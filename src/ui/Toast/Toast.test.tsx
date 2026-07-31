/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import {
  OVERLAY_MOTION_ENTERED,
  OVERLAY_MOTION_EXITED,
  OVERLAY_MOTION_TRANSITION,
} from '../overlay/overlayMotion.js';
import { Toast } from './Toast.js';

function expectClassTokens(el: HTMLElement, tokens: string): void {
  for (const token of tokens.split(/\s+/).filter(Boolean)) {
    expect(el.className).toContain(token);
  }
}

describe('Toast', () => {
  it('applies EXITED motion classes when open=false', () => {
    const { rerender } = render(<Toast message="Saved" open />);
    rerender(<Toast message="Saved" open={false} />);

    const toast = screen.getByTestId('toast');
    expectClassTokens(toast, OVERLAY_MOTION_EXITED);
    expectClassTokens(toast, OVERLAY_MOTION_TRANSITION);
  });

  it('applies EXITED motion classes when exiting=true', () => {
    render(<Toast message="Saved" exiting />);

    const toast = screen.getByTestId('toast');
    expectClassTokens(toast, OVERLAY_MOTION_EXITED);
    expect(toast.className).not.toContain('opacity-100');
  });

  it('stays mounted with EXITED classes when open flips false (host owns unmount)', () => {
    const { rerender } = render(<Toast message="Hello" open testId="toast-hold" />);
    expect(screen.getByTestId('toast-hold')).toBeInTheDocument();

    rerender(<Toast message="Hello" open={false} testId="toast-hold" />);
    const toast = screen.getByTestId('toast-hold');
    expect(toast).toBeInTheDocument();
    expectClassTokens(toast, OVERLAY_MOTION_EXITED);
  });

  it('uses ENTERED tokens once open and visible (or EXITED before enter frame)', () => {
    render(<Toast message="Hi" open />);
    const toast = screen.getByTestId('toast');
    const entered = OVERLAY_MOTION_ENTERED.split(/\s+/).every((t) => toast.className.includes(t));
    const exited = OVERLAY_MOTION_EXITED.split(/\s+/).every((t) => toast.className.includes(t));
    expect(entered || exited).toBe(true);
  });
});
