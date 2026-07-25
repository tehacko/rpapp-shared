/**
 * CMP-0027 NavStepper — linear multi-step chrome (≠ QuantityStepper).
 */

export interface NavStepperStep {
  readonly id: string;
  readonly label: string;
}

export interface NavStepperProps {
  readonly steps: readonly NavStepperStep[];
  readonly activeStepId: string;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly testId?: string;
}

function stepSurfaceClass(isActive: boolean, isComplete: boolean): string {
  if (isActive) {
    return 'border-[var(--color-accent,var(--color-an-primary))] bg-[var(--color-surface,var(--color-an-surface))] text-[var(--color-on-surface,var(--color-an-text))]';
  }
  if (isComplete) {
    return 'border-[var(--color-border,var(--color-an-border))] bg-[var(--color-surface-muted,var(--color-an-bg))] text-[var(--color-on-surface,var(--color-an-text))]';
  }
  return 'border-[var(--color-border,var(--color-an-border))] bg-transparent text-[var(--color-on-surface-muted,var(--color-an-text-muted))]';
}

function stepDataState(isActive: boolean, isComplete: boolean): 'active' | 'complete' | 'upcoming' {
  if (isActive) {
    return 'active';
  }
  if (isComplete) {
    return 'complete';
  }
  return 'upcoming';
}

export function NavStepper({
  steps,
  activeStepId,
  ariaLabel,
  className,
  testId = 'nav-stepper',
}: NavStepperProps): JSX.Element {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  );

  return (
    <nav
      aria-label={ariaLabel}
      className={['w-full', className ?? ''].filter((part) => part.length > 0).join(' ')}
      data-testid={testId}
    >
      <ol className="m-0 flex w-full list-none items-stretch gap-1 p-0">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isComplete = index < activeIndex;
          return (
            <li
              key={step.id}
              className={[
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-center',
                stepSurfaceClass(isActive, isComplete),
              ].join(' ')}
              aria-current={isActive ? 'step' : undefined}
              data-testid={`${testId}-step-${step.id}`}
              data-state={stepDataState(isActive, isComplete)}
            >
              <span className="text-[0.65rem] font-semibold tabular-nums tracking-wide">
                {index + 1}
              </span>
              <span className="truncate text-xs font-medium sm:text-sm">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
