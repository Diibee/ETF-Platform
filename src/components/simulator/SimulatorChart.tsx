import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartRow {
  year: number;
  lordo: number;
  netto: number;
  investito: number;
}

interface SimulatorChartProps {
  data: ChartRow[];
}

function formatEur(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`;
  return `€${value.toFixed(0)}`;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">Anno {label}</p>
      {payload.map(item => (
        <p key={item.name} style={{ color: item.color }} className="font-medium">
          {item.name}: {formatEur(item.value)}
        </p>
      ))}
    </div>
  );
}

export function SimulatorChart({ data }: SimulatorChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="colorLordo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="colorNetto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="colorInvestito" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
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
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="investito"
          name="Capitale investito"
          stroke="#94a3b8"
          strokeWidth={1.5}
          fill="url(#colorInvestito)"
          strokeDasharray="4 2"
        />
        <Area
          type="monotone"
          dataKey="netto"
          name="Netto (post-tax)"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#colorNetto)"
        />
        <Area
          type="monotone"
          dataKey="lordo"
          name="Lordo"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorLordo)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export type { ChartRow };
