'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ScrollProgress } from '@/components/motion';
import { cn } from '@/lib/cn';
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect';
import { CTA } from './cta';

const SECTIONS = [
  { href: '#problema', label: 'Il problema' },
  { href: '#funzioni', label: 'Funzioni' },
  { href: '#dati', label: 'Dati' },
  { href: '#come-funziona', label: 'Come funziona' },
  { href: '#accesso', label: 'Accesso' },
  { href: '#faq', label: 'FAQ' },
];

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/**
 * Sticky landing header.
 *
 * Transparent over the hero, then condenses into a bordered glass bar once the
 * page scrolls. The scroll listener is passive and only ever flips a boolean,
 * so it cannot become a scroll-jank source. The active-section highlight uses
 * IntersectionObserver rather than scroll math for the same reason.
 *
 * The highlight itself is a single pill that slides between links instead of
 * six pills fading in and out — the continuity is what tells you the page
 * moved you rather than that you clicked something. It is driven by measured
 * offsets rather than Motion's layoutId deliberately: layout projection lives
 * in the domMax feature bundle, and loading ~10kb more JavaScript for one
 * indicator is a bad trade when offsetLeft gives the same result.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);
  const shouldReduce = useReducedMotion();

  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const targets = SECTIONS.map(s => document.querySelector(s.href)).filter(
      (el): el is Element => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      // Band across the upper-middle of the viewport: a section counts as
      // "current" once its top clears the header but before it exits.
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5] },
    );

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  // Re-measure the pill whenever the active link changes, and again on resize:
  // the nav is a flex row, so a viewport change moves every link at once.
  const measure = useCallback(() => {
    const node = active ? linkRefs.current.get(active) : undefined;
    if (!node || !listRef.current) {
      setPill(null);
      return;
    }
    setPill({ x: node.offsetLeft, width: node.offsetWidth });
  }, [active]);

  useIsomorphicLayoutEffect(measure, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Lock the page behind the mobile sheet so it can't scroll underneath.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out-quart)]',
        scrolled ? 'glass border-b border-border shadow-xs' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="ETF Lab — home"
          className="shrink-0 rounded-md transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-[1.03] active:scale-100"
        >
          <Logo />
        </Link>

        <nav aria-label="Sezioni della pagina" className="hidden lg:block">
          <ul ref={listRef} className="relative flex items-center gap-0.5">
            {/* Sits behind the labels; pointer-events-none keeps it out of the
                way of the anchors it is tracking. */}
            <AnimatePresence>
              {pill && (
                <m.li
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-lg bg-surface-2"
                  initial={{ opacity: 0, x: pill.x, width: pill.width }}
                  animate={{ opacity: 1, x: pill.x, width: pill.width }}
                  exit={{ opacity: 0 }}
                  transition={
                    shouldReduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 38, mass: 0.7 }
                  }
                />
              )}
            </AnimatePresence>

            {SECTIONS.map(s => (
              <li key={s.href}>
                <a
                  href={s.href}
                  ref={node => {
                    if (node) linkRefs.current.set(s.href, node);
                    else linkRefs.current.delete(s.href);
                  }}
                  aria-current={active === s.href ? 'location' : undefined}
                  className={cn(
                    'inline-flex min-h-9 cursor-pointer items-center rounded-lg px-3 text-sm font-medium',
                    'transition-colors duration-200',
                    active === s.href ? 'text-fg' : 'text-fg-muted hover:text-fg',
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={CTA.simulator.href}
            className="sheen press hidden min-h-10 cursor-pointer items-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-fg shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-hover hover:shadow-md sm:inline-flex"
          >
            {CTA.simulator.label}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label="Menu di navigazione"
            className="press inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {/* The bars cross over into an X rather than swapping glyphs, so
                the control shows what closing it will do. */}
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-quart)]',
                  menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5',
                )}
              />
              <span
                className={cn(
                  'absolute top-1/2 left-0 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-300 ease-[var(--ease-out-quart)]',
                  menuOpen ? 'opacity-0' : 'opacity-100',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-quart)]',
                  menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <ScrollProgress />

      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.nav
            id="landing-mobile-nav"
            aria-label="Navigazione mobile"
            className="glass overflow-hidden border-t border-border lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.28, ease: EASE_OUT_QUART }}
          >
            <ul className="shell flex flex-col py-2">
              {SECTIONS.map(s => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-2 text-[0.9375rem] font-medium text-fg-muted transition-[color,background-color,padding] duration-200 hover:bg-surface-2 hover:pl-3 hover:text-fg"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 px-2 pb-2">
                <Link
                  href={CTA.simulator.href}
                  onClick={() => setMenuOpen(false)}
                  className="press flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-fg"
                >
                  {CTA.simulator.label}
                </Link>
              </li>
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
