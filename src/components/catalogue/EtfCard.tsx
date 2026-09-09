import Link from 'next/link';
import type { ETF } from '../../types/etf';
import { Badge } from '../common/Badge';
import { Spotlight } from '@/components/motion';
import {
  formatPercent,
  formatAum,
  assetClassLabel,
  dividendPolicyLabel,
  riskClassColor,
  assetClassColor,
} from '../../utils/formatters';

interface EtfCardProps {
  etf: ETF;
}

/**
 * Catalogue tile.
 *
 * The `Spotlight` wrapper — not the `<Link>` — carries the lift, so the glow
 * and the card rise as one object; putting the transform on the inner anchor
 * would leave the highlight behind. Every colour resolves through a semantic
 * token: the raw palette classes this used to carry (`text-gray-500`,
 * `dark:border-gray-700`) were the reason dark mode kept drifting under the
 * contrast floor.
 */
export function EtfCard({ etf }: EtfCardProps) {
  const riskColor = riskClassColor(etf.riskClass);
  const acColor = assetClassColor(etf.assetClass);
  const cagrPositive = etf.cagr5y != null && etf.cagr5y >= 0;

  return (
    <Spotlight className="lift-sm group h-full rounded-xl">
      <Link
        href={`/catalogue/${etf.isin}`}
        className="block h-full rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-quart)] group-hover:border-brand/50 group-hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm leading-snug font-semibold text-fg transition-colors duration-200 group-hover:text-brand">
              {etf.name}
            </p>
            <p className="mt-0.5 font-mono text-xs text-fg-subtle">
              {etf.isin} · {etf.ticker}
            </p>
          </div>
          <Badge variant={riskColor} size="xs">SRI {etf.riskClass}</Badge>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant={acColor}>{assetClassLabel(etf.assetClass)}</Badge>
          <Badge variant="gray">
            {etf.dividendPolicy === 'acc' ? '♻️ ' : '💰 '}
            {dividendPolicyLabel(etf.dividendPolicy)}
          </Badge>
          {etf.domicile === 'IE' && <Badge variant="green">🇮🇪 tax-efficient</Badge>}
          {etf.hedged && <Badge variant="gray">EUR hedged</Badge>}
        </div>

        {/* The three figures lift a touch on hover as a set, which reads as the
            card responding rather than as three separate hover targets. */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'TER', value: formatPercent(etf.ter), tone: 'text-fg' },
            { label: 'AUM', value: formatAum(etf.aum), tone: 'text-fg' },
            {
              label: 'CAGR 5a',
              value: formatPercent(etf.cagr5y),
              tone: cagrPositive ? 'text-positive' : 'text-negative',
            },
          ].map(cell => (
            <div
              key={cell.label}
              className="rounded-lg bg-surface-2 px-2 py-1.5 transition-colors duration-200 group-hover:bg-surface-3"
            >
              <p className="text-xs text-fg-subtle">{cell.label}</p>
              <p className={`tnum text-sm font-semibold ${cell.tone}`}>{cell.value}</p>
            </div>
          ))}
        </div>

        {etf.volatility != null && (
          <div className="mt-2 flex justify-between text-xs text-fg-subtle">
            <span>
              Volatilità:{' '}
              <span className="tnum font-medium text-fg-muted">{formatPercent(etf.volatility)}</span>
            </span>
            <span>
              Max DD:{' '}
              <span className="tnum font-medium text-fg-muted">{formatPercent(etf.maxDrawdown)}</span>
            </span>
          </div>
        )}
      </Link>
    </Spotlight>
  );
}
