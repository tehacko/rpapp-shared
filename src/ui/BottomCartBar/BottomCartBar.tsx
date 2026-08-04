import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Retail V1 bottom cart bar — single source of truth for the floating
 * Icon | Summary | CTA chrome (Customer StickyCartBar, kiosk, and any future
 * consumers). No clear/destructive action here — that lives in cart detail.
 *
 * Layout: flex + min-w-min reserves intrinsic width for price/readable count
 * before the shrink-0 CTA. Count line may clip pathological emptySummary only
 * (overflow-hidden, no ellipsis). Price is never clipped or truncated.
 *
 * Expand choreography is capped to transform/opacity within the fixed 76px bar
 * (no layout jump / no height change from 76px).
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
   * so the 76px bar layout never gains a third text line.
   */
  readonly statusMessage?: string | null;
  readonly onOpenCart: () => void;
  readonly onPay: () => void;
  readonly testId?: string;
  readonly openTestId?: string;
  readonly payTestId?: string;
  readonly className?: string;
  readonly icon?: ReactNode;
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
    },
    payButtonRef,
  ): JSX.Element {
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

    return (
      <div
        className={[
          // Flex + min-w-min: reserve intrinsic width for Icon|Summary (price/count) before shrink-0 CTA.
          // Clip only pathological emptySummary on the count line — never hard-clip price or normal plurals.
          'pointer-events-auto mx-3 mb-3 flex h-[76px] items-center gap-3',
          'rounded-[999px] bg-[var(--color-accent)] px-4 py-3 text-[var(--color-accent-foreground)]',
          'shadow-[0_4px_20px_rgba(0,0,0,0.18)]',
          // G9: soft scale pulse on count increase — transform only within fixed 76px
          'origin-center transition-[transform,box-shadow,opacity] duration-200 ease-out',
          barPulse ? 'scale-[1.02]' : 'scale-100',
          'max-[389px]:mx-2 max-[389px]:gap-2 max-[389px]:px-3 max-[389px]:py-2.5',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
      >
        <button
          type="button"
          className="flex min-h-11 min-w-min flex-1 items-center gap-3 rounded-full text-left text-[var(--color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-foreground)] max-[389px]:gap-2"
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
                'mt-0.5 block w-max whitespace-nowrap text-[24px] font-bold leading-none tabular-nums',
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
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-foreground)]',
            'disabled:cursor-not-allowed',
            'max-[389px]:min-w-[108px] max-[389px]:px-3',
            payDisabled || payPending
              ? 'bg-[var(--cart-bar-cta-disabled,#B0B0B0)] text-[var(--cart-bar-cta-disabled-fg,#111111)]'
              : 'bg-[var(--cart-bar-cta,#C9A84C)] text-[var(--cart-bar-cta-fg,#111111)] hover:opacity-90',
          ].join(' ')}
        >
          {payPending ? '…' : payLabel}
        </button>
      </div>
    );
  },
);

BottomCartBar.displayName = 'BottomCartBar';
