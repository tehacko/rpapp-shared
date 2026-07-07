/**
 * Canonical screen-state types (ADR-FE-SCREENSTATE-001, MFE-v3-S-06).
 * Types only — pi-kiosk-shared MUST NOT export React ScreenState.
 *
 * Gold reference: rpapp-admin/src/shared/ui/types/screenState.types.ts
 */

/** Frozen variant literals — PR-4E async-state-compliance regexes must match these only. */
export type ScreenStateVariant = 'loading' | 'error' | 'empty';

export interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  hint?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  context?: string;
}

export interface SkeletonLoaderProps {
  type: 'kpi' | 'chart' | 'table' | 'list';
  count?: number;
}

export interface ScreenStateAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ScreenStateProps {
  readonly variant: ScreenStateVariant;
  readonly title?: string;
  readonly message?: string;
  readonly hint?: string;
  readonly icon?: string;
  readonly error?: Error;
  readonly onRetry?: () => void;
  readonly action?: ScreenStateAction;
}
