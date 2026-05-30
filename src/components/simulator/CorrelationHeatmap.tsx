import type { PortfolioEntry } from '../../types/etf';
import { pairCorrelation } from '../../utils/correlation';
import { pairOverlap } from '../../utils/overlap';

interface CorrelationHeatmapProps {
  portfolio: PortfolioEntry[];
}

// Maps a correlation value (-1..+1) to a Tailwind background colour class.
// Negative = green (diversifying), neutral = light, high positive = red (redundant).
function corrColor(c: number): { bg: string; text: string } {
  if (c <= -0.3) return { bg: 'bg-green-500',  text: 'text-white' };
  if (c <= 0.0)  return { bg: 'bg-green-200',  text: 'text-green-900' };
  if (c <= 0.3)  return { bg: 'bg-gray-100',   text: 'text-gray-700' };
  if (c <= 0.6)  return { bg: 'bg-yellow-200', text: 'text-yellow-900' };
  if (c <= 0.85) return { bg: 'bg-orange-300', text: 'text-orange-900' };
  return            { bg: 'bg-red-400',     text: 'text-white' };
}

export function CorrelationHeatmap({ portfolio }: CorrelationHeatmapProps) {
  if (portfolio.length < 2) return null;

  // NxN matrix of correlation values
  const matrix = portfolio.map((a, i) =>
    portfolio.map((b, j) => {
      if (i === j) return 1;
      return pairCorrelation(a.etf.assetClass, b.etf.assetClass, pairOverlap(a.etf, b.etf));
    }),
  );

  const highest = matrix
    .flatMap((row, i) => row.map((v, j) => ({ i, j, v })))
    .filter(c => c.i < c.j)
    .sort((a, b) => b.v - a.v)[0];
  const redundancy =
    highest && highest.v > 0.85
      ? `${portfolio[highest.i]!.etf.ticker} ↔ ${portfolio[highest.j]!.etf.ticker} hanno correlazione ${highest.v.toFixed(2)}: potenzialmente ridondanti.`
      : null;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="text-xs border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="p-1"></th>
              {portfolio.map(p => (
                <th key={p.etf.isin} className="px-2 py-1 text-gray-500 font-medium text-center min-w-[64px] dark:text-gray-400">
                  {p.etf.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portfolio.map((rowEtf, i) => (
              <tr key={rowEtf.etf.isin}>
                <th className="pr-2 text-right text-gray-500 font-medium whitespace-nowrap dark:text-gray-400">
                  {rowEtf.etf.ticker}
                </th>
                {portfolio.map((_, j) => {
                  const v = matrix[i]![j]!;
                  const { bg, text } = corrColor(v);
                  const diag = i === j;
                  return (
                    <td
                      key={j}
                      title={`${portfolio[i]!.etf.name} ↔ ${portfolio[j]!.etf.name}: ${v.toFixed(2)}`}
                      className={`w-16 h-10 text-center font-semibold rounded ${diag ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500' : `${bg} ${text}`}`}
                    >
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap dark:text-gray-400">
        <span>Scala:</span>
        <span className="px-2 py-0.5 rounded bg-green-500 text-white font-medium">&lt; -0.3 diversificante</span>
        <span className="px-2 py-0.5 rounded bg-green-200 text-green-900 font-medium">-0.3 ÷ 0</span>
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">0 ÷ 0.3</span>
        <span className="px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 font-medium">0.3 ÷ 0.6</span>
        <span className="px-2 py-0.5 rounded bg-orange-300 text-orange-900 font-medium">0.6 ÷ 0.85</span>
        <span className="px-2 py-0.5 rounded bg-red-400 text-white font-medium">&gt; 0.85 ridondante</span>
      </div>

      {redundancy && (
        <p className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
          ⚠️ {redundancy}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Correlazione stimata euristicamente da asset class e sovrapposizione dei titoli sottostanti.
        Non si basa su serie storiche dei rendimenti.
      </p>
    </div>
  );
}
