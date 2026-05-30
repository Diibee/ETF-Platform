import type { ETF, Holding, PortfolioEntry } from '../types/etf';

// Pair-wise overlap between two ETFs: sum of min(weightA, weightB) over shared holdings.
// Returns 0-100 (%). If either ETF lacks holdings data, returns null.
export function pairOverlap(a: ETF, b: ETF): number | null {
  if (!a.holdings?.length || !b.holdings?.length) return null;
  const mapB = new Map(b.holdings.map(h => [holdingKey(h), h.weight]));
  let overlap = 0;
  for (const ha of a.holdings) {
    const wb = mapB.get(holdingKey(ha));
    if (wb !== undefined) overlap += Math.min(ha.weight, wb);
  }
  return Math.round(overlap * 100) / 100;
}

function holdingKey(h: Holding): string {
  return h.isin ?? h.ticker;
}

// Look-through: aggregate holdings across all portfolio ETFs, weighted by ETF allocation.
// The returned `key` matches what `holdingKey()` would produce for the same holding,
// so callers can join back to per-ETF holdings consistently.
export function lookThroughHoldings(
  portfolio: PortfolioEntry[],
): Array<{ key: string; ticker: string; name: string; weight: number }> {
  const agg = new Map<string, { key: string; ticker: string; name: string; weight: number }>();
  for (const entry of portfolio) {
    if (!entry.etf.holdings?.length) continue;
    const portfolioWeight = entry.weight / 100; // 0..1
    for (const h of entry.etf.holdings) {
      const key = holdingKey(h);
      const contribution = portfolioWeight * h.weight; // % of total portfolio
      const existing = agg.get(key);
      if (existing) {
        existing.weight += contribution;
      } else {
        agg.set(key, { key, ticker: h.ticker, name: h.name, weight: contribution });
      }
    }
  }
  return Array.from(agg.values())
    .map(h => ({ ...h, weight: Math.round(h.weight * 100) / 100 }))
    .sort((x, y) => y.weight - x.weight);
}

// Weighted-average pair overlap across the portfolio (informational metric).
// Excludes pairs where overlap is null (insufficient data).
export function portfolioOverlap(portfolio: PortfolioEntry[]): number | null {
  if (portfolio.length < 2) return 0;
  let sumWeightedOverlap = 0;
  let sumPairWeight = 0;
  for (let i = 0; i < portfolio.length; i++) {
    for (let j = i + 1; j < portfolio.length; j++) {
      const a = portfolio[i]!;
      const b = portfolio[j]!;
      const o = pairOverlap(a.etf, b.etf);
      if (o == null) continue;
      const pairWeight = (a.weight + b.weight) / 200; // normalised pair weight (0..1)
      sumWeightedOverlap += o * pairWeight;
      sumPairWeight += pairWeight;
    }
  }
  if (sumPairWeight === 0) return null;
  return Math.round((sumWeightedOverlap / sumPairWeight) * 100) / 100;
}

// Effective number of holdings via inverse Herfindahl-Hirschman Index (1/HHI).
// Higher = more diversified. If no look-through data, returns null.
export function effectiveDiversification(portfolio: PortfolioEntry[]): number | null {
  const lt = lookThroughHoldings(portfolio);
  if (lt.length === 0) return null;
  const totalWeight = lt.reduce((s, h) => s + h.weight, 0);
  if (totalWeight === 0) return null;
  let hhi = 0;
  for (const h of lt) {
    const w = h.weight / totalWeight;
    hhi += w * w;
  }
  return Math.round(1 / hhi);
}
