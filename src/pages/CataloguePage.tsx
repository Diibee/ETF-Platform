import { useState, useMemo } from 'react';
import type { ETF } from '../types/etf';
import etfsData from '../data/etfs.json';
import { EtfCard } from '../components/catalogue/EtfCard';
import { EtfFilters, type FilterState } from '../components/catalogue/EtfFilters';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalogo ETF</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {filtered.length} ETF su {etfs.length}, selezionabili su Borsa Italiana
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="lg:hidden flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filtri
          </button>
        </div>

        {/* Mobile filters drawer */}
        {filtersOpen && (
          <div className="lg:hidden mb-4">
            <EtfFilters filters={filters} onChange={f => { setFilters(f); }} />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <EtfFilters filters={filters} onChange={setFilters} />
          </aside>

          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-lg">Nessun ETF trovato</p>
                <p className="text-sm mt-1">Prova a modificare i filtri</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(etf => (
                  <EtfCard key={etf.isin} etf={etf} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
