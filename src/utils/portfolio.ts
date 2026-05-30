import type { PortfolioEntry } from '../types/etf';
import { portfolioOverlap, effectiveDiversification, lookThroughHoldings } from './overlap';
import { portfolioCorrelation } from './correlation';

export interface PortfolioMetrics {
  weightedTer: number;            // %
  averageOverlap: number | null;  // % (null = insufficient data)
  effectiveHoldings: number | null;
  averageCorrelation: number | null;
  topHoldings: Array<{ ticker: string; name: string; weight: number }>;
  totalWeight: number;
}

export function computePortfolioMetrics(portfolio: PortfolioEntry[]): PortfolioMetrics {
  const totalWeight = portfolio.reduce((s, e) => s + e.weight, 0);
  const weightedTer = totalWeight > 0
    ? Math.round(
        (portfolio.reduce((s, e) => s + (e.weight / totalWeight) * e.etf.ter, 0)) * 1000,
      ) / 1000
    : 0;

  const topHoldings = lookThroughHoldings(portfolio).slice(0, 8);

  return {
    weightedTer,
    averageOverlap: portfolioOverlap(portfolio),
    effectiveHoldings: effectiveDiversification(portfolio),
    averageCorrelation: portfolioCorrelation(portfolio),
    topHoldings,
    totalWeight,
  };
}
