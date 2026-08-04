/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { OVERLAY_EXIT_MS } from '../overlay/overlayMotion.js';
import { BottomSheet } from './BottomSheet.js';

describe('BottomSheet', () => {
  it('closes on Escape when not busy', () => {
    const onClose = jest.fn();
    render(
      <BottomSheet open onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when busy', () => {
    const onClose = jest.fn();
    render(
      <BottomSheet open busy onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on Escape when pending', () => {
    const onClose = jest.fn();
    render(
      <BottomSheet open pending onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on overlay click when closeOnOverlayClick and not busy', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet open onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    await user.click(screen.getByTestId('bottom-sheet-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when busy', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet open busy onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    const overlay = screen.getByTestId('bottom-sheet-overlay');
    expect(overlay).toBeDisabled();
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on overlay click when closeOnOverlayClick is false', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <BottomSheet open closeOnOverlayClick={false} onClose={onClose} title="Sheet">
        Body
      </BottomSheet>,
    );

    const overlay = screen.getByTestId('bottom-sheet-overlay');
    expect(overlay).toBeDisabled();
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('restores focus to the previously focused element after exit unmount (jsdom best-effort)', async () => {
    jest.useFakeTimers();
    function Harness({ open }: { readonly open: boolean }): JSX.Element {
      return (
        <>
          <button type="button" data-testid="opener">
            Open
          </button>
          <BottomSheet open={open} onClose={() => undefined} title="Sheet">
            <button type="button">Inside</button>
          </BottomSheet>
        </>
      );
    }

    const { rerender } = render(<Harness open={false} />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    expect(opener).toHaveFocus();

    rerender(<Harness open />);
    expect(screen.getByTestId('bottom-sheet-content')).toBeInTheDocument();

    rerender(<Harness open={false} />);
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS + 30);
    });
    expect(opener).toHaveFocus();
    jest.useRealTimers();
  });

  it('sets aria-labelledby when title is provided', () => {
    const title = 'Payment filters';
    render(
      <BottomSheet open onClose={() => undefined} title={title} titleId="sheet-title">
        Body
      </BottomSheet>,
    );

    const content = screen.getByTestId('bottom-sheet-content');
    expect(content).toHaveAttribute('aria-labelledby', 'sheet-title');
    const titleEl = document.getElementById('sheet-title');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl).toHaveTextContent(title);
  });

  it('omits aria-labelledby when title is not set', () => {
    render(
      <BottomSheet open onClose={() => undefined}>
        Body
      </BottomSheet>,
    );

    expect(screen.getByTestId('bottom-sheet-content')).not.toHaveAttribute('aria-labelledby');
  });

  it('supports controlled open via Escape through onClose', async () => {
    jest.useFakeTimers();
    function Controlled(): JSX.Element {
      const [open, setOpen] = useState(true);
      return (
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Controlled">
          Body
        </BottomSheet>
      );
    }

    render(<Controlled />);
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS + 30);
    });
    expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('keeps background inert through exit fade and clears after unmount', async () => {
    jest.useFakeTimers();
    function Harness({ open }: { readonly open: boolean }): JSX.Element {
      return (
        <>
          <div data-testid="page-content">
            <button type="button">Page</button>
          </div>
          <BottomSheet open={open} onClose={() => undefined} title="Sheet">
            Body
          </BottomSheet>
        </>
      );
    }

    const { rerender } = render(<Harness open={false} />);
    const page = screen.getByTestId('page-content');
    expect(Boolean(page.inert)).toBe(false);

    rerender(<Harness open />);
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);
    expect(Boolean(screen.getByTestId('bottom-sheet').inert)).toBe(false);
    expect(screen.getByTestId('bottom-sheet-content').className).toContain('max-h-[85dvh]');
    expect(screen.getByTestId('bottom-sheet').className).toContain('h-[100dvh]');

    rerender(<Harness open={false} />);
    // open=false but still mounted for exit fade — page must stay inert
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS - 20);
    });
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(false);
    jest.useRealTimers();
  });

  it('cycles Tab from last focusable to first', () => {
    render(
      <BottomSheet open onClose={() => undefined} title="Trap">
        <button type="button">First</button>
        <button type="button">Last</button>
      </BottomSheet>,
    );

    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    expect(last).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByTestId('bottom-sheet-close')).toHaveFocus();
  });

  it('cycles Shift+Tab from first focusable to last', () => {
    render(
      <BottomSheet open onClose={() => undefined} title="Trap">
        <button type="button">First</button>
        <button type="button">Last</button>
      </BottomSheet>,
    );

    const close = screen.getByTestId('bottom-sheet-close');
    close.focus();
    expect(close).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('maps describedBy to aria-describedby on the dialog panel', () => {
    render(
      <BottomSheet open onClose={() => undefined} title="Sheet" describedBy="sheet-desc">
        <p id="sheet-desc">Extra context</p>
      </BottomSheet>,
    );

    expect(screen.getByTestId('bottom-sheet-content')).toHaveAttribute(
      'aria-describedby',
      'sheet-desc',
    );
  });
});
