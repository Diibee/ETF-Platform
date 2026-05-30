import type { ETF } from '../../types/etf';
import { pairOverlap } from '../../utils/overlap';

interface OverlapVennProps {
  a: ETF;
  b: ETF;
  // Pixel size of the SVG (square).
  size?: number;
}

const ASSET_FILLS: Record<ETF['assetClass'], { fill: string; ring: string }> = {
  equity:      { fill: '#3b82f6', ring: 'border-blue-300' },
  bonds:       { fill: '#22c55e', ring: 'border-green-300' },
  commodities: { fill: '#eab308', ring: 'border-yellow-300' },
  real_estate: { fill: '#a855f7', ring: 'border-purple-300' },
};

export function OverlapVenn({ a, b, size = 240 }: OverlapVennProps) {
  const overlap = pairOverlap(a, b);
  const aFill = ASSET_FILLS[a.assetClass].fill;
  const bFill = ASSET_FILLS[b.assetClass].fill;

  // Circle geometry: two circles of equal radius. The center-to-center distance
  // shrinks as overlap grows (more overlap = closer centres).
  // When overlap is unknown (null), circles are kept fully separated to avoid
  // misleading the viewer.
  // Sizing: r ≤ W/4 so that two tangent circles (overlap=0 case) fit horizontally
  // with margin for stroke/labels. H tuned so labels above and below circles fit too.
  const W = size;
  const H = size * 0.78;
  const r = size * 0.22;
  const maxDist = 2 * r;
  const overlapFactor = overlap == null ? 0 : Math.min(1, overlap / 100);
  const dist = maxDist * (1 - overlapFactor * 0.85);
  const cx1 = W / 2 - dist / 2;
  const cx2 = W / 2 + dist / 2;
  const cy = H / 2;
  const unknown = overlap == null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-baseline gap-2 mb-2 text-sm">
        <span className="font-semibold" style={{ color: aFill }}>{a.ticker}</span>
        <span className="text-gray-400 dark:text-gray-500">↔</span>
        <span className="font-semibold" style={{ color: bFill }}>{b.ticker}</span>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="select-none">
        <defs>
          <filter id={`blend-${a.isin}-${b.isin}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0" />
          </filter>
        </defs>
        <g style={{ mixBlendMode: unknown ? 'normal' : 'multiply' }}>
          <circle
            cx={cx1} cy={cy} r={r}
            fill={unknown ? '#e5e7eb' : aFill}
            fillOpacity={unknown ? 0.5 : 0.55}
            stroke={unknown ? '#9ca3af' : 'none'}
            strokeDasharray={unknown ? '4 3' : 'none'}
            strokeWidth={unknown ? 1.5 : 0}
          />
          <circle
            cx={cx2} cy={cy} r={r}
            fill={unknown ? '#e5e7eb' : bFill}
            fillOpacity={unknown ? 0.5 : 0.55}
            stroke={unknown ? '#9ca3af' : 'none'}
            strokeDasharray={unknown ? '4 3' : 'none'}
            strokeWidth={unknown ? 1.5 : 0}
          />
        </g>

        {/* Centre overlap label */}
        {overlap != null && overlap > 0 && (
          <text
            x={W / 2}
            y={cy + 4}
            textAnchor="middle"
            className="font-bold"
            fill="white"
            style={{ fontSize: 14, paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 3, strokeLinejoin: 'round' }}
          >
            OVERLAP {overlap.toFixed(0)}%
          </text>
        )}

        {/* Side labels */}
        <text x={cx1 - r * 0.3} y={cy - r - 8} textAnchor="middle" className="font-medium" fill={aFill} style={{ fontSize: 11 }}>
          {a.ticker}
        </text>
        <text x={cx2 + r * 0.3} y={cy + r + 16} textAnchor="middle" className="font-medium" fill={bFill} style={{ fontSize: 11 }}>
          {b.ticker}
        </text>
      </svg>

      <p className="text-xs text-gray-500 mt-1 text-center dark:text-gray-400">
        {overlap == null ? (
          <span className="text-gray-400 dark:text-gray-500">Dati holdings non disponibili per uno dei due ETF.</span>
        ) : overlap === 0 ? (
          <span className="text-green-600 font-medium dark:text-green-400">Nessuna sovrapposizione. Diversificazione massima.</span>
        ) : overlap < 15 ? (
          <span className="text-green-600 dark:text-green-400">Sovrapposizione minima.</span>
        ) : overlap < 40 ? (
          <span className="text-yellow-600 dark:text-yellow-400">Sovrapposizione moderata.</span>
        ) : (
          <span className="text-red-600 font-medium dark:text-red-400">Sovrapposizione alta. Possibile ridondanza.</span>
        )}
      </p>
    </div>
  );
}

interface OverlapDiagramsProps {
  portfolio: { etf: ETF; weight: number }[];
}

export function OverlapDiagrams({ portfolio }: OverlapDiagramsProps) {
  if (portfolio.length < 2) return null;

  // Build all pairs that have at least one ETF with holdings data
  const pairs: { a: ETF; b: ETF; overlap: number | null }[] = [];
  for (let i = 0; i < portfolio.length; i++) {
    for (let j = i + 1; j < portfolio.length; j++) {
      const a = portfolio[i]!.etf;
      const b = portfolio[j]!.etf;
      const ov = pairOverlap(a, b);
      pairs.push({ a, b, overlap: ov });
    }
  }

  // Sort by overlap descending so the most "interesting" ones come first.
  const sorted = pairs.sort((p, q) => {
    if (p.overlap == null && q.overlap == null) return 0;
    if (p.overlap == null) return 1;
    if (q.overlap == null) return -1;
    return q.overlap - p.overlap;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map(({ a, b }) => (
        <OverlapVenn key={`${a.isin}-${b.isin}`} a={a} b={b} size={220} />
      ))}
    </div>
  );
}
