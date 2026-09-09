import { cn } from '@/lib/cn';

/**
 * Wordmark + mark. The mark is an ascending three-bar step with a trend line —
 * the compound curve the whole product is about. Pure SVG so it stays crisp,
 * inherits `currentColor`, and costs no extra request.
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="26" height="26" rx="7" fill="var(--brand)" />
        <path
          d="M6.5 17.5v-3.2M11 17.5v-6M15.5 17.5v-4.1M20 17.5V8.5"
          stroke="var(--brand-fg)"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M6.5 13.2 11 9.8l4.5 2.1L20 6.6"
          stroke="var(--brand-fg)"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="text-[0.9375rem] font-semibold tracking-tight text-fg">
          ETF&nbsp;Lab
        </span>
      )}
    </span>
  );
}
