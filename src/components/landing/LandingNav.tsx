'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/lib/cn';

const SECTIONS = [
  { href: '#problema', label: 'Il problema' },
  { href: '#funzioni', label: 'Funzioni' },
  { href: '#dati', label: 'Dati' },
  { href: '#come-funziona', label: 'Come funziona' },
  { href: '#accesso', label: 'Accesso' },
  { href: '#faq', label: 'FAQ' },
];

/**
 * Sticky landing header.
 *
 * Transparent over the hero, then condenses into a bordered glass bar once the
 * page scrolls. The scroll listener is passive and only ever flips a boolean,
 * so it cannot become a scroll-jank source. The active-section highlight uses
 * IntersectionObserver rather than scroll math for the same reason.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/" aria-label="ETF Lab — home" className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Sezioni della pagina" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {SECTIONS.map(s => (
              <li key={s.href}>
                <a
                  href={s.href}
                  aria-current={active === s.href ? 'true' : undefined}
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

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/simulator"
            className="hidden min-h-10 cursor-pointer items-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-fg shadow-sm transition-colors duration-200 hover:bg-brand-hover sm:inline-flex"
          >
            Apri il simulatore
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label="Menu di navigazione"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="landing-mobile-nav"
          aria-label="Navigazione mobile"
          className="glass border-t border-border lg:hidden"
        >
          <ul className="shell flex flex-col py-2">
            {SECTIONS.map(s => (
              <li key={s.href}>
                <a
                  href={s.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-2 text-[0.9375rem] font-medium text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li className="mt-2 px-2 pb-2">
              <Link
                href="/simulator"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-fg"
              >
                Apri il simulatore
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
