'use client';

import { useId } from 'react';
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

const INPUT_CLS = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

/* The previous `gray-400 / gray-500` pair measured 3.1:1 on these surfaces,
   below the 4.5:1 floor. `--fg-subtle` is the token for de-emphasised text and
   clears AA in both themes. */
const HINT_CLS = 'text-xs text-fg-subtle';

export function SimulatorForm({ state, etfs, onChange }: SimulatorFormProps) {
  // Stable ids so every control is programmatically tied to its visible label.
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

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
    Math.abs(totalWeight - 100) < 0.5 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
    totalWeight > 100 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parametri</h2>

      {/* Capitale iniziale */}
      <div>
        <label htmlFor={id('initial')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Investimento iniziale (€)
        </label>
        <input id={id('initial')} type="number" min={0} step={500} value={state.initialDeposit}
          onChange={e => onChange(set(state, 'initialDeposit', Math.max(0, Number(e.target.value))))}
          className={INPUT_CLS} />
      </div>

      {/* Contributo periodico */}
      <div>
        <label htmlFor={id('contrib')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contributo periodico (€)
        </label>
        <div className="flex gap-2">
          <input id={id('contrib')} type="number" min={0} step={50} value={state.periodicContribution}
            onChange={e => onChange(set(state, 'periodicContribution', Math.max(0, Number(e.target.value))))}
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <select value={state.contributionFrequency}
            aria-label="Frequenza del contributo periodico"
            onChange={e => onChange(set(state, 'contributionFrequency', e.target.value as SimulationInput['contributionFrequency']))}
            className="w-32 cursor-pointer border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Durata */}
      <div>
        <label htmlFor={id('years')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Durata: <span className="text-blue-600 dark:text-blue-400 font-semibold">{state.years} anni</span>
        </label>
        <input id={id('years')} type="range" min={1} max={40} value={state.years}
          onChange={e => onChange(set(state, 'years', Number(e.target.value)))}
          className="w-full accent-blue-600" />
        <div className={`flex justify-between ${HINT_CLS} mt-0.5`}><span>1 anno</span><span>40 anni</span></div>
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Portfolio multi-ETF */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Portafoglio ETF</p>
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
                <div key={entry.isin} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={etf.name}>
                      {etf.ticker}
                    </span>
                    <button type="button" onClick={() => removeEtf(entry.isin)}
                      aria-label={`Rimuovi ${etf.ticker} dal portafoglio`}
                      className="cursor-pointer text-xs text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0">
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} step={0.5} value={entry.weight}
                      aria-label={`Peso di ${etf.ticker} in percentuale`}
                      onChange={e => updateWeight(entry.isin, Number(e.target.value))}
                      className="flex-1 accent-blue-600 min-w-0" />
                    <input type="number" min={0} max={100} step={0.5} value={entry.weight}
                      aria-label={`Peso di ${etf.ticker} in percentuale, valore esatto`}
                      onChange={e => updateWeight(entry.isin, Number(e.target.value))}
                      className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <span aria-hidden="true" className="text-xs text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2 mt-2">
              {Math.abs(totalWeight - 100) >= 0.5 && (
                <button type="button" onClick={normalize}
                  className="flex-1 cursor-pointer text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  Normalizza a 100%
                </button>
              )}
              <button type="button" onClick={clearPortfolio}
                className="cursor-pointer text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                Svuota
              </button>
            </div>
          </div>
        ) : (
          <p className={`${HINT_CLS} mb-2`}>Nessun ETF selezionato: viene usato il rendimento personalizzato qui sotto.</p>
        )}

        {available.length > 0 && (
          <select value="" onChange={e => addEtf(e.target.value)}
            aria-label="Aggiungi un ETF al portafoglio"
            className={`${INPUT_CLS} cursor-pointer`}>
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
            <input id={id('custom')} type="number" min={-20} max={30} step={0.1} value={state.customReturn}
              onChange={e => onChange(set(state, 'customReturn', Number(e.target.value)))}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <label htmlFor={id('custom')} className="text-sm text-gray-600 dark:text-gray-400">
              % annuo (personalizzato)
            </label>
          </div>
        )}
      </div>

      {/* Frequenza capitalizzazione */}
      <div>
        <label htmlFor={id('compound')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Frequenza capitalizzazione
        </label>
        <select id={id('compound')} value={state.compoundFrequency}
          onChange={e => onChange(set(state, 'compoundFrequency', e.target.value as SimulationInput['compoundFrequency']))}
          className={`${INPUT_CLS} cursor-pointer`}>
          {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Regime fiscale — a radio group expressed as buttons, so it needs the
          matching ARIA roles to be announced as a choice rather than actions. */}
      <div role="radiogroup" aria-labelledby={id('regime-label')}>
        <p id={id('regime-label')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Regime fiscale
        </p>
        <div className="flex gap-2">
          {([{ value: 'administered', label: 'Amministrato' }, { value: 'declarative', label: 'Dichiarativo' }] as const).map(opt => (
            <button key={opt.value} type="button" role="radio"
              aria-checked={state.taxRegime === opt.value}
              onClick={() => onChange(set(state, 'taxRegime', opt.value))}
              className={`flex-1 cursor-pointer py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                state.taxRegime === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className={`${HINT_CLS} mt-1`}>L&apos;impatto fiscale lordo è identico: cambia solo il momento del prelievo.</p>
      </div>

      {/* Rebalancing */}
      <div role="radiogroup" aria-labelledby={id('rebal-label')}>
        <p id={id('rebal-label')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ribilanciamento
        </p>
        <div className="flex gap-2">
          {([{ value: 'annual' as const, label: 'Annuale' }, { value: 'none' as const, label: 'Nessuno (drift)' }]).map(opt => (
            <button key={opt.value} type="button" role="radio"
              aria-checked={state.rebalancing === opt.value}
              onClick={() => onChange(set(state, 'rebalancing', opt.value))}
              className={`flex-1 cursor-pointer py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                state.rebalancing === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className={`${HINT_CLS} mt-1`}>
          Annuale: i pesi tornano al target ogni anno. Nessuno: gli ETF crescono indipendentemente e i pesi driftano.
        </p>
      </div>

      {/* Bollo — a toggle, so `role="switch"` + `aria-checked` and a real name. */}
      <div className="flex items-center justify-between">
        <div>
          <p id={id('bollo-label')} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Imposta di bollo
          </p>
          <p id={id('bollo-desc')} className={HINT_CLS}>0,20% annuo sul valore del portafoglio</p>
        </div>
        <button type="button" role="switch"
          aria-checked={state.includeBollo}
          aria-labelledby={id('bollo-label')}
          aria-describedby={id('bollo-desc')}
          onClick={() => onChange(set(state, 'includeBollo', !state.includeBollo))}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            state.includeBollo ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}>
          <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            state.includeBollo ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Inflazione */}
      <div>
        <label htmlFor={id('inflation')} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Inflazione attesa: <span className="text-blue-600 dark:text-blue-400 font-semibold">{state.inflationRate.toFixed(1)}%</span>
        </label>
        <input id={id('inflation')} type="range" min={0} max={6} step={0.5} value={state.inflationRate}
          onChange={e => onChange(set(state, 'inflationRate', Number(e.target.value)))}
          className="w-full accent-blue-600" />
        <div className={`flex justify-between ${HINT_CLS} mt-0.5`}><span>0%</span><span>6%</span></div>
      </div>
    </div>
  );
}
