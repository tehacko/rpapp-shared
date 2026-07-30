/**
 * CMP-0025 Avatar — image when `avatarUrl` present; else initials from `name`.
 */

export interface AvatarProps {
  readonly name: string;
  readonly avatarUrl?: string | null;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
  readonly alt?: string;
  readonly testId?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

/** Derive 1–2 letter initials from a display name (CMP-0025). */
export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

export function Avatar({
  name,
  avatarUrl,
  size = 'md',
  className,
  alt,
  testId = 'avatar',
}: AvatarProps): JSX.Element {
  const initials = initialsFromName(name);
  const base = [
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    'bg-[var(--color-surface-muted,var(--color-an-primary-soft,#e4e4e7))]',
    'font-semibold text-[var(--color-on-surface,var(--color-an-primary,#18181b))]',
    SIZE_CLASS[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt ?? name}
        className={base}
        data-testid={testId}
        data-avatar="image"
      />
    );
  }

  return (
    <span className={base} aria-label={alt ?? name} data-testid={testId} data-avatar="initials">
      {initials}
    </span>
  );
}
