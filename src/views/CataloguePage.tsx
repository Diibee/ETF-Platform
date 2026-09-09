'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import type { ETF } from '../types/etf';
import etfsData from '../data/etfs.json';
import { EtfCard } from '../components/catalogue/EtfCard';
import { EtfFilters, type FilterState } from '../components/catalogue/EtfFilters';
import { AnimatedNumber, StaggerGroup, StaggerItem, EASE_OUT_QUART } from '@/components/motion';

const etfs = etfsData as unknown as ETF[];

const DEFAULT_FILTERS: FilterState = {
  assetClass: '',
  dividendPolicy: '',
  domicile: '',
  terMax: 1.0,
  riskMax: 7,
  search: '',
};

export default function CataloguePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const shouldReduce = useReducedMotion();

  const filtered = useMemo(() => {
    return etfs.filter(etf => {
      if (filters.assetClass && etf.assetClass !== filters.assetClass) return false;
      if (filters.dividendPolicy && etf.dividendPolicy !== filters.dividendPolicy) return false;
      if (filters.domicile && etf.domicile !== filters.domicile) return false;
      if (etf.ter > filters.terMax) return false;
      if (etf.riskClass > filters.riskMax) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !etf.name.toLowerCase().includes(q) &&
          !etf.isin.toLowerCase().includes(q) &&
          !etf.ticker.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">Catalogo ETF</h1>
            <p className="mt-1 text-sm text-fg-muted">
              {/* Tweened rather than swapped: as a filter tightens, watching the
                  figure run down is the feedback that the filter did something,
                  which matters most when the grid is scrolled out of view. */}
              <AnimatedNumber value={filtered.length} className="tnum font-semibold text-fg" /> ETF
              su {etfs.length}, selezionabili su Borsa Italiana
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            aria-expanded={filtersOpen}
            aria-controls="mobile-filters"
            className="press flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg-muted transition-colors duration-200 hover:border-brand/50 hover:text-fg lg:hidden"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className={`transition-transform duration-300 ease-[var(--ease-out-quart)] ${filtersOpen ? 'rotate-180' : ''}`}
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filtri
          </button>
        </div>

        {/* Mobile filters drawer */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <m.div
              id="mobile-filters"
              className="overflow-hidden lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: shouldReduce ? 0 : 0.28, ease: EASE_OUT_QUART }}
            >
              <div className="mb-4">
                <EtfFilters filters={filters} onChange={setFilters} />
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20">
              <EtfFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            {filtered.length === 0 ? (
              <m.div
                className="flex flex-col items-center justify-center gap-1 py-20 text-center"
                initial={shouldReduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              >
                <p className="text-lg font-medium text-fg-muted">Nessun ETF trovato</p>
                <p className="text-sm text-fg-subtle">Prova a modificare i filtri</p>
              </m.div>
            ) : (
              /* The group fires once, cascading the grid on first paint. After
                 that its animate state stays "show", so a card that appears
                 when a filter loosens still fades up on its own — but the ~90
                 cards that were already on screen are never re-animated by a
                 keystroke in the search box. */
              <StaggerGroup
                step={0.02}
                amount={0.02}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map(etf => (
                  <StaggerItem key={etf.isin} y={12} className="h-full">
                    <EtfCard etf={etf} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
