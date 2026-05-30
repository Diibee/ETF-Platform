import type { UserProfile, ETF, PortfolioEntry } from '../../types/etf';
import type { RecommendationOutput, PortfolioSet } from '../../utils/recommendation';
import { Badge } from '../common/Badge';
import { FriendsDisclaimer } from '../common/FriendsDisclaimer';
import { Link, useNavigate } from 'react-router-dom';

interface RecommendationResultProps {
  profile: UserProfile;
  recommendation: RecommendationOutput;
  onReset: () => void;
}

const ASSET_LABELS: Record<string, string> = {
  equity: 'Azionario', bonds: 'Obbligazionario', commodities: 'Materie Prime', real_estate: 'Immobiliare',
};
const ASSET_COLORS: Record<string, string> = {
  equity: 'bg-blue-500', bonds: 'bg-green-500', commodities: 'bg-yellow-500', real_estate: 'bg-purple-500',
};
const ASSET_LABEL_COLORS: Record<string, string> = {
  equity: 'text-blue-600', bonds: 'text-green-600', commodities: 'text-yellow-600', real_estate: 'text-purple-600',
};
const RISK_LABELS: Record<number, string> = { 1: 'Molto bassa', 2: 'Bassa', 3: 'Moderata', 4: 'Alta', 5: 'Molto alta' };

const SET_ACCENT: Record<PortfolioSet['id'], { ring: string; chip: string; chipText: string }> = {
  simple:      { ring: 'border-gray-200',   chip: 'bg-gray-100',    chipText: 'text-gray-700' },
  balanced:    { ring: 'border-blue-300',   chip: 'bg-blue-100',    chipText: 'text-blue-700' },
  diversified: { ring: 'border-purple-300', chip: 'bg-purple-100',  chipText: 'text-purple-700' },
};

function formatMetric(v: number | null, suffix = ''): string {
  if (v == null) return 'n.d.';
  return `${v}${suffix}`;
}

function PortfolioSetCard({ set, onSimulate }: { set: PortfolioSet; onSimulate: () => void }) {
  const accent = SET_ACCENT[set.id];
  const allocByClass: Record<string, number> = { equity: 0, bonds: 0, commodities: 0, real_estate: 0 };
  for (const e of set.portfolio) allocByClass[e.etf.assetClass] = (allocByClass[e.etf.assetClass] ?? 0) + e.weight;

  return (
    <div className={`bg-white border-2 ${accent.ring} rounded-2xl p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent.chip} ${accent.chipText}`}>
              {set.label}
            </span>
            <span className="text-xs text-gray-400">{set.portfolio.length} ETF</span>
          </div>
          <p className="text-xs text-gray-500">{set.description}</p>
        </div>
      </div>

      {/* Allocation bar */}
      <div>
        <div className="flex h-3 rounded-full overflow-hidden gap-px mb-2">
          {(['equity', 'bonds', 'commodities', 'real_estate'] as const).map(k =>
            (allocByClass[k] ?? 0) > 0 ? (
              <div key={k} className={ASSET_COLORS[k]} style={{ width: `${allocByClass[k]}%` }} />
            ) : null,
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {(['equity', 'bonds', 'commodities', 'real_estate'] as const).map(k =>
            (allocByClass[k] ?? 0) > 0 ? (
              <span key={k} className={`font-medium ${ASSET_LABEL_COLORS[k]}`}>
                {Math.round(allocByClass[k] ?? 0)}% {ASSET_LABELS[k]}
              </span>
            ) : null,
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500">TER pesato</p>
          <p className="font-bold text-gray-900">{set.metrics.weightedTer.toFixed(2)}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Holdings effettivi</p>
          <p className="font-bold text-gray-900">{formatMetric(set.metrics.effectiveHoldings)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Overlap medio</p>
          <p className="font-bold text-gray-900">{formatMetric(set.metrics.averageOverlap, '%')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-500">Correlazione media</p>
          <p className="font-bold text-gray-900">{formatMetric(set.metrics.averageCorrelation)}</p>
        </div>
      </div>

      {/* ETF list */}
      <div className="space-y-1.5">
        {set.portfolio.map(entry => (
          <div key={entry.etf.isin} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1 h-4 rounded-full flex-shrink-0 ${ASSET_COLORS[entry.etf.assetClass]}`} />
              <span className="text-gray-700 truncate">{entry.etf.name}</span>
            </div>
            <Badge variant="gray" size="xs">{entry.weight}%</Badge>
          </div>
        ))}
      </div>

      {/* Top holdings preview */}
      {set.metrics.topHoldings.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700 select-none">
            Top holdings look-through ({set.metrics.topHoldings.length})
          </summary>
          <div className="mt-2 space-y-1">
            {set.metrics.topHoldings.map(h => (
              <div key={h.ticker} className="flex justify-between text-gray-600">
                <span className="truncate pr-2">{h.name}</span>
                <span className="font-medium text-gray-900 flex-shrink-0">{h.weight.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onSimulate}
        className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
      >
        Prova simulazione →
      </button>
    </div>
  );
}

export function RecommendationResult({ profile, recommendation, onReset }: RecommendationResultProps) {
  const navigate = useNavigate();

  function handleSimulate(portfolio: PortfolioEntry[]) {
    navigate('/simulator', {
      state: {
        portfolio,
        initialDeposit: profile.initialCapital,
        periodicContribution: profile.monthlyContribution,
        contributionFrequency: 'monthly' as const,
        years: profile.horizon,
      },
    });
  }

  const totalAlloc = recommendation.allocation;
  const overallSlices = [
    { key: 'equity', value: totalAlloc.equity },
    { key: 'bonds', value: totalAlloc.bonds },
    { key: 'commodities', value: totalAlloc.commodities },
    { key: 'real_estate', value: totalAlloc.realEstate },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">La tua allocazione consigliata</h2>
        <p className="text-sm text-gray-500 mt-1">
          Profilo: {profile.horizon} anni · Rischio {RISK_LABELS[profile.riskTolerance]} · Età {profile.age}
        </p>
      </div>

      {/* Overall allocation */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Allocazione target per asset class</h3>
        <div className="flex h-5 rounded-full overflow-hidden gap-px">
          {overallSlices.map(s => (
            <div key={s.key} className={ASSET_COLORS[s.key]} style={{ width: `${s.value}%` }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {overallSlices.map(s => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${ASSET_COLORS[s.key]}`} />
              <span className={`text-sm font-semibold ${ASSET_LABEL_COLORS[s.key]}`}>{s.value}%</span>
              <span className="text-xs text-gray-500">{ASSET_LABELS[s.key]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">{recommendation.rationale}</p>
      </div>

      {/* Three sets */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">3 portafogli costruiti per te</h3>
        <p className="text-sm text-gray-500 mb-4">
          Confronta TER, overlap, correlazione e diversificazione effettiva. Clicca "Prova simulazione" per testarli nel tempo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendation.sets.map(set => (
            <PortfolioSetCard
              key={set.id}
              set={set}
              onSimulate={() => handleSimulate(set.portfolio)}
            />
          ))}
        </div>
      </div>

      {/* Single ETFs */}
      {recommendation.singleEtfs.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ETF singoli consigliati</h3>
          <p className="text-sm text-gray-500 mb-4">
            Alternative individuali coerenti con il tuo profilo, da combinare a mano nel simulatore.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendation.singleEtfs.map((etf: ETF) => (
              <div key={etf.isin} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-1 self-stretch rounded-full flex-shrink-0 ${ASSET_COLORS[etf.assetClass]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{etf.name}</p>
                    <p className="text-xs text-gray-400">{etf.ticker} · TER {etf.ter}% · {ASSET_LABELS[etf.assetClass]}</p>
                  </div>
                </div>
                <Link to={`/catalogue/${etf.isin}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap flex-shrink-0">
                  Dettagli →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          ← Rifai il questionario
        </button>
      </div>

      <FriendsDisclaimer />
    </div>
  );
}
