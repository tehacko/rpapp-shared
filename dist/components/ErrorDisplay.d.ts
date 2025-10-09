import { AppError } from '../errors';
interface ErrorDisplayProps {
    error: Error | AppError;
    onRetry?: () => void;
    onDismiss?: () => void;
    className?: string;
    showDetails?: boolean;
    retryLabel?: string;
    dismissLabel?: string;
}
export declare function ErrorDisplay({ error, onRetry, onDismiss, className, showDetails, retryLabel, dismissLabel }: ErrorDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
