import type { AssetClass, PortfolioEntry } from '../types/etf';
import { pairOverlap } from './overlap';

// Heuristic correlation matrix between asset classes (long-run historical baselines).
// These are approximations, not derived from current data — labelled accordingly in UI.
const ASSET_CORR: Record<AssetClass, Record<AssetClass, number>> = {
  equity:      { equity: 1.00, bonds: 0.10, commodities: 0.35, real_estate: 0.65 },
  bonds:       { equity: 0.10, bonds: 1.00, commodities: 0.05, real_estate: 0.30 },
  commodities: { equity: 0.35, bonds: 0.05, commodities: 1.00, real_estate: 0.30 },
  real_estate: { equity: 0.65, bonds: 0.30, commodities: 0.30, real_estate: 1.00 },
};

export function pairCorrelation(
  aAsset: AssetClass,
  bAsset: AssetClass,
  holdingsOverlap: number | null,
): number {
  const base = ASSET_CORR[aAsset][bAsset];
  if (aAsset !== bAsset) return base;
  // Same asset class: lift correlation toward 1 in proportion to holdings overlap
  if (holdingsOverlap == null) return Math.max(base, 0.85);
  return Math.min(1, base * (0.75 + 0.25 * (holdingsOverlap / 100)));
}

// Weighted-average pairwise correlation across the portfolio.
export function portfolioCorrelation(portfolio: PortfolioEntry[]): number | null {
  if (portfolio.length < 2) return 1;
  let sumWeightedCorr = 0;
  let sumPairWeight = 0;
  for (let i = 0; i < portfolio.length; i++) {
    for (let j = i + 1; j < portfolio.length; j++) {
      const a = portfolio[i]!;
      const b = portfolio[j]!;
      const ov = pairOverlap(a.etf, b.etf);
      const c = pairCorrelation(a.etf.assetClass, b.etf.assetClass, ov);
      const pairWeight = (a.weight + b.weight) / 200;
      sumWeightedCorr += c * pairWeight;
      sumPairWeight += pairWeight;
    }
  }
  if (sumPairWeight === 0) return null;
  return Math.round((sumWeightedCorr / sumPairWeight) * 100) / 100;
}
