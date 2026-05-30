import type { ETF, UserProfile, PortfolioEntry, AssetClass } from '../types/etf';
import { computePortfolioMetrics, type PortfolioMetrics } from './portfolio';

export interface Allocation {
  equity: number;
  bonds: number;
  commodities: number;
  realEstate: number;
}

export interface PortfolioSet {
  id: 'simple' | 'balanced' | 'diversified';
  label: string;
  description: string;
  portfolio: PortfolioEntry[];
  metrics: PortfolioMetrics;
}

export interface RecommendationOutput {
  allocation: Allocation;
  sets: PortfolioSet[];
  singleEtfs: ETF[];
  rationale: string;
}

function baseAllocation(horizon: number): Allocation {
  if (horizon < 3)   return { equity: 10, bonds: 70, commodities: 10, realEstate: 10 };
  if (horizon <= 7)  return { equity: 40, bonds: 40, commodities: 10, realEstate: 10 };
  if (horizon <= 15) return { equity: 60, bonds: 25, commodities: 8,  realEstate: 7  };
  return                  { equity: 75, bonds: 15, commodities: 5,  realEstate: 5  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToHundred(alloc: Allocation): Allocation {
  const total = alloc.equity + alloc.bonds + alloc.commodities + alloc.realEstate;
  if (total === 0) return alloc;
  const e = Math.round((alloc.equity / total) * 100);
  const b = Math.round((alloc.bonds / total) * 100);
  const c = Math.round((alloc.commodities / total) * 100);
  const r = 100 - e - b - c;
  return { equity: e, bonds: b, commodities: c, realEstate: r };
}

export function computeAllocation(profile: UserProfile): Allocation {
  const alloc = baseAllocation(profile.horizon);
  const riskShift = (profile.riskTolerance - 3) * 10;
  alloc.equity = clamp(alloc.equity + riskShift, 0, 95);
  alloc.bonds = clamp(alloc.bonds - riskShift, 0, 95);
  if (profile.age > 55) {
    const reduction = clamp(Math.floor((profile.age - 55) / 5) * 5, 0, alloc.equity);
    alloc.equity -= reduction;
    alloc.bonds += reduction;
  }
  return roundToHundred(alloc);
}

function preferredPolicy(profile: UserProfile): 'acc' | 'dist' {
  return profile.dividendPreference === 'accumulation' ? 'acc' : 'dist';
}

function scoreEtf(etf: ETF, profile: UserProfile): number {
  let score = 0;
  if (etf.domicile === 'IE') score += 3;
  if (etf.aum >= 500) score += 2;
  if (etf.dividendPolicy === preferredPolicy(profile)) score += 2;
  score -= etf.ter * 10;
  if (etf.riskClass <= profile.riskTolerance + 1) score += 1;
  return score;
}

function ranked(etfs: ETF[], assetClass: AssetClass, profile: UserProfile): ETF[] {
  return etfs
    .filter(e => e.assetClass === assetClass)
    .sort((a, b) => scoreEtf(b, profile) - scoreEtf(a, profile));
}

// Split a sleeve allocation across N ETFs. For N=1 just one ETF gets the full weight.
// For N>1 splits evenly across the top N ranked.
function fillSleeve(
  etfs: ETF[],
  assetClass: AssetClass,
  totalWeight: number,
  count: number,
  profile: UserProfile,
): PortfolioEntry[] {
  if (totalWeight <= 0 || count <= 0) return [];
  const pool = ranked(etfs, assetClass, profile);
  if (pool.length === 0) return [];
  const n = Math.min(count, pool.length);
  const each = Math.floor((totalWeight / n) * 10) / 10;
  const result: PortfolioEntry[] = [];
  for (let i = 0; i < n; i++) {
    result.push({ etf: pool[i]!, weight: each });
  }
  // Distribute rounding remainder onto the first slot
  const sum = result.reduce((s, e) => s + e.weight, 0);
  if (result[0] && sum < totalWeight) {
    result[0].weight = Math.round((result[0].weight + (totalWeight - sum)) * 10) / 10;
  }
  return result;
}

// Build a portfolio respecting the allocation and a sleeve split rule.
// When a sleeve is dropped (count=0) its weight is redistributed proportionally to the others.
function buildPortfolio(
  alloc: Allocation,
  etfs: ETF[],
  profile: UserProfile,
  split: { equity: number; bonds: number; commodities: number; realEstate: number },
): PortfolioEntry[] {
  const sleeves = [
    { key: 'equity'      as const, asset: 'equity'      as const, alloc: alloc.equity,      count: split.equity      },
    { key: 'bonds'       as const, asset: 'bonds'       as const, alloc: alloc.bonds,       count: split.bonds       },
    { key: 'commodities' as const, asset: 'commodities' as const, alloc: alloc.commodities, count: split.commodities },
    { key: 'realEstate'  as const, asset: 'real_estate' as const, alloc: alloc.realEstate,  count: split.realEstate  },
  ];

  // Compute weight of dropped sleeves
  const droppedWeight = sleeves
    .filter(s => s.count === 0)
    .reduce((sum, s) => sum + s.alloc, 0);

  const kept = sleeves.filter(s => s.count > 0 && s.alloc > 0);
  const totalKept = kept.reduce((sum, s) => sum + s.alloc, 0);

  // Redistribute dropped weight proportionally
  const effectiveAlloc = new Map<string, number>();
  for (const s of kept) {
    const extra = totalKept > 0 ? droppedWeight * (s.alloc / totalKept) : 0;
    effectiveAlloc.set(s.key, Math.round((s.alloc + extra) * 10) / 10);
  }

  return sleeves
    .filter(s => s.count > 0 && (effectiveAlloc.get(s.key) ?? 0) > 0)
    .flatMap(s => fillSleeve(etfs, s.asset, effectiveAlloc.get(s.key) ?? 0, s.count, profile))
    .filter(e => e.weight > 0);
}

// Maps the user's preferred portfolio size to per-sleeve split counts for each set.
function splitForCount(targetCount: number) {
  if (targetCount <= 2) {
    return {
      simple:       { equity: 1, bonds: 1, commodities: 0, realEstate: 0 },
      balanced:     { equity: 1, bonds: 1, commodities: 1, realEstate: 0 },
      diversified:  { equity: 1, bonds: 1, commodities: 1, realEstate: 1 },
    };
  }
  if (targetCount <= 4) {
    return {
      simple:       { equity: 1, bonds: 1, commodities: 1, realEstate: 0 },
      balanced:     { equity: 1, bonds: 1, commodities: 1, realEstate: 1 },
      diversified:  { equity: 2, bonds: 1, commodities: 1, realEstate: 1 },
    };
  }
  if (targetCount <= 6) {
    return {
      simple:       { equity: 1, bonds: 1, commodities: 1, realEstate: 1 },
      balanced:     { equity: 2, bonds: 1, commodities: 1, realEstate: 1 },
      diversified:  { equity: 2, bonds: 2, commodities: 1, realEstate: 1 },
    };
  }
  return {
    simple:        { equity: 2, bonds: 1, commodities: 1, realEstate: 1 },
    balanced:      { equity: 2, bonds: 2, commodities: 1, realEstate: 1 },
    diversified:   { equity: 3, bonds: 2, commodities: 1, realEstate: 1 },
  };
}

export function buildRecommendation(
  profile: UserProfile,
  etfs: ETF[],
  preferredEtfCount = 4,
): RecommendationOutput {
  const allocation = computeAllocation(profile);
  const splits = splitForCount(preferredEtfCount);

  const sets: PortfolioSet[] = [
    {
      id: 'simple',
      label: 'Semplice',
      description: 'Pochi ETF, gestione minima. Ideale per chi inizia.',
      portfolio: buildPortfolio(allocation, etfs, profile, splits.simple),
      metrics: { weightedTer: 0, averageOverlap: null, effectiveHoldings: null, averageCorrelation: null, topHoldings: [], totalWeight: 0 },
    },
    {
      id: 'balanced',
      label: 'Bilanciato',
      description: 'Mix equilibrato. Buona diversificazione con poca complessità.',
      portfolio: buildPortfolio(allocation, etfs, profile, splits.balanced),
      metrics: { weightedTer: 0, averageOverlap: null, effectiveHoldings: null, averageCorrelation: null, topHoldings: [], totalWeight: 0 },
    },
    {
      id: 'diversified',
      label: 'Diversificato',
      description: 'Massima diversificazione tra strumenti, sleeve azionario sdoppiato.',
      portfolio: buildPortfolio(allocation, etfs, profile, splits.diversified),
      metrics: { weightedTer: 0, averageOverlap: null, effectiveHoldings: null, averageCorrelation: null, topHoldings: [], totalWeight: 0 },
    },
  ];

  for (const s of sets) {
    s.metrics = computePortfolioMetrics(s.portfolio);
  }

  // Single-ETF recommendations: top 2 per sleeve (excluding ones already in sets)
  const usedIsins = new Set(sets.flatMap(s => s.portfolio.map(p => p.etf.isin)));
  const singleEtfs: ETF[] = [];
  for (const cls of ['equity', 'bonds', 'commodities', 'real_estate'] as AssetClass[]) {
    const top = ranked(etfs, cls, profile);
    for (const e of top) {
      if (!usedIsins.has(e.isin) && singleEtfs.length < 6) {
        singleEtfs.push(e);
        usedIsins.add(e.isin);
        break;
      }
    }
  }

  const horizonLabel =
    profile.horizon < 3 ? 'breve termine' :
    profile.horizon <= 7 ? 'medio termine' :
    profile.horizon <= 15 ? 'medio-lungo termine' : 'lungo termine';

  const rationale =
    `Profilo ${horizonLabel} (${profile.horizon} anni), tolleranza al rischio ${profile.riskTolerance}/5. ` +
    `Allocazione target: ${allocation.equity}% azionario, ${allocation.bonds}% obbligazionario, ` +
    `${allocation.commodities}% materie prime, ${allocation.realEstate}% immobiliare.`;

  return { allocation, sets, singleEtfs, rationale };
}
