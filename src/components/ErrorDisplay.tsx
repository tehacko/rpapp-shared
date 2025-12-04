import { AppError, getErrorMessage } from '../errors';
import { CSS_CLASSES } from '../constants';

interface ErrorDisplayProps {
  error: Error | AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
  retryLabel?: string;
  dismissLabel?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
  showDetails = false,
  retryLabel = 'Zkusit znovu',
  dismissLabel = 'Zavřít'
}: ErrorDisplayProps) {
  const userMessage = getErrorMessage(error);
  const isNetworkError = error.name === 'NetworkError';

  return (
    <div 
      className={`error-display ${CSS_CLASSES.ERROR} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="error-content">
        <div className="error-icon" aria-hidden="true">
          {isNetworkError ? '🌐' : '❌'}
        </div>
        
        <div className="error-text">
          <h3 className="error-title">
            {isNetworkError ? 'Problém s připojením' : 'Došlo k chybě'}
          </h3>
          <p className="error-message">
            {userMessage}
          </p>
        </div>

        {showDetails && process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Technické detaily</summary>
            <pre className="error-stack">
              <code>{error.stack || error.message}</code>
            </pre>
          </details>
        )}

        <div className="error-actions">
          {onRetry && (
            <button 
              onClick={onRetry}
              className={`retry-btn ${CSS_CLASSES.BUTTON_PRIMARY}`}
              type="button"
            >
              🔄 {retryLabel}
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className={`dismiss-btn ${CSS_CLASSES.BUTTON_SECONDARY}`}
              type="button"
            >
              ✕ {dismissLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
