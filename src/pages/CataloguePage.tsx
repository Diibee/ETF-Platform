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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Catalogo ETF</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} ETF su {etfs.length}, selezionabili su Borsa Italiana
          </p>
        </div>

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <EtfFilters filters={filters} onChange={setFilters} />
          </aside>

          <main className="flex-1">
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
