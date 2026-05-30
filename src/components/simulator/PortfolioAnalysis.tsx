import type { PortfolioEntry } from '../../types/etf';
import type { PortfolioMetrics } from '../../utils/portfolio';
import { pairCorrelation } from '../../utils/correlation';
import { pairOverlap, lookThroughHoldings } from '../../utils/overlap';

type Tone = 'positive' | 'warning' | 'neutral' | 'info';

interface Insight {
  tone: Tone;
  icon: string;
  text: string;
}

const TONE_STYLES: Record<Tone, string> = {
  positive: 'bg-green-50 border-green-200 text-green-800',
  warning:  'bg-red-50 border-red-200 text-red-800',
  neutral:  'bg-gray-50 border-gray-200 text-gray-700',
  info:     'bg-blue-50 border-blue-200 text-blue-800',
};

function correlationInsights(portfolio: PortfolioEntry[], metrics: PortfolioMetrics): Insight[] {
  const insights: Insight[] = [];

  // Find highest/lowest pair
  let highest: { a: string; b: string; v: number } | null = null;
  let lowest: { a: string; b: string; v: number } | null = null;
  for (let i = 0; i < portfolio.length; i++) {
    for (let j = i + 1; j < portfolio.length; j++) {
      const a = portfolio[i]!.etf;
      const b = portfolio[j]!.etf;
      const v = pairCorrelation(a.assetClass, b.assetClass, pairOverlap(a, b));
      if (!highest || v > highest.v) highest = { a: a.ticker, b: b.ticker, v };
      if (!lowest  || v < lowest.v)  lowest  = { a: a.ticker, b: b.ticker, v };
    }
  }

  if (highest && highest.v > 0.85) {
    insights.push({
      tone: 'warning',
      icon: '⚠️',
      text: `${highest.a} e ${highest.b} hanno correlazione ${highest.v.toFixed(2)}: si muovono quasi insieme, riducono poco il rischio. Considera di sostituirne uno.`,
    });
  } else if (metrics.averageCorrelation != null && metrics.averageCorrelation < 0.4) {
    insights.push({
      tone: 'positive',
      icon: '✅',
      text: `Correlazione media ${metrics.averageCorrelation.toFixed(2)}: gli ETF si compensano bene fra loro, il portafoglio è effettivamente diversificato.`,
    });
  } else if (metrics.averageCorrelation != null && metrics.averageCorrelation > 0.7) {
    insights.push({
      tone: 'warning',
      icon: '🔁',
      text: `Correlazione media alta (${metrics.averageCorrelation.toFixed(2)}): gli ETF tendono a muoversi insieme. La diversificazione apparente è limitata.`,
    });
  }

  if (lowest && lowest.v < 0.3) {
    insights.push({
      tone: 'info',
      icon: '🛡️',
      text: `${lowest.a} ↔ ${lowest.b}: correlazione ${lowest.v.toFixed(2)}, è la coppia più diversificante del portafoglio.`,
    });
  }

  return insights;
}

function lookThroughInsights(portfolio: PortfolioEntry[], metrics: PortfolioMetrics): Insight[] {
  const insights: Insight[] = [];
  const holdings = lookThroughHoldings(portfolio);
  if (holdings.length === 0) {
    insights.push({
      tone: 'neutral',
      icon: 'ℹ️',
      text: 'Look-through non disponibile: gli ETF del portafoglio non hanno dati di holdings (bonds e commodities tipicamente).',
    });
    return insights;
  }

  const coverage = holdings.reduce((s, h) => s + h.weight, 0);
  const top5 = holdings.slice(0, 5).reduce((s, h) => s + h.weight, 0);
  const top5OfCovered = coverage > 0 ? (top5 / coverage) * 100 : 0;
  const goodCoverage = coverage >= 50;

  // The coverage caveat goes first so all following look-through insights are read in context.
  if (coverage > 0 && coverage < 80) {
    insights.push({
      tone: 'info',
      icon: '🔍',
      text: `Look-through copre il ${coverage.toFixed(1)}% del portafoglio. Le metriche sui titoli sottostanti valgono solo per questa parte (l'altro ${(100 - coverage).toFixed(0)}% è in ETF senza dati: tipicamente bonds e commodities).`,
    });
  }

  // Top-N concentration framed within the covered portion so it stays consistent
  // with effective holdings (also computed on the covered portion).
  if (coverage > 0) {
    if (top5OfCovered > 50) {
      insights.push({
        tone: 'warning',
        icon: '🎯',
        text: `I primi 5 titoli rappresentano il ${top5OfCovered.toFixed(0)}% della parte coperta dal look-through (${top5.toFixed(1)}% del portafoglio totale): forte concentrazione su poche aziende.`,
      });
    } else if (top5OfCovered < 25 && goodCoverage) {
      insights.push({
        tone: 'positive',
        icon: '🌐',
        text: `I primi 5 titoli pesano solo il ${top5OfCovered.toFixed(0)}% della parte coperta: esposizione ben distribuita.`,
      });
    }
  }

  if (metrics.effectiveHoldings != null) {
    const coverageNote = goodCoverage ? '' : ' (sulla parte coperta dal look-through)';
    if (metrics.effectiveHoldings > 100) {
      insights.push({
        tone: 'positive',
        icon: '✅',
        text: `${metrics.effectiveHoldings} holdings effettivi (1/HHI)${coverageNote}: diversificazione reale ampia.`,
      });
    } else if (metrics.effectiveHoldings < 20) {
      insights.push({
        tone: 'warning',
        icon: '⚠️',
        text: `Solo ${metrics.effectiveHoldings} holdings effettivi${coverageNote}: il rischio è concentrato su poche posizioni.`,
      });
    }
  }

  const top1 = holdings[0];
  if (top1 && top1.weight >= 3) {
    insights.push({
      tone: 'info',
      icon: '🏢',
      text: `Il singolo titolo con maggiore esposizione è ${top1.name} (${top1.weight.toFixed(2)}% del portafoglio totale).`,
    });
  }

  return insights;
}

function compositionInsights(portfolio: PortfolioEntry[], metrics: PortfolioMetrics): Insight[] {
  const insights: Insight[] = [];

  if (metrics.weightedTer < 0.15) {
    insights.push({
      tone: 'positive',
      icon: '💰',
      text: `TER pesato ${metrics.weightedTer.toFixed(2)}%: portafoglio molto efficiente sui costi (sotto 0.15%).`,
    });
  } else if (metrics.weightedTer > 0.5) {
    insights.push({
      tone: 'warning',
      icon: '💸',
      text: `TER pesato ${metrics.weightedTer.toFixed(2)}%: costo annuo elevato. Su 20 anni può ridurre il risultato finale di diversi percenti.`,
    });
  }

  // Asset class balance
  const byClass: Record<string, number> = { equity: 0, bonds: 0, commodities: 0, real_estate: 0 };
  let total = 0;
  for (const e of portfolio) {
    byClass[e.etf.assetClass] = (byClass[e.etf.assetClass] ?? 0) + e.weight;
    total += e.weight;
  }
  if (total === 0) return insights;
  const eqPct = (byClass.equity ?? 0) / total * 100;
  const bdPct = (byClass.bonds ?? 0) / total * 100;

  if (eqPct >= 85) {
    insights.push({
      tone: 'info',
      icon: '📈',
      text: `Esposizione azionaria ${eqPct.toFixed(0)}%: profilo aggressivo, alta sensibilità ai cicli di mercato.`,
    });
  } else if (bdPct >= 60) {
    insights.push({
      tone: 'info',
      icon: '🛡️',
      text: `Esposizione obbligazionaria ${bdPct.toFixed(0)}%: profilo difensivo, oscillazioni contenute ma rendimento atteso più basso.`,
    });
  }

  return insights;
}

export function PortfolioAnalysis({
  portfolio,
  metrics,
}: {
  portfolio: PortfolioEntry[];
  metrics: PortfolioMetrics;
}) {
  const insights = [
    ...compositionInsights(portfolio, metrics),
    ...correlationInsights(portfolio, metrics),
    ...lookThroughInsights(portfolio, metrics),
  ];

  if (insights.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        Aggiungi più ETF al portafoglio per ricevere un'analisi automatica.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 border rounded-lg px-3 py-2 text-xs ${TONE_STYLES[ins.tone]}`}
        >
          <span className="text-sm leading-none mt-0.5">{ins.icon}</span>
          <span className="leading-snug">{ins.text}</span>
        </div>
      ))}
    </div>
  );
}
