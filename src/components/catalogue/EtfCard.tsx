import { Link } from 'react-router-dom';
import type { ETF } from '../../types/etf';
import { Badge } from '../common/Badge';
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

export function EtfCard({ etf }: EtfCardProps) {
  const riskColor = riskClassColor(etf.riskClass);
  const acColor = assetClassColor(etf.assetClass);

  return (
    <Link
      to={`/catalogue/${etf.isin}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-700 truncate">
            {etf.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{etf.isin} · {etf.ticker}</p>
        </div>
        <Badge variant={riskColor} size="xs">SRI {etf.riskClass}</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant={acColor}>{assetClassLabel(etf.assetClass)}</Badge>
        <Badge variant="gray">
          {etf.dividendPolicy === 'acc' ? '♻️ ' : '💰 '}
          {dividendPolicyLabel(etf.dividendPolicy)}
        </Badge>
        {etf.domicile === 'IE' && (
          <Badge variant="green">🇮🇪 tax-efficient</Badge>
        )}
        {etf.hedged && (
          <Badge variant="gray">EUR hedged</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-1.5 px-2">
          <p className="text-xs text-gray-500">TER</p>
          <p className="font-semibold text-gray-900 text-sm">{formatPercent(etf.ter)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-1.5 px-2">
          <p className="text-xs text-gray-500">AUM</p>
          <p className="font-semibold text-gray-900 text-sm">{formatAum(etf.aum)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-1.5 px-2">
          <p className="text-xs text-gray-500">CAGR 5a</p>
          <p className={`font-semibold text-sm ${etf.cagr5y != null && etf.cagr5y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(etf.cagr5y)}
          </p>
        </div>
      </div>

      {etf.volatility != null && (
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Volatilità: <span className="text-gray-700 font-medium">{formatPercent(etf.volatility)}</span></span>
          <span>Max DD: <span className="text-gray-700 font-medium">{formatPercent(etf.maxDrawdown)}</span></span>
        </div>
      )}
    </Link>
  );
}
