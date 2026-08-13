import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** Visual recipe for the floating cart chrome. Default `pill` preserves kiosk. */
export type BottomCartBarAppearance = 'pill' | 'compact';

/**
 * Retail V1 bottom cart bar — single source of truth for the floating
 * Icon | Summary | CTA chrome (Customer StickyCartBar, kiosk, and any future
 * consumers). No clear/destructive action here — that lives in cart detail.
 *
 * Layout: flex + min-w-min reserves intrinsic width for price/readable count
 * before the shrink-0 CTA. Count line may clip pathological emptySummary only
 * (overflow-hidden, no ellipsis). Price is never clipped or truncated.
 *
 * Expand choreography is capped to transform/opacity within the fixed bar
 * height (pill 76px / compact 68px — no layout jump from height change).
 */
export interface BottomCartBarProps {
  readonly itemCountLabel: string;
  readonly priceLabel: string;
  /** Shown as red badge on the cart icon when > 0. */
  readonly badgeCount?: number;
  readonly payLabel: string;
  readonly payDisabled: boolean;
  readonly payPending?: boolean;
  readonly openCartAria: string;
  readonly payAria: string;
  /**
   * Optional pay-disabled reason — announced via aria-describedby on the CTA
   * so the bar layout never gains a third text line.
   */
  readonly statusMessage?: string | null;
  readonly onOpenCart: () => void;
  readonly onPay: () => void;
  readonly testId?: string;
  readonly openTestId?: string;
  readonly payTestId?: string;
  readonly className?: string;
  readonly icon?: ReactNode;
  /**
   * `pill` — accent-filled rounded-[999px] h-[76px] (kiosk default).
   * `compact` — theme-inverse accent fill (same as primary buttons), rounded-2xl,
   * ~68px; Pay CTA uses `--customer-cart-bar-pay-*` (opposite of the bar).
   */
  readonly appearance?: BottomCartBarAppearance;
}

function DefaultCartIcon(): JSX.Element {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export const BottomCartBar = forwardRef<HTMLButtonElement, BottomCartBarProps>(
  function BottomCartBar(
    {
      itemCountLabel,
      priceLabel,
      badgeCount = 0,
      payLabel,
      payDisabled,
      payPending = false,
      openCartAria,
      payAria,
      statusMessage = null,
      onOpenCart,
      onPay,
      testId = 'bottom-cart-bar',
      openTestId = 'bottom-cart-bar-open',
      payTestId = 'bottom-cart-bar-pay',
      className,
      icon,
      appearance = 'pill',
    },
    payButtonRef,
  ): JSX.Element {
    const isCompact = appearance === 'compact';
    const showBadge = badgeCount > 0;
    const statusId =
      statusMessage !== null && statusMessage.length > 0
        ? `${payTestId}-status`
        : undefined;

    const prevBadgeRef = useRef(badgeCount);
    const prevPriceRef = useRef(priceLabel);
    const [barPulse, setBarPulse] = useState(false);
    const [badgePulse, setBadgePulse] = useState(false);
    const [pricePulse, setPricePulse] = useState(false);

    useEffect(() => {
      const countIncreased = badgeCount > prevBadgeRef.current;
      const priceChanged = priceLabel !== prevPriceRef.current;

      if (countIncreased) {
        setBarPulse(true);
        setBadgePulse(true);
      }
      if (priceChanged) {
        setPricePulse(true);
      }

      prevBadgeRef.current = badgeCount;
      prevPriceRef.current = priceLabel;

      if (!countIncreased && !priceChanged) {
        return;
      }

      const timer = window.setTimeout(() => {
        setBarPulse(false);
        setBadgePulse(false);
        setPricePulse(false);
      }, 200);

      return () => {
        window.clearTimeout(timer);
      };
    }, [badgeCount, priceLabel]);

    const barSurfaceClass = isCompact
      ? [
          // Theme-inverse fill (black on light / soft grey on dark) — matches Add/primary buttons.
          'box-border h-[68px] rounded-2xl bg-[var(--color-accent)]',
          'text-[var(--color-accent-foreground)]',
          'shadow-[var(--shadow-popover)]',
        ].join(' ')
      : [
          'h-[76px] rounded-[999px] bg-[var(--color-accent)]',
          'text-[var(--color-accent-foreground)] shadow-[0_4px_20px_rgba(0,0,0,0.18)]',
        ].join(' ');

    const openButtonTextClass =
      'text-[var(--color-accent-foreground)] focus-visible:outline-[var(--color-accent-foreground)]';

    const priceSizeClass = isCompact
      ? 'text-base tabular-nums'
      : 'text-[24px] tabular-nums';

    const payFocusClass =
      'focus-visible:outline-[var(--color-accent-foreground)]';

    const payEnabledClass = isCompact
      ? 'bg-[var(--customer-cart-bar-pay-bg,#ffffff)] text-[var(--customer-cart-bar-pay-fg,#000000)] hover:opacity-90'
      : 'bg-[var(--cart-bar-cta,#C9A84C)] text-[var(--cart-bar-cta-fg,#111111)] hover:opacity-90';

    return (
      <div
        className={[
          // Flex + min-w-min: reserve intrinsic width for Icon|Summary (price/count) before shrink-0 CTA.
          // Clip only pathological emptySummary on the count line — never hard-clip price or normal plurals.
          'pointer-events-auto mx-3 mb-3 flex min-w-min items-center gap-3',
          'px-4 py-3',
          barSurfaceClass,
          // G9: soft scale pulse on count increase — transform only within fixed bar height
          'origin-center transition-[transform,box-shadow,opacity] duration-200 ease-out',
          barPulse ? 'scale-[1.02]' : 'scale-100',
          'max-[389px]:mx-2 max-[389px]:gap-2 max-[389px]:px-3 max-[389px]:py-2.5',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        data-appearance={appearance}
      >
        <button
          type="button"
          className={[
            'flex min-h-11 min-w-min flex-1 items-center gap-3 rounded-full text-left',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            openButtonTextClass,
            'max-[389px]:gap-2',
          ].join(' ')}
          onClick={onOpenCart}
          aria-label={openCartAria}
          data-testid={openTestId}
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            {icon ?? <DefaultCartIcon />}
            {showBadge ? (
              <span
                className={[
                  'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full',
                  'bg-[var(--color-danger)] px-1 text-[10px] font-bold leading-none text-[var(--color-danger-foreground)]',
                  'origin-center transition-transform duration-200 ease-out',
                  badgePulse ? 'scale-[1.15]' : 'scale-100',
                ].join(' ')}
                aria-hidden
              >
                {badgeCount}
              </span>
            ) : null}
          </span>

          <span className="min-w-min">
            {/* Count/empty: overflow-hidden clips only pathological emptySummary — no truncate/ellipsis */}
            <span
              className="block max-w-[11rem] overflow-hidden whitespace-nowrap text-sm font-medium leading-tight max-[389px]:max-w-[9rem]"
              aria-live="polite"
            >
              {itemCountLabel}
            </span>
            {/* Price: intrinsic width, never clipped or ellipsized */}
            <span
              className={[
                'mt-0.5 block w-max whitespace-nowrap font-bold leading-none',
                priceSizeClass,
                'transition-[opacity,transform] duration-200 ease-out',
                pricePulse ? 'translate-y-[-1px] opacity-80' : 'translate-y-0 opacity-100',
              ].join(' ')}
            >
              {priceLabel}
            </span>
            {statusId !== undefined ? (
              <span id={statusId} className="sr-only" aria-live="polite">
                {statusMessage}
              </span>
            ) : null}
          </span>
        </button>

        <button
          ref={payButtonRef}
          type="button"
          onClick={onPay}
          disabled={payDisabled || payPending}
          aria-label={payAria}
          aria-describedby={statusId}
          aria-busy={payPending || undefined}
          data-testid={payTestId}
          className={[
            'inline-flex h-[52px] min-h-[44px] min-w-[128px] shrink-0 items-center justify-center',
            'rounded-[18px] px-4 text-base font-semibold',
            'transition-[background-color,color,opacity] duration-200 ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            payFocusClass,
            'disabled:cursor-not-allowed',
            'max-[389px]:min-w-[108px] max-[389px]:px-3',
            payDisabled || payPending
              ? 'bg-[var(--cart-bar-cta-disabled,#B0B0B0)] text-[var(--cart-bar-cta-disabled-fg,#111111)]'
              : payEnabledClass,
          ].join(' ')}
        >
          {payPending ? '…' : payLabel}
        </button>
      </div>
    );
  },
);

BottomCartBar.displayName = 'BottomCartBar';
