import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'xs';
  className?: string;
}

/**
 * The variant names stay colour-shaped (`green`, `red`) because the mapping
 * helpers in `utils/formatters.ts` return them, but every value below now
 * resolves through the semantic tokens in `index.css`. The previous raw
 * palette classes (`bg-green-100 dark:text-green-400`) were the recurring
 * source of sub-4.5:1 pairs in dark mode.
 */
const VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  gray: 'bg-surface-2 text-fg-muted',
  green: 'bg-positive-soft text-positive-soft-fg',
  yellow: 'bg-accent-soft text-accent-soft-fg',
  red: 'bg-negative-soft text-negative-soft-fg',
  blue: 'bg-brand-soft text-brand-soft-fg',
  purple: 'bg-violet-soft text-violet-soft-fg',
};

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium whitespace-nowrap',
        // Transitions are here so a badge inside a hovered card can be tinted
        // by the card's `group-hover:` rules without snapping.
        'transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-quart)]',
        size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
