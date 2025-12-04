import { CSS_CLASSES } from '../constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  'aria-label'?: string;
}

export function LoadingSpinner({ 
  size = 'medium', 
  message, 
  className = '',
  'aria-label': ariaLabel = 'Loading'
}: LoadingSpinnerProps) {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  }[size];

  return (
    <div className={`loading-container ${CSS_CLASSES.LOADING} ${className}`}>
      <div 
        className={`spinner ${sizeClass}`}
        role="status"
        aria-label={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
      {message && (
        <p className="loading-message" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
