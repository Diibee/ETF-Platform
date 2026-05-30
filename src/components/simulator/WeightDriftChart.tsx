import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ETF } from '../../types/etf';

interface WeightDriftChartProps {
  // Map from ETF ISIN -> year-end values
  yearlyPerEtf: Record<string, number[]>;
  // ETF metadata for labelling / colours
  portfolio: Array<{ etf: ETF; weight: number }>;
}

const ASSET_FILLS: Record<ETF['assetClass'], string> = {
  equity: '#3b82f6',
  bonds: '#22c55e',
  commodities: '#eab308',
  real_estate: '#a855f7',
};

// Generate a distinct colour per ETF using its asset class + an index-based shade
function colourFor(etf: ETF, index: number): string {
  const base = ASSET_FILLS[etf.assetClass];
  // Slight desaturation/lightening for second+ ETF of same asset class
  if (index === 0) return base;
  const lighten = Math.min(0.35, 0.12 * index);
  return mixWithWhite(base, lighten);
}

function mixWithWhite(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (ch: number) => Math.round(ch + (255 - ch) * amount);
  return `#${[mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

interface ChartRow {
  year: number;
  [isin: string]: number;
}

interface TooltipItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}
interface TooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4 py-3 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
      <p className="font-semibold text-gray-700 mb-2 dark:text-gray-300">Anno {label}</p>
      {payload.slice().reverse().map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium flex justify-between gap-3">
          <span>{p.name}</span>
          <span>{total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0'}%</span>
        </p>
      ))}
    </div>
  );
}

export function WeightDriftChart({ yearlyPerEtf, portfolio }: WeightDriftChartProps) {
  const isins = portfolio.map(p => p.etf.isin);
  const lengths = isins.map(isin => yearlyPerEtf[isin]?.length ?? 0);
  const years = Math.min(...lengths);
  if (years === 0) return null;

  // Build chart rows: each row is a year, with one key per ETF holding the absolute value
  const rows: ChartRow[] = [];
  for (let y = 0; y < years; y++) {
    const row: ChartRow = { year: y + 1 };
    for (const isin of isins) {
      row[isin] = yearlyPerEtf[isin]?.[y] ?? 0;
    }
    rows.push(row);
  }

  // Convert to weight percentages (stack to 100)
  const pctRows = rows.map(r => {
    const total = isins.reduce((s, isin) => s + (r[isin] ?? 0), 0);
    const out: ChartRow = { year: r.year };
    for (const isin of isins) {
      out[isin] = total > 0 ? Math.round(((r[isin] ?? 0) / total) * 1000) / 10 : 0;
    }
    return out;
  });

  // Same-class indexing for colour variation
  const colourByIsin: Record<string, string> = {};
  const seenByClass: Record<string, number> = {};
  for (const p of portfolio) {
    const idx = seenByClass[p.etf.assetClass] ?? 0;
    colourByIsin[p.etf.isin] = colourFor(p.etf, idx);
    seenByClass[p.etf.assetClass] = idx + 1;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={pctRows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} stackOffset="expand">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}a`} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${Math.round(v * 100)}%`} width={48} />
        <Tooltip content={<CustomTooltip />} />
        {portfolio.map(p => (
          <Area
            key={p.etf.isin}
            type="monotone"
            dataKey={p.etf.isin}
            name={p.etf.ticker}
            stackId="1"
            stroke={colourByIsin[p.etf.isin]}
            fill={colourByIsin[p.etf.isin]}
            fillOpacity={0.85}
            strokeWidth={1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
