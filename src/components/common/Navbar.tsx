'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/cn';

const LINKS = [
  { href: '/catalogue', label: 'Catalogo' },
  { href: '/simulator', label: 'Simulatore' },
  { href: '/questionnaire', label: 'Profilo' },
];

/** Utility bar for the app routes. The landing page uses `LandingNav` instead. */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="rounded-md" aria-label="ETF Lab — home">
          <Logo />
        </Link>

        <nav aria-label="Navigazione principale" className="hidden items-center gap-1 sm:flex">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive(l.href)
                  ? 'bg-brand-soft text-brand-soft-fg'
                  : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
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
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="app-mobile-nav" aria-label="Navigazione mobile" className="border-t border-border bg-surface px-4 py-2 sm:hidden">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-200',
                isActive(l.href) ? 'text-brand-soft-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
