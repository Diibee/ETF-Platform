import type { ETF, SimulationInput, RebalancingMode } from '../../types/etf';

export interface PortfolioEntryState {
  isin: string;
  weight: number;
}

export interface SimulatorFormState {
  initialDeposit: number;
  periodicContribution: number;
  contributionFrequency: SimulationInput['contributionFrequency'];
  years: number;
  compoundFrequency: SimulationInput['compoundFrequency'];
  portfolioEntries: PortfolioEntryState[];
  customReturn: number;
  taxRegime: SimulationInput['taxRegime'];
  includeBollo: boolean;
  rebalancing: RebalancingMode;
  inflationRate: number;
}

interface SimulatorFormProps {
  state: SimulatorFormState;
  etfs: ETF[];
  onChange: (s: SimulatorFormState) => void;
}

function set<K extends keyof SimulatorFormState>(
  prev: SimulatorFormState,
  key: K,
  value: SimulatorFormState[K],
): SimulatorFormState {
  return { ...prev, [key]: value };
}

const FREQ_OPTIONS: { value: SimulationInput['contributionFrequency']; label: string }[] = [
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'annual', label: 'Annuale' },
];

const INPUT_CLS = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

export function SimulatorForm({ state, etfs, onChange }: SimulatorFormProps) {
  const portfolioMap = new Map(state.portfolioEntries.map(e => [e.isin, e.weight]));
  const totalWeight = state.portfolioEntries.reduce((s, e) => s + e.weight, 0);
  const available = etfs.filter(e => !portfolioMap.has(e.isin));
  const hasPortfolio = state.portfolioEntries.length > 0;

  function addEtf(isin: string) {
    if (!isin || portfolioMap.has(isin)) return;
    const remaining = Math.max(0, 100 - totalWeight);
    const newWeight = remaining > 0 ? Math.round(remaining * 10) / 10 : 10;
    onChange(set(state, 'portfolioEntries', [...state.portfolioEntries, { isin, weight: newWeight }]));
  }

  function removeEtf(isin: string) {
    onChange(set(state, 'portfolioEntries', state.portfolioEntries.filter(e => e.isin !== isin)));
  }

  function updateWeight(isin: string, weight: number) {
    const w = Math.max(0, Math.min(100, Math.round(weight * 10) / 10));
    onChange(set(state, 'portfolioEntries', state.portfolioEntries.map(e =>
      e.isin === isin ? { ...e, weight: w } : e,
    )));
  }

  function normalize() {
    if (totalWeight === 0) return;
    const factor = 100 / totalWeight;
    onChange(set(state, 'portfolioEntries',
      state.portfolioEntries.map(e => ({ ...e, weight: Math.round(e.weight * factor * 10) / 10 })),
    ));
  }

  function clearPortfolio() {
    onChange(set(state, 'portfolioEntries', []));
  }

  const totalBadgeColor =
    Math.abs(totalWeight - 100) < 0.5 ? 'bg-green-100 text-green-700' :
    totalWeight > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Parametri</h2>

      {/* Capitale iniziale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Investimento iniziale (€)</label>
        <input type="number" min={0} step={500} value={state.initialDeposit}
          onChange={e => onChange(set(state, 'initialDeposit', Math.max(0, Number(e.target.value))))}
          className={INPUT_CLS} />
      </div>

      {/* Contributo periodico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contributo periodico (€)</label>
        <div className="flex gap-2">
          <input type="number" min={0} step={50} value={state.periodicContribution}
            onChange={e => onChange(set(state, 'periodicContribution', Math.max(0, Number(e.target.value))))}
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select value={state.contributionFrequency}
            onChange={e => onChange(set(state, 'contributionFrequency', e.target.value as SimulationInput['contributionFrequency']))}
            className="w-32 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Durata */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Durata: <span className="text-blue-600 font-semibold">{state.years} anni</span>
        </label>
        <input type="range" min={1} max={40} value={state.years}
          onChange={e => onChange(set(state, 'years', Number(e.target.value)))}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>1 anno</span><span>40 anni</span></div>
      </div>

      <hr className="border-gray-100" />

      {/* Portfolio multi-ETF */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Portafoglio ETF</label>
          {hasPortfolio && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${totalBadgeColor}`}>
              Σ {totalWeight.toFixed(1)}%
            </span>
          )}
        </div>

        {hasPortfolio ? (
          <div className="space-y-1.5 mb-2">
            {state.portfolioEntries.map(entry => {
              const etf = etfs.find(x => x.isin === entry.isin);
              if (!etf) return null;
              return (
                <div key={entry.isin} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700 truncate" title={etf.name}>
                      {etf.ticker}
                    </span>
                    <button onClick={() => removeEtf(entry.isin)}
                      className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">×</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} step={0.5} value={entry.weight}
                      onChange={e => updateWeight(entry.isin, Number(e.target.value))}
                      className="flex-1 accent-blue-600 min-w-0" />
                    <input type="number" min={0} max={100} step={0.5} value={entry.weight}
                      onChange={e => updateWeight(entry.isin, Number(e.target.value))}
                      className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-right" />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2 mt-2">
              {Math.abs(totalWeight - 100) >= 0.5 && (
                <button onClick={normalize}
                  className="flex-1 text-xs px-2 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                  Normalizza a 100%
                </button>
              )}
              <button onClick={clearPortfolio}
                className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                Svuota
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-2">Nessun ETF selezionato: viene usato il rendimento personalizzato qui sotto.</p>
        )}

        {available.length > 0 && (
          <select value="" onChange={e => addEtf(e.target.value)} className={INPUT_CLS}>
            <option value="">+ Aggiungi ETF…</option>
            {available.map(etf => {
              const cagr = etf.cagr5y ?? etf.cagr3y;
              return (
                <option key={etf.isin} value={etf.isin}>
                  {etf.ticker} – {etf.name}{cagr != null ? ` (${cagr.toFixed(1)}%)` : ''}
                </option>
              );
            })}
          </select>
        )}

        {!hasPortfolio && (
          <div className="mt-2 flex items-center gap-2">
            <input type="number" min={-20} max={30} step={0.1} value={state.customReturn}
              onChange={e => onChange(set(state, 'customReturn', Number(e.target.value)))}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <span className="text-sm text-gray-600">% annuo (personalizzato)</span>
          </div>
        )}
      </div>

      {/* Frequenza capitalizzazione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Frequenza capitalizzazione</label>
        <select value={state.compoundFrequency}
          onChange={e => onChange(set(state, 'compoundFrequency', e.target.value as SimulationInput['compoundFrequency']))}
          className={INPUT_CLS}>
          {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <hr className="border-gray-100" />

      {/* Regime fiscale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Regime fiscale</label>
        <div className="flex gap-2">
          {([{ value: 'administered', label: 'Amministrato' }, { value: 'declarative', label: 'Dichiarativo' }] as const).map(opt => (
            <button key={opt.value} onClick={() => onChange(set(state, 'taxRegime', opt.value))}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                state.taxRegime === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">L'impatto fiscale lordo è identico: cambia solo il momento del prelievo.</p>
      </div>

      {/* Rebalancing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ribilanciamento</label>
        <div className="flex gap-2">
          {([{ value: 'annual' as const, label: 'Annuale' }, { value: 'none' as const, label: 'Nessuno (drift)' }]).map(opt => (
            <button key={opt.value} onClick={() => onChange(set(state, 'rebalancing', opt.value))}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                state.rebalancing === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Annuale: i pesi tornano al target ogni anno. Nessuno: gli ETF crescono indipendentemente e i pesi driftano.
        </p>
      </div>

      {/* Bollo */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Imposta di bollo</p>
          <p className="text-xs text-gray-400">0,20% annuo sul valore del portafoglio</p>
        </div>
        <button onClick={() => onChange(set(state, 'includeBollo', !state.includeBollo))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            state.includeBollo ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            state.includeBollo ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Inflazione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inflazione attesa: <span className="text-blue-600 font-semibold">{state.inflationRate.toFixed(1)}%</span>
        </label>
        <input type="range" min={0} max={6} step={0.5} value={state.inflationRate}
          onChange={e => onChange(set(state, 'inflationRate', Number(e.target.value)))}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>0%</span><span>6%</span></div>
      </div>
    </div>
  );
}
