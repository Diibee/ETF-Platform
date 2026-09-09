import Link from 'next/link';
import { cn } from '@/lib/cn';

/* ---------------------------------------------------------------------------
   Landing UI kit. Server components only — no state, no handlers, so none of
   this reaches the client bundle. Variants are mutually exclusive lookup
   tables, which is why `cn` never needs Tailwind conflict resolution.
   ------------------------------------------------------------------------- */

const BUTTON_BASE =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 ' +
  'text-[0.9375rem] font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow] ' +
  'duration-200 ease-[var(--ease-out-quart)]';

const BUTTON_VARIANTS = {
  primary: 'bg-brand text-brand-fg shadow-sm hover:bg-brand-hover hover:shadow-md',
  secondary: 'border border-border-strong bg-surface text-fg hover:border-brand hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
} as const;

export function CtaLink({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof BUTTON_VARIANTS;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}>
      {children}
    </Link>
  );
}

/** Small uppercase kicker that labels a section without competing with its H2. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-eyebrow uppercase text-brand', className)}>{children}</p>
  );
}

/**
 * Shared section header. Keeps the eyebrow → h2 → lead hierarchy identical in
 * every section, which is most of what makes the page read as one system.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'center',
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'center' | 'start';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-h2 text-balance text-fg">{title}</h2>
      {lead && (
        <p className={cn('measure text-lead text-pretty text-fg-muted', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      )}
    </div>
  );
}

/** Elevated content surface used by feature, proof and offer cards. */
export function Panel({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-border bg-surface p-6 shadow-xs',
        'transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-quart)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Tabular-figure stat, used in the hero strip and the proof section. */
export function Stat({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="tnum text-h2 leading-none font-semibold tracking-tight text-fg">{value}</span>
      <span className="text-sm font-medium text-fg">{label}</span>
      {sub && <span className="text-xs text-fg-subtle">{sub}</span>}
    </div>
  );
}
