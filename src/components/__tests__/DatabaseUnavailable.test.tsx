/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { DatabaseUnavailable } from '../DatabaseUnavailable.js';

describe('DatabaseUnavailable', () => {
  it('renders user-friendly outage copy and service-unavailable test id', () => {
    render(<DatabaseUnavailable onRetry={() => undefined} surface="admin" />);

    expect(screen.getByTestId('service-unavailable')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Aplikace teď není dostupná');
    expect(screen.queryByText(/Databáze/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DATABASE_URL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pokus:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Prodleva:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/připojení/i)).not.toBeInTheDocument();
  });

  it('shows countdown status while auto-retry is scheduled', () => {
    render(
      <DatabaseUnavailable nextRetryDelay={5000} onRetry={() => undefined} surface="kiosk" />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Automaticky to zkusíme znovu/i)).toBeInTheDocument();
    expect(
      screen.getByText(/počkejte, zkusíme to obnovit automaticky/i),
    ).toBeInTheDocument();
  });

  it('hides auto-retry copy when no retry is scheduled', () => {
    render(<DatabaseUnavailable nextRetryDelay={0} onRetry={() => undefined} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByText(/klepněte na tlačítko níže/i),
    ).toBeInTheDocument();
  });

  it('disables retry button while health check is in flight', () => {
    const onRetry = jest.fn();
    render(<DatabaseUnavailable isChecking onRetry={onRetry} surface="admin" />);

    const retry = screen.getByRole('button', { name: 'Zkusit znovu' });
    expect(retry).toBeDisabled();
    fireEvent.click(retry);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('wires manual retry when idle', () => {
    const onRetry = jest.fn();
    render(<DatabaseUnavailable onRetry={onRetry} surface="admin" />);

    fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('focuses headline on mount for keyboard users', () => {
    render(<DatabaseUnavailable onRetry={() => undefined} />);

    const headline = screen.getByRole('alert');
    expect(headline.tagName).toBe('H1');
    expect(headline).toHaveFocus();
  });

  it('exposes polite live countdown region with sr-only fallback when retry scheduled', () => {
    render(<DatabaseUnavailable nextRetryDelay={3000} onRetry={() => undefined} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText(/Automatické opakování za \d+ sekund/)).toHaveClass('sr-only');
  });
});
