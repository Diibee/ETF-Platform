import { useState } from 'react';
import type { PortfolioEntry } from '../../types/etf';
import { lookThroughHoldings } from '../../utils/overlap';

interface LookThroughTableProps {
  portfolio: PortfolioEntry[];
}

const INITIAL_LIMIT = 10;

export function LookThroughTable({ portfolio }: LookThroughTableProps) {
  const [expanded, setExpanded] = useState(false);
  const holdings = lookThroughHoldings(portfolio);

  if (holdings.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        Nessun dato di holdings disponibile per gli ETF del portafoglio.
      </p>
    );
  }

  const totalCovered = holdings.reduce((s, h) => s + h.weight, 0);
  const visible = expanded ? holdings : holdings.slice(0, INITIAL_LIMIT);

  // Find which ETFs contribute to each holding (for source column).
  // Key resolution must mirror `holdingKey()` in overlap.ts (isin first, then ticker).
  const sourceByKey = new Map<string, string[]>();
  for (const entry of portfolio) {
    if (!entry.etf.holdings) continue;
    for (const h of entry.etf.holdings) {
      const key = h.isin ?? h.ticker;
      const list = sourceByKey.get(key) ?? [];
      list.push(entry.etf.ticker);
      sourceByKey.set(key, list);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        {holdings.length} titoli sottostanti distinti · {totalCovered.toFixed(1)}% del portafoglio coperto
        {totalCovered < 99 && (
          <span className="text-gray-400">
            {' '}(la quota restante è in ETF senza dati di holdings, es. bonds, commodities)
          </span>
        )}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium w-10">#</th>
              <th className="pb-2 font-medium">Titolo</th>
              <th className="pb-2 font-medium">Ticker</th>
              <th className="pb-2 font-medium">Da ETF</th>
              <th className="pb-2 font-medium text-right">Peso</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h, i) => {
              const sources = sourceByKey.get(h.key) ?? [];
              return (
                <tr key={h.key} className="border-b border-gray-50 last:border-0">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 text-gray-800">{h.name}</td>
                  <td className="py-1.5 text-gray-500 font-mono">{h.ticker}</td>
                  <td className="py-1.5 text-gray-500">{sources.join(', ')}</td>
                  <td className="py-1.5 text-right font-semibold text-gray-900">{h.weight.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {holdings.length > INITIAL_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {expanded ? '← Mostra solo top 10' : `Mostra tutti i ${holdings.length} titoli →`}
        </button>
      )}
    </div>
  );
}
