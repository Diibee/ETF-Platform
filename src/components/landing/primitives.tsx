import Link from 'next/link';
import { cn } from '@/lib/cn';

/* ---------------------------------------------------------------------------
   Landing UI kit. Server components only — no state, no handlers, so none of
   this reaches the client bundle. Variants are mutually exclusive lookup
   tables, which is why `cn` never needs Tailwind conflict resolution.
   ------------------------------------------------------------------------- */

/* `group` is part of the base so any caller can hang a `group-hover:` rule on
   the icon it passes as a child — the trailing-arrow nudge is the whole reason
   these buttons feel responsive rather than merely coloured. `press` gives the
   whole control a 0.97 scale on pointer-down, which is the one microinteraction
   that reads on touch as well as with a mouse. */
const BUTTON_BASE =
  'group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 ' +
  'text-[0.9375rem] font-semibold tracking-tight press ' +
  'transition-[background-color,border-color,color,box-shadow,transform] ' +
  'duration-200 ease-[var(--ease-out-quart)]';

const BUTTON_VARIANTS = {
  primary: 'sheen bg-brand text-brand-fg shadow-sm hover:bg-brand-hover hover:shadow-md',
  secondary:
    'border border-border-strong bg-surface text-fg hover:border-brand hover:bg-surface-2 hover:shadow-sm',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
} as const;

/**
 * The arrow that trails a call to action.
 *
 * Extracted because it was duplicated inline in three sections with three
 * slightly different stroke widths, and because the nudge on hover has to be
 * declared next to the `group` that triggers it to stay legible.
 */
export function CtaArrow({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform duration-200 ease-[var(--ease-out-quart)] group-hover:translate-x-1"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

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
 * Shared section header.
 *
 * `align` defaults to `start`, not `center`. Six consecutive centred
 * eyebrow → h2 → lead blocks gave the page no rhythm and is one of the more
 * recognisable stock layouts; alternating alignment between sections restores
 * a sense of pacing while keeping the type hierarchy identical.
 *
 * The lead is always left-aligned below `sm` regardless: centred body copy
 * running four or five lines on a 375px screen is ragged on both edges and
 * measurably slower to read.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'start',
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'center' | 'start';
  className?: string;
}) {
  const centred = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        centred ? 'items-start sm:items-center sm:text-center' : 'items-start',
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="measure-wide text-h2 text-balance text-fg">{title}</h2>
      {lead && (
        <p
          className={cn(
            'measure text-lead text-pretty text-fg-muted',
            centred && 'sm:mx-auto',
          )}
        >
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
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
  /** Adds the rise-and-glow hover state. Off for panels that aren't cards. */
  hover?: boolean;
}) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-border bg-surface p-6 shadow-xs',
        // `transform` is listed here rather than relying on the `.lift`
        // utility so the hover state below stays in the same declaration as
        // the transition that drives it.
        'transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-out-quart)]',
        hover && 'hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg active:translate-y-0 active:duration-100',
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
