/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { OVERLAY_EXIT_MS } from '../overlay/overlayMotion.js';
import { Dialog } from './Dialog.js';

describe('Dialog', () => {
  it('closes on Escape when not busy', () => {
    const onClose = jest.fn();
    render(
      <Dialog open onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when busy', () => {
    const onClose = jest.fn();
    render(
      <Dialog open busy onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on Escape when pending', () => {
    const onClose = jest.fn();
    render(
      <Dialog open pending onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on overlay click when closeOnOverlayClick and not busy', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    await user.click(screen.getByTestId('dialog-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when busy', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <Dialog open busy onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    const overlay = screen.getByTestId('dialog-overlay');
    expect(overlay).toBeDisabled();
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on overlay click when closeOnOverlayClick is false', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <Dialog open closeOnOverlayClick={false} onClose={onClose} title="Confirm">
        Body
      </Dialog>,
    );

    const overlay = screen.getByTestId('dialog-overlay');
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
          <Dialog open={open} onClose={() => undefined} title="Confirm">
            <button type="button">Inside</button>
          </Dialog>
        </>
      );
    }

    const { rerender } = render(<Harness open={false} />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    expect(opener).toHaveFocus();

    rerender(<Harness open />);
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();

    rerender(<Harness open={false} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS + 30);
    });
    expect(opener).toHaveFocus();
    jest.useRealTimers();
  });

  it('sets aria-labelledby when title is provided', () => {
    const title = 'Confirm destructive action';
    render(
      <Dialog open onClose={() => undefined} title={title} titleId="dlg-title">
        Body
      </Dialog>,
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveAttribute('aria-labelledby', 'dlg-title');
    const titleEl = document.getElementById('dlg-title');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl).toHaveTextContent(title);
  });

  it('omits aria-labelledby when title is not set', () => {
    render(
      <Dialog open onClose={() => undefined}>
        Body
      </Dialog>,
    );

    expect(screen.getByTestId('dialog-content')).not.toHaveAttribute('aria-labelledby');
  });

  it('supports controlled open via Escape through onClose', async () => {
    jest.useFakeTimers();
    function Controlled(): JSX.Element {
      const [open, setOpen] = useState(true);
      return (
        <Dialog open={open} onClose={() => setOpen(false)} title="Controlled">
          Body
        </Dialog>
      );
    }

    render(<Controlled />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS + 30);
    });
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
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
          <Dialog open={open} onClose={() => undefined} title="Confirm">
            Body
          </Dialog>
        </>
      );
    }

    const { rerender } = render(<Harness open={false} />);
    const page = screen.getByTestId('page-content');
    expect(Boolean(page.inert)).toBe(false);

    rerender(<Harness open />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);
    expect(Boolean(screen.getByTestId('dialog').inert)).toBe(false);

    rerender(<Harness open={false} />);
    // open=false but still mounted for exit fade — page must stay inert
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(OVERLAY_EXIT_MS - 20);
    });
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    expect(Boolean(page.inert)).toBe(false);
    jest.useRealTimers();
  });

  it('cycles Tab from last focusable to first', () => {
    render(
      <Dialog open onClose={() => undefined} title="Trap">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    );

    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    expect(last).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByTestId('dialog-close')).toHaveFocus();
  });

  it('cycles Shift+Tab from first focusable to last', () => {
    render(
      <Dialog open onClose={() => undefined} title="Trap">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    );

    const close = screen.getByTestId('dialog-close');
    close.focus();
    expect(close).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('maps describedBy to aria-describedby on the dialog panel', () => {
    render(
      <Dialog open onClose={() => undefined} title="Confirm" describedBy="dlg-desc">
        <p id="dlg-desc">Extra context</p>
      </Dialog>,
    );

    expect(screen.getByTestId('dialog-content')).toHaveAttribute('aria-describedby', 'dlg-desc');
  });

  it('spreads panelProps onto the role=dialog panel (data-scan-mode=expectCard)', () => {
    render(
      <Dialog
        open
        onClose={() => undefined}
        title="Sign in"
        panelProps={{ 'data-scan-mode': 'expectCard' }}
      >
        Body
      </Dialog>,
    );

    const panel = screen.getByTestId('dialog-content');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('data-scan-mode', 'expectCard');
  });

  it('Escape closes only the topmost idle dialog when nested', () => {
    const onCloseOuter = jest.fn();
    const onCloseInner = jest.fn();
    render(
      <>
        <Dialog open onClose={onCloseOuter} title="Outer" testId="outer">
          Outer body
        </Dialog>
        <Dialog open onClose={onCloseInner} title="Inner" testId="inner">
          Inner body
        </Dialog>
      </>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
  });

  it('Escape does not close a busy topmost dialog (idle under stays open)', () => {
    const onCloseOuter = jest.fn();
    const onCloseInner = jest.fn();
    render(
      <>
        <Dialog open onClose={onCloseOuter} title="Outer" testId="outer">
          Outer body
        </Dialog>
        <Dialog open busy onClose={onCloseInner} title="Inner" testId="inner">
          Inner body
        </Dialog>
      </>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseInner).not.toHaveBeenCalled();
    expect(onCloseOuter).not.toHaveBeenCalled();
  });
});
