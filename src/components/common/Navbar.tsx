'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/cn';
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect';

const LINKS = [
  { href: '/catalogue', label: 'Catalogo' },
  { href: '/simulator', label: 'Simulatore' },
  { href: '/questionnaire', label: 'Profilo' },
];

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/**
 * Utility bar for the app routes. The landing page uses `LandingNav` instead.
 *
 * The active-route highlight slides between tabs rather than cutting, using
 * the same measured-offset approach as the landing nav — see the note there
 * for why this doesn't use Motion's layout projection.
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);
  const shouldReduce = useReducedMotion();
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const measure = useCallback(() => {
    const current = LINKS.find(l => pathname === l.href || pathname.startsWith(`${l.href}/`));
    const node = current ? linkRefs.current.get(current.href) : undefined;
    setPill(node ? { x: node.offsetLeft, width: node.offsetWidth } : null);
  }, [pathname]);

  useIsomorphicLayoutEffect(measure, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-md transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-[1.03] active:scale-100"
          aria-label="ETF Lab — home"
        >
          <Logo />
        </Link>

        <nav aria-label="Navigazione principale" className="relative hidden items-center gap-1 sm:flex">
          <AnimatePresence>
            {pill && (
              <m.span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 left-0 -z-10 rounded-lg bg-brand-soft"
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

          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              ref={node => {
                if (node) linkRefs.current.set(l.href, node);
                else linkRefs.current.delete(l.href);
              }}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive(l.href) ? 'text-brand-soft-fg' : 'text-fg-muted hover:text-fg',
              )}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle className="ml-1" />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="app-mobile-nav"
            aria-label="Menu di navigazione"
            className="press inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
          >
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-quart)]',
                  menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5',
                )}
              />
              <span
                className={cn(
                  'absolute top-1/2 left-0 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-300',
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

      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.nav
            id="app-mobile-nav"
            aria-label="Navigazione mobile"
            className="overflow-hidden border-t border-border bg-surface px-4 sm:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.26, ease: EASE_OUT_QUART }}
          >
            <div className="py-2">
              {LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-[color,background-color,padding] duration-200',
                    isActive(l.href)
                      ? 'bg-brand-soft text-brand-soft-fg'
                      : 'text-fg-muted hover:bg-surface-2 hover:pl-4 hover:text-fg',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
