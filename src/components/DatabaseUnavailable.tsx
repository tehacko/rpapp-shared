import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button/Button.js';
import { Icon } from '../ui/Icon/Icon.js';
import { Hourglass } from '../ui/Icon/lucide.js';
import { Loader } from '../ui/Loader/Loader.js';

type ButtonSurface = 'admin' | 'kiosk' | 'customer' | 'pickup';

export interface DatabaseUnavailableProps {
  nextRetryDelay?: number;
  isChecking?: boolean;
  onRetry?: () => void;
  /** Button styling — admin gate should pass `admin`, kiosk passes `kiosk`. */
  surface?: ButtonSurface;
}

const HEADLINE = 'Aplikace teď není dostupná';

/**
 * Shown when the backend /health check fails (API unreachable or not ready).
 * Copy is intentionally non-technical — end users, not operators.
 */
export function DatabaseUnavailable({
  nextRetryDelay = 0,
  isChecking = false,
  onRetry,
  surface = 'customer',
}: DatabaseUnavailableProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [remainingMs, setRemainingMs] = useState(nextRetryDelay);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (nextRetryDelay <= 0) {
      setRemainingMs(0);
      return;
    }

    const deadline = Date.now() + nextRetryDelay;
    const tick = (): void => {
      setRemainingMs(Math.max(0, deadline - Date.now()));
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [nextRetryDelay]);

  const autoRetryScheduled = nextRetryDelay > 0;
  const countdownSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  const bodyCopy = autoRetryScheduled
    ? 'Obsah teď nejde načíst. Zkuste to prosím za chvíli znovu — nebo počkejte, zkusíme to obnovit automaticky.'
    : 'Obsah teď nejde načíst. Zkuste to prosím za chvíli znovu, nebo klepněte na tlačítko níže.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
      }}
      data-testid="service-unavailable"
    >
      <div
        style={{
          maxWidth: '600px',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'center',
            color: '#666',
          }}
          aria-hidden="true"
        >
          <Icon icon={Hourglass} size={48} strokeWidth={1.75} />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333',
            outline: 'none',
          }}
          role="alert"
        >
          {HEADLINE}
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}
        >
          {bodyCopy}
        </p>

        {autoRetryScheduled && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              backgroundColor: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '6px',
              marginBottom: '2rem',
              border: '1px solid #dee2e6',
              fontSize: '1rem',
              color: '#444',
            }}
          >
            <span aria-hidden="true">
              Automaticky to zkusíme znovu za{' '}
              <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                {countdownSeconds > 0 ? `${countdownSeconds} s` : 'právě teď…'}
              </span>
            </span>
            <span className="sr-only">
              {countdownSeconds > 0
                ? `Automatické opakování za ${countdownSeconds} sekund`
                : 'Automatické opakování právě probíhá'}
            </span>
          </div>
        )}

        {onRetry && (
          <Button
            type="button"
            intent="primary"
            size="md"
            surface={surface}
            loading={isChecking}
            disabled={isChecking}
            onClick={onRetry}
          >
            Zkusit znovu
          </Button>
        )}

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #dee2e6',
            fontSize: '0.95rem',
            color: '#555',
          }}
        >
          <p style={{ margin: 0, marginBottom: '0.75rem' }}>Co můžete zkusit:</p>
          <ul
            style={{
              textAlign: 'left',
              display: 'inline-block',
              margin: 0,
              paddingLeft: '1.5rem',
              lineHeight: 1.7,
            }}
          >
            <li>Zkontrolujte, zda funguje internet</li>
            <li>Obnovte stránku v prohlížeči</li>
            <li>Pokud problém trvá déle než pár minut, kontaktujte provozovatele nebo podporu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Minimal boot splash while the first /health check is in flight. */
export function ServiceHealthBootScreen({
  label = 'Načítání…',
}: {
  readonly label?: string;
}): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
      data-testid="health-check-boot"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader size="lg" label={label} testId="health-check-boot-loader" />
    </div>
  );
}
