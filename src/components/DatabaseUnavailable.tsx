import { useEffect, useState } from 'react';
import { Button } from '../ui/Button/Button.js';

interface DatabaseUnavailableProps {
  retryCount?: number;
  maxRetries?: number;
  nextRetryDelay?: number;
  onRetry?: () => void;
}

/**
 * Database Unavailable Screen
 * Shows when the backend database is unavailable
 * Displays exponential backoff retry information
 */
export function DatabaseUnavailable({
  retryCount = 0,
  maxRetries = 5,
  nextRetryDelay = 0,
  onRetry,
}: DatabaseUnavailableProps): JSX.Element {
  const [countdown, setCountdown] = useState<number>(Math.ceil(nextRetryDelay / 1000));

  // Update countdown every second
  useEffect(() => {
    if (nextRetryDelay <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        return newCount > 0 ? newCount : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRetryDelay]);

  // Reset countdown when nextRetryDelay changes
  useEffect(() => {
    setCountdown(Math.ceil(nextRetryDelay / 1000));
  }, [nextRetryDelay]);

  const formatDelay = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) {
      return `${seconds} sekund`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} ${minutes === 1 ? 'minuta' : minutes < 5 ? 'minuty' : 'minut'}`;
    }
    return `${minutes} ${minutes === 1 ? 'minuta' : minutes < 5 ? 'minuty' : 'minut'} ${remainingSeconds} sekund`;
  };

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
      role="alert"
      aria-live="assertive"
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗄️</div>
        
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333',
          }}
        >
          Databáze není dostupná
        </h1>
        
        <p
          style={{
            fontSize: '1.1rem',
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}
        >
          Server se pokouší připojit k databázi s exponenciálním backoff.
          <br />
          Aplikace se automaticky znovu připojí, jakmile bude databáze dostupná.
        </p>

        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6',
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Pokus:</strong> {retryCount} / {maxRetries}
          </div>
          {nextRetryDelay > 0 && (
            <div>
              <strong>Další pokus za:</strong>{' '}
              <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                {countdown > 0 ? `${countdown} sekund` : 'právě teď...'}
              </span>
            </div>
          )}
          {retryCount > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Zpoždění: {formatDelay(nextRetryDelay)}
            </div>
          )}
        </div>

        {onRetry && (
          <Button type="button" intent="primary" size="md" onClick={onRetry}>
            🔄 Zkusit znovu
          </Button>
        )}

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #dee2e6',
            fontSize: '0.9rem',
            color: '#999',
          }}
        >
          <p style={{ margin: 0 }}>
            Pokud problém přetrvává, zkontrolujte:
          </p>
          <ul
            style={{
              textAlign: 'left',
              display: 'inline-block',
              marginTop: '0.5rem',
              paddingLeft: '1.5rem',
            }}
          >
            <li>Zda je databázový server spuštěný</li>
            <li>Zda je DATABASE_URL správně nakonfigurovaná</li>
            <li>Zda je síťové připojení dostupné</li>
            <li>Zda firewall umožňuje připojení</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

