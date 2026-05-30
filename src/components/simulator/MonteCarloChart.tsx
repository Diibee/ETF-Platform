import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface McRow {
  year: number;
  p10: number;
  mcBand: number; // p90 - p10, stacked on top of p10
  p50: number;
}

function formatEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`;
  return `€${value.toFixed(0)}`;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  dataKey: string;
  payload: McRow;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const p90 = row.p10 + row.mcBand;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
      <p className="font-semibold text-gray-700 mb-2 dark:text-gray-300">Anno {label}</p>
      <p className="text-orange-500 font-medium">Ottimistico (P90): {formatEur(p90)}</p>
      <p className="text-purple-600 font-medium">Mediano (P50): {formatEur(row.p50)}</p>
      <p className="text-gray-500 font-medium dark:text-gray-400">Pessimistico (P10): {formatEur(row.p10)}</p>
    </div>
  );
}

export function MonteCarloChart({ data }: { data: McRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="mcBandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={v => `${v}a`}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={formatEur}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Invisible baseline up to p10 */}
        <Area
          type="monotone"
          dataKey="p10"
          stackId="mc"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="3 2"
          fill="transparent"
          name="Pessimistico (P10)"
        />

        {/* Colored band from p10 to p90 */}
        <Area
          type="monotone"
          dataKey="mcBand"
          stackId="mc"
          stroke="#f97316"
          strokeWidth={1.5}
          strokeDasharray="3 2"
          fill="url(#mcBandGrad)"
          name="Ottimistico (P90)"
        />

        {/* Median line */}
        <Area
          type="monotone"
          dataKey="p50"
          stroke="#a855f7"
          strokeWidth={2}
          fill="transparent"
          dot={false}
          name="Mediano (P50)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
