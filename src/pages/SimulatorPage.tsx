import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ETF, PortfolioEntry, SimulationInput } from '../types/etf';
import etfsData from '../data/etfs.json';
import { runSimulation, derivedAnnualReturn, derivedVolatility, computeInvestedByYear } from '../utils/compound';
import { computePortfolioMetrics } from '../utils/portfolio';
import { SimulatorForm, type SimulatorFormState } from '../components/simulator/SimulatorForm';
import { SimulatorChart } from '../components/simulator/SimulatorChart';
import { MonteCarloChart, type McRow } from '../components/simulator/MonteCarloChart';
import { CorrelationHeatmap } from '../components/simulator/CorrelationHeatmap';
import { LookThroughTable } from '../components/simulator/LookThroughTable';
import { OverlapDiagrams } from '../components/simulator/OverlapVenn';
import { PortfolioAnalysis } from '../components/simulator/PortfolioAnalysis';
import { WeightDriftChart } from '../components/simulator/WeightDriftChart';
import { ReturnDisclaimer } from '../components/common/ReturnDisclaimer';

const etfs = etfsData as unknown as ETF[];

const DEFAULT_FORM: SimulatorFormState = {
  initialDeposit: 10000,
  periodicContribution: 300,
  contributionFrequency: 'monthly',
  years: 20,
  compoundFrequency: 'monthly',
  portfolioEntries: [{ isin: 'IE00B4L5Y983', weight: 100 }],
  customReturn: 7.0,
  taxRegime: 'administered',
  includeBollo: true,
  rebalancing: 'annual',
  inflationRate: 2.0,
};

function formatEur(n: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function SummaryCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: 'blue' | 'green' | 'purple';
}) {
  const border = accent === 'blue' ? 'border-blue-200 bg-blue-50' :
    accent === 'green' ? 'border-green-200 bg-green-50' : 'border-purple-200 bg-purple-50';
  const text = accent === 'blue' ? 'text-blue-700' :
    accent === 'green' ? 'text-green-700' : 'text-purple-700';
  return (
    <div className={`border rounded-xl p-4 ${border}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

interface LocationStateHydration {
  portfolio?: PortfolioEntry[];
  initialDeposit?: number;
  periodicContribution?: number;
  contributionFrequency?: SimulationInput['contributionFrequency'];
  years?: number;
}

export default function SimulatorPage() {
  const location = useLocation();
  const [form, setForm] = useState<SimulatorFormState>(DEFAULT_FORM);

  // Hydrate from React Router state (e.g. when navigated from a recommendation set)
  useEffect(() => {
    const incoming = location.state as LocationStateHydration | null;
    if (!incoming) return;
    setForm(prev => ({
      ...prev,
      ...(incoming.portfolio && incoming.portfolio.length > 0
        ? { portfolioEntries: incoming.portfolio.map(p => ({ isin: p.etf.isin, weight: p.weight })) }
        : {}),
      ...(typeof incoming.initialDeposit === 'number' ? { initialDeposit: incoming.initialDeposit } : {}),
      ...(typeof incoming.periodicContribution === 'number' ? { periodicContribution: incoming.periodicContribution } : {}),
      ...(incoming.contributionFrequency ? { contributionFrequency: incoming.contributionFrequency } : {}),
      ...(typeof incoming.years === 'number' ? { years: Math.max(1, Math.min(40, incoming.years)) } : {}),
    }));
  }, [location.state]);

  const { input, annualReturn, volatility, result, chartData, mcChartData, totalInvested, finalPortfolio, portfolioMetrics } = useMemo(() => {
    const portfolio: PortfolioEntry[] = form.portfolioEntries
      .map(e => {
        const etf = etfs.find(x => x.isin === e.isin);
        return etf ? { etf, weight: e.weight } : null;
      })
      .filter((p): p is PortfolioEntry => p !== null);

    let workingPortfolio: PortfolioEntry[];
    if (portfolio.length > 0) {
      workingPortfolio = portfolio;
    } else {
      const customEtf: ETF = {
        id: 'custom', isin: '', ticker: '', name: 'Custom', index: '',
        assetClass: 'equity', domicile: 'IE', currency: 'EUR', hedged: false,
        ter: 0, aum: 0, dividendPolicy: 'acc', replicationMethod: 'full_physical',
        riskClass: 5, inceptionDate: '', exchange: '', tradingCurrency: 'EUR',
        cagr5y: form.customReturn,
      };
      workingPortfolio = [{ etf: customEtf, weight: 100 }];
    }

    const simInput: SimulationInput = {
      initialDeposit: form.initialDeposit,
      periodicContribution: form.periodicContribution,
      contributionFrequency: form.contributionFrequency,
      years: form.years,
      compoundFrequency: form.compoundFrequency,
      portfolio: workingPortfolio,
      taxRegime: form.taxRegime,
      includeBollo: form.includeBollo,
      rebalancing: form.rebalancing,
    };

    const res = runSimulation(simInput, form.inflationRate);
    const invested = computeInvestedByYear(form.initialDeposit, form.periodicContribution, form.contributionFrequency, form.years);

    const chart = res.yearlyGross.map((gross, i) => ({
      year: i + 1,
      lordo: Math.round(gross),
      netto: Math.round(res.yearlyNet[i] ?? 0),
      investito: Math.round(invested[i] ?? 0),
    }));

    const mcChart: McRow[] = res.monteCarlo.p10.map((p10, i) => {
      const p90 = res.monteCarlo.p90[i] ?? 0;
      return {
        year: i + 1,
        p10: Math.round(p10),
        mcBand: Math.round(Math.max(0, p90 - p10)),
        p50: Math.round(res.monteCarlo.p50[i] ?? 0),
      };
    });

    return {
      input: simInput,
      annualReturn: derivedAnnualReturn(workingPortfolio),
      volatility: derivedVolatility(workingPortfolio),
      result: res,
      chartData: chart,
      mcChartData: mcChart,
      totalInvested: invested[form.years - 1] ?? form.initialDeposit,
      finalPortfolio: portfolio,
      portfolioMetrics: portfolio.length > 0 ? computePortfolioMetrics(portfolio) : null,
    };
  }, [form]);

  const taxDrag = result.grossFinal - result.netFinal;
  const gain = result.netFinal - totalInvested;
  const weightSum = finalPortfolio.reduce((s, e) => s + e.weight, 0);
  const weightOff = Math.abs(weightSum - 100) >= 0.5;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Simulatore Compound</h1>
          <p className="text-gray-500 text-sm mt-1">
            Proiezione lordo / netto con tassazione italiana (capital gain 26% + bollo 0,2%)
          </p>
        </div>

        <div className="flex gap-6 items-start">
          <aside className="w-72 flex-shrink-0 sticky top-20">
            <SimulatorForm state={form} etfs={etfs} onChange={setForm} />
          </aside>

          <main className="flex-1 space-y-5">
            {/* Portfolio summary */}
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="text-sm text-gray-600">
                  Rendimento stimato:{' '}
                  <span className="font-bold text-blue-600">{annualReturn.toFixed(2)}% annuo</span>
                </span>
                <span className="text-xs text-gray-400">
                  Volatilità: <span className="font-medium text-gray-600">{volatility.toFixed(1)}%</span>
                  {' '}· {form.years} anni
                  {finalPortfolio.length > 0 && <> · {finalPortfolio.length} ETF</>}
                </span>
              </div>
              {weightOff && finalPortfolio.length > 0 && (
                <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-2">
                  ⚠️ I pesi del portafoglio sommano a {weightSum.toFixed(1)}%. I risultati sono calcolati sui pesi attuali: normalizza per ottenere proiezioni su 100%.
                </p>
              )}
            </div>

            {/* Portfolio composition (when multi-ETF) */}
            {portfolioMetrics && finalPortfolio.length > 1 && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Composizione del portafoglio</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-500">TER pesato</p>
                      <p className="font-bold text-gray-900">{portfolioMetrics.weightedTer.toFixed(2)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-500">Holdings effettivi</p>
                      <p className="font-bold text-gray-900">{portfolioMetrics.effectiveHoldings ?? 'n.d.'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-500">Overlap medio</p>
                      <p className="font-bold text-gray-900">
                        {portfolioMetrics.averageOverlap != null ? `${portfolioMetrics.averageOverlap}%` : 'n.d.'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-500">Correlazione media</p>
                      <p className="font-bold text-gray-900">{portfolioMetrics.averageCorrelation ?? 'n.d.'}</p>
                    </div>
                  </div>
                </div>

                {/* Correlation heatmap */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Matrice di correlazione</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Visualizza la diversificazione tra i singoli ETF. Valori vicini a 1 indicano ridondanza.
                    </p>
                  </div>
                  <CorrelationHeatmap portfolio={finalPortfolio} />
                </div>

                {/* Overlap Venn diagrams */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Sovrapposizione tra ETF</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Quanto i titoli sottostanti dei singoli ETF si sovrappongono. Più si toccano, più stai comprando le stesse aziende due volte.
                    </p>
                  </div>
                  <OverlapDiagrams portfolio={finalPortfolio} />
                </div>

                {/* Look-through holdings table */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Titoli sottostanti (look-through)</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Aggregazione delle posizioni dei singoli ETF, ponderate per il peso nel portafoglio.
                    </p>
                  </div>
                  <LookThroughTable portfolio={finalPortfolio} />
                </div>

                {/* Weight drift over time */}
                {result.yearlyPerEtf && (
                  <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">Drift dei pesi nel tempo</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {form.rebalancing === 'annual'
                            ? 'Ribilanciamento annuale attivo: i pesi tornano sempre al target.'
                            : 'Nessun ribilanciamento: gli ETF crescono indipendentemente, i pesi si spostano.'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${form.rebalancing === 'annual' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {form.rebalancing === 'annual' ? 'Annuale' : 'Drift'}
                      </span>
                    </div>
                    <WeightDriftChart yearlyPerEtf={result.yearlyPerEtf} portfolio={finalPortfolio} />
                    {/* Final-year drift summary — compare normalized target vs actual final share */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(() => {
                        const sumWeights = finalPortfolio.reduce((s, x) => s + x.weight, 0) || 1;
                        const totalFinal = finalPortfolio.reduce((s, x) => {
                          const arr = result.yearlyPerEtf?.[x.etf.isin] ?? [];
                          return s + (arr[arr.length - 1] ?? 0);
                        }, 0);
                        return finalPortfolio.map(p => {
                          const series = result.yearlyPerEtf?.[p.etf.isin] ?? [];
                          const finalVal = series[series.length - 1] ?? 0;
                          const finalPct = totalFinal > 0 ? (finalVal / totalFinal) * 100 : 0;
                          const targetPct = (p.weight / sumWeights) * 100;
                          const drift = finalPct - targetPct;
                          return (
                            <div key={p.etf.isin} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                              <span className="font-medium text-gray-700">{p.etf.ticker}</span>
                              <span className="text-gray-500">
                                {targetPct.toFixed(1)}% → <span className="font-semibold text-gray-900">{finalPct.toFixed(1)}%</span>
                                {' '}
                                <span className={drift > 1 ? 'text-red-600' : drift < -1 ? 'text-blue-600' : 'text-gray-400'}>
                                  ({drift >= 0 ? '+' : ''}{drift.toFixed(1)})
                                </span>
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Automated insights */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Cosa ci dice il portafoglio</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Lettura automatica delle metriche: cosa sta funzionando, cosa vale la pena rivedere.
                    </p>
                  </div>
                  <PortfolioAnalysis portfolio={finalPortfolio} metrics={portfolioMetrics} />
                </div>
              </>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard label="Valore lordo finale" value={formatEur(result.grossFinal)}
                sub={`+${formatEur(result.grossFinal - totalInvested)} su capitale investito`} accent="blue" />
              <SummaryCard label="Valore netto finale" value={formatEur(result.netFinal)}
                sub={`Fisco: −${formatEur(taxDrag)}`} accent="green" />
              <SummaryCard label={`Reale (inflaz. ${form.inflationRate.toFixed(1)}%)`}
                value={formatEur(result.realFinal)} sub={`Potere d'acquisto oggi`} accent="purple" />
            </div>

            {/* Tax breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Riepilogo fiscale</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Capitale investito</p>
                  <p className="font-semibold text-gray-900">{formatEur(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Guadagno netto</p>
                  <p className={`font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gain >= 0 ? '+' : ''}{formatEur(gain)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Carico fiscale totale</p>
                  <p className="font-semibold text-red-600">−{formatEur(taxDrag)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Efficienza netta</p>
                  <p className="font-semibold text-gray-900">
                    {result.grossFinal > 0 ? ((result.netFinal / result.grossFinal) * 100).toFixed(1) : 'n/d'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Andamento anno per anno</h3>
              <SimulatorChart data={chartData} />
            </div>

            {/* Monte Carlo */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Monte Carlo · 1.000 simulazioni</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Distribuzione dei possibili valori netti a scadenza basata su volatilità storica (log-normale).
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Scenario pessimistico (P10)</p>
                  <p className="text-lg font-bold text-gray-700">{formatEur(result.monteCarlo.finalP10)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">10% dei casi peggiore</p>
                </div>
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 mb-1">Scenario mediano (P50)</p>
                  <p className="text-lg font-bold text-purple-700">{formatEur(result.monteCarlo.finalP50)}</p>
                  <p className="text-xs text-purple-400 mt-0.5">Risultato più probabile</p>
                </div>
                <div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 mb-1">Scenario ottimistico (P90)</p>
                  <p className="text-lg font-bold text-orange-600">{formatEur(result.monteCarlo.finalP90)}</p>
                  <p className="text-xs text-orange-400 mt-0.5">10% dei casi migliore</p>
                </div>
              </div>
              <MonteCarloChart data={mcChartData} />
            </div>

            {/* Year-by-year table */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Valori chiave</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Anno</th>
                      <th className="pb-2 font-medium text-right">Investito</th>
                      <th className="pb-2 font-medium text-right text-blue-600">Lordo</th>
                      <th className="pb-2 font-medium text-right text-green-600">Netto</th>
                      <th className="pb-2 font-medium text-right">Δ fisco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData
                      .filter(row => row.year === 1 || row.year % 5 === 0 || row.year === input.years)
                      .map(row => (
                        <tr key={row.year} className="border-b border-gray-50 last:border-0">
                          <td className="py-1.5 text-gray-700 font-medium">Anno {row.year}</td>
                          <td className="py-1.5 text-right text-gray-500">{formatEur(row.investito)}</td>
                          <td className="py-1.5 text-right text-blue-600 font-medium">{formatEur(row.lordo)}</td>
                          <td className="py-1.5 text-right text-green-600 font-medium">{formatEur(row.netto)}</td>
                          <td className="py-1.5 text-right text-red-500 text-xs">−{formatEur(row.lordo - row.netto)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ReturnDisclaimer />
          </main>
        </div>
      </div>
    </div>
  );
}
