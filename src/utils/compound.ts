import type { AssetClass, PortfolioEntry, SimulationInput, SimulationResult, RebalancingMode } from '../types/etf';
import { TAX_RATE_STANDARD, BOLLO_RATE } from './tax';
import { runMonteCarlo } from './montecarlo';

export const DEFAULT_CAGR: Record<AssetClass, number> = {
  equity: 8.0,
  bonds: 2.5,
  commodities: 3.5,
  real_estate: 5.0,
};

const DEFAULT_VOLATILITY: Record<AssetClass, number> = {
  equity: 15.0,
  bonds: 5.0,
  commodities: 18.0,
  real_estate: 12.0,
};

export function derivedVolatility(portfolio: PortfolioEntry[]): number {
  if (portfolio.length === 0) return DEFAULT_VOLATILITY.equity;
  let sumWeights = 0;
  let sumWeightedVol = 0;
  for (const entry of portfolio) {
    const vol = entry.etf.volatility ?? DEFAULT_VOLATILITY[entry.etf.assetClass];
    sumWeightedVol += entry.weight * vol;
    sumWeights += entry.weight;
  }
  return sumWeights > 0 ? sumWeightedVol / sumWeights : DEFAULT_VOLATILITY.equity;
}

export function derivedAnnualReturn(portfolio: PortfolioEntry[]): number {
  if (portfolio.length === 0) return DEFAULT_CAGR.equity;
  let sumWeights = 0;
  let sumWeightedReturn = 0;
  for (const entry of portfolio) {
    const cagr = entry.etf.cagr5y ?? entry.etf.cagr3y ?? DEFAULT_CAGR[entry.etf.assetClass];
    sumWeightedReturn += entry.weight * cagr;
    sumWeights += entry.weight;
  }
  return sumWeights > 0 ? sumWeightedReturn / sumWeights : DEFAULT_CAGR.equity;
}

function etfCagr(entry: PortfolioEntry): number {
  return entry.etf.cagr5y ?? entry.etf.cagr3y ?? DEFAULT_CAGR[entry.etf.assetClass];
}

function periodCountPerYear(freq: SimulationInput['contributionFrequency']): number {
  if (freq === 'monthly') return 12;
  if (freq === 'quarterly') return 4;
  return 1;
}

// Single-ETF or aggregate-rate simulation: monthly compounding with annual tax + bollo settlement.
function simulateYearly(
  initialDeposit: number,
  periodicContribution: number,
  contributionFrequency: SimulationInput['contributionFrequency'],
  annualReturnPct: number,
  years: number,
  withTax: boolean,
  includeBollo: boolean,
): number[] {
  const monthlyGrowth = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
  const n = periodCountPerYear(contributionFrequency);
  const monthlyContrib = (periodicContribution * n) / 12;
  const yearlyContrib = periodicContribution * n;

  let value = initialDeposit;
  const results: number[] = [];

  for (let year = 0; year < years; year++) {
    const startValue = value;
    for (let m = 0; m < 12; m++) {
      value = value * (1 + monthlyGrowth) + monthlyContrib;
    }
    if (withTax) {
      const gain = value - startValue - yearlyContrib;
      if (gain > 0) value -= gain * TAX_RATE_STANDARD;
      if (includeBollo) value -= value * BOLLO_RATE;
    }
    results.push(Math.round(value * 100) / 100);
  }
  return results;
}

interface PerEtfRunResult {
  yearlyTotals: number[];
  yearlyPerEtf: number[][]; // [year][etfIndex]
}

// Per-ETF simulation: each ETF grows on its own CAGR, monthly contributions
// are allocated by target weights. Annual aggregate tax + bollo proportionally
// reduce all ETF values (since we tax the aggregate gain). When rebalancing is
// 'annual', at year-end values are reset to target weights × total.
function simulatePerEtfYearly(
  portfolio: PortfolioEntry[],
  initialDeposit: number,
  periodicContribution: number,
  contributionFrequency: SimulationInput['contributionFrequency'],
  years: number,
  withTax: boolean,
  includeBollo: boolean,
  rebalancing: RebalancingMode,
): PerEtfRunResult {
  const n = portfolio.length;
  const sumWeights = portfolio.reduce((s, e) => s + e.weight, 0);
  const targets = sumWeights > 0
    ? portfolio.map(e => e.weight / sumWeights)
    : new Array(n).fill(1 / n) as number[];

  const monthlyGrowths = portfolio.map(e => Math.pow(1 + etfCagr(e) / 100, 1 / 12) - 1);
  const periodsPerYear = periodCountPerYear(contributionFrequency);
  const monthlyContrib = (periodicContribution * periodsPerYear) / 12;
  const yearlyContrib = periodicContribution * periodsPerYear;

  // Initial values: allocate initial deposit by target weights
  const values: number[] = targets.map(w => initialDeposit * w);
  const yearlyTotals: number[] = [];
  const yearlyPerEtf: number[][] = [];

  for (let year = 0; year < years; year++) {
    const startTotal = values.reduce((s, v) => s + v, 0);

    for (let m = 0; m < 12; m++) {
      // Grow each ETF
      for (let i = 0; i < n; i++) {
        values[i] = (values[i] ?? 0) * (1 + (monthlyGrowths[i] ?? 0));
      }
      // Add monthly contribution split by target weights
      for (let i = 0; i < n; i++) {
        values[i] = (values[i] ?? 0) + monthlyContrib * (targets[i] ?? 0);
      }
    }

    if (withTax) {
      const endTotal = values.reduce((s, v) => s + v, 0);
      const gain = endTotal - startTotal - yearlyContrib;
      let factor = 1;
      let postTaxTotal = endTotal;
      if (gain > 0) {
        const tax = gain * TAX_RATE_STANDARD;
        postTaxTotal = endTotal - tax;
        factor *= postTaxTotal / endTotal;
      }
      if (includeBollo) {
        const bollo = postTaxTotal * BOLLO_RATE;
        factor *= (postTaxTotal - bollo) / postTaxTotal;
      }
      if (factor !== 1) {
        for (let i = 0; i < n; i++) values[i] = (values[i] ?? 0) * factor;
      }
    }

    if (rebalancing === 'annual') {
      const total = values.reduce((s, v) => s + v, 0);
      for (let i = 0; i < n; i++) values[i] = total * (targets[i] ?? 0);
    }

    const total = values.reduce((s, v) => s + v, 0);
    yearlyTotals.push(Math.round(total * 100) / 100);
    yearlyPerEtf.push(values.map(v => Math.round(v * 100) / 100));
  }

  return { yearlyTotals, yearlyPerEtf };
}

export function runSimulation(input: SimulationInput, inflationRate = 2.0): SimulationResult {
  const rebalancing: RebalancingMode = input.rebalancing ?? 'annual';
  const multiEtf = input.portfolio.length >= 2;

  let yearlyGross: number[];
  let yearlyNet: number[];
  let yearlyPerEtf: Record<string, number[]> | undefined;

  if (multiEtf) {
    const gross = simulatePerEtfYearly(
      input.portfolio,
      input.initialDeposit,
      input.periodicContribution,
      input.contributionFrequency,
      input.years,
      false,
      false,
      rebalancing,
    );
    const net = simulatePerEtfYearly(
      input.portfolio,
      input.initialDeposit,
      input.periodicContribution,
      input.contributionFrequency,
      input.years,
      true,
      input.includeBollo,
      rebalancing,
    );
    yearlyGross = gross.yearlyTotals;
    yearlyNet = net.yearlyTotals;
    yearlyPerEtf = {};
    for (let i = 0; i < input.portfolio.length; i++) {
      const isin = input.portfolio[i]!.etf.isin;
      yearlyPerEtf[isin] = net.yearlyPerEtf.map(row => row[i] ?? 0);
    }
  } else {
    const annualReturn = derivedAnnualReturn(input.portfolio);
    yearlyGross = simulateYearly(
      input.initialDeposit, input.periodicContribution, input.contributionFrequency,
      annualReturn, input.years, false, false,
    );
    yearlyNet = simulateYearly(
      input.initialDeposit, input.periodicContribution, input.contributionFrequency,
      annualReturn, input.years, true, input.includeBollo,
    );
  }

  const grossFinal = yearlyGross[yearlyGross.length - 1] ?? 0;
  const netFinal = yearlyNet[yearlyNet.length - 1] ?? 0;
  const realFinal =
    Math.round((netFinal / Math.pow(1 + inflationRate / 100, input.years)) * 100) / 100;

  const volatilityPct = derivedVolatility(input.portfolio);
  const monteCarlo = runMonteCarlo(input, volatilityPct);

  return {
    grossFinal,
    netFinal,
    realFinal,
    yearlyGross,
    yearlyNet,
    monteCarlo,
    yearlyPerEtf,
  };
}

export function computeInvestedByYear(
  initialDeposit: number,
  periodicContribution: number,
  contributionFrequency: SimulationInput['contributionFrequency'],
  years: number,
): number[] {
  const n = periodCountPerYear(contributionFrequency);
  const yearlyContrib = periodicContribution * n;
  return Array.from({ length: years }, (_, i) =>
    Math.round((initialDeposit + yearlyContrib * (i + 1)) * 100) / 100,
  );
}
