import type { AssetClass, DividendPolicy, Domicile } from '../../types/etf';

export interface FilterState {
  assetClass: AssetClass | '';
  dividendPolicy: DividendPolicy | '';
  domicile: Domicile | '';
  terMax: number;
  riskMax: number;
  search: string;
}

interface EtfFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const SELECT_CLS =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white';

const PILL_BASE =
  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap';
const PILL_ON = 'bg-blue-600 text-white';
const PILL_OFF = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
function pill(active: boolean) {
  return `${PILL_BASE} ${active ? PILL_ON : PILL_OFF}`;
}

const RISK_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-yellow-100 text-yellow-700',
  5: 'bg-red-100 text-red-700',
  6: 'bg-red-100 text-red-700',
  7: 'bg-red-100 text-red-700',
};

export function EtfFilters({ filters, onChange }: EtfFiltersProps) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">

      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Cerca
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Nome, ISIN, ticker..."
          className={SELECT_CLS}
        />
      </div>

      {/* Asset class — select (labels too long for pills) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Classe d'attivo
        </label>
        <select
          value={filters.assetClass}
          onChange={e => set('assetClass', e.target.value as AssetClass | '')}
          className={SELECT_CLS}
        >
          <option value="">Tutte le classi</option>
          <option value="equity">Azionario</option>
          <option value="bonds">Obbligazionario</option>
          <option value="commodities">Materie Prime</option>
          <option value="real_estate">Immobiliare</option>
        </select>
      </div>

      {/* Dividend policy — 3 pills with short labels */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Politica dividendi
        </label>
        <div className="flex gap-2">
          <button onClick={() => set('dividendPolicy', '')} className={pill(filters.dividendPolicy === '')}>
            Tutti
          </button>
          <button onClick={() => set('dividendPolicy', 'acc')} className={pill(filters.dividendPolicy === 'acc')}>
            ♻️ Acc.
          </button>
          <button onClick={() => set('dividendPolicy', 'dist')} className={pill(filters.dividendPolicy === 'dist')}>
            💰 Dist.
          </button>
        </div>
      </div>

      {/* Domicile — short pills, always fit */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Domicilio
        </label>
        <div className="flex gap-1.5">
          {(['', 'IE', 'LU', 'DE', 'FR'] as const).map(d => (
            <button key={d} onClick={() => set('domicile', d)} className={pill(filters.domicile === d)}>
              {d === '' ? 'Tutti' : d}
            </button>
          ))}
        </div>
      </div>

      {/* TER — select */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          TER massimo
        </label>
        <select
          value={filters.terMax}
          onChange={e => set('terMax', Number(e.target.value))}
          className={SELECT_CLS}
        >
          <option value={1.0}>Tutti</option>
          <option value={0.10}>≤ 0.10%</option>
          <option value={0.20}>≤ 0.20%</option>
          <option value={0.30}>≤ 0.30%</option>
          <option value={0.50}>≤ 0.50%</option>
        </select>
      </div>

      {/* Risk class — range slider */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Rischio max:{' '}
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${RISK_COLORS[filters.riskMax]}`}>
            SRI {filters.riskMax}
          </span>
        </label>
        <input
          type="range"
          min={1}
          max={7}
          value={filters.riskMax}
          onChange={e => set('riskMax', Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>1 basso</span>
          <span>7 alto</span>
        </div>
      </div>

      <button
        onClick={() =>
          onChange({ assetClass: '', dividendPolicy: '', domicile: '', terMax: 1.0, riskMax: 7, search: '' })
        }
        className="text-xs text-blue-600 hover:underline"
      >
        Azzera filtri
      </button>
    </div>
  );
}
