import type { MonteCarloResult, SimulationInput } from '../types/etf';
import { derivedAnnualReturn } from './compound';
import { TAX_RATE_STANDARD, BOLLO_RATE } from './tax';

const N_SIMULATIONS = 1000;

/**
 * Deterministic PRNG (mulberry32).
 *
 * Two reasons this replaces the unseeded global generator:
 *
 * 1. Next.js server-renders the simulator, so an unseeded generator produced
 *    one fan chart on the server and a different one on the client — a React
 *    hydration mismatch (error #418).
 * 2. An unseeded generator makes the function impure, which the project's own
 *    conventions forbid for utilities, and it means identical inputs produce a
 *    different chart on every single render.
 *
 * A fixed-seed generator is standard practice in simulation work: 1.000 paths
 * from a well-distributed PRNG give the same percentile estimates, and the
 * result becomes reproducible — the same portfolio always yields the same
 * projection.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derives a stable seed from the inputs, so different scenarios differ. */
function seedFrom(input: SimulationInput, volatilityPct: number): number {
  const parts = [
    input.initialDeposit,
    input.periodicContribution,
    input.contributionFrequency,
    input.years,
    Math.round(volatilityPct * 100),
    ...input.portfolio.map(p => `${p.etf.isin}:${p.weight}`),
  ].join('|');

  let h = 2166136261;
  for (let i = 0; i < parts.length; i++) {
    h ^= parts.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Standard normal sample via the Box-Muller transform. */
function randn(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function runMonteCarlo(
  input: SimulationInput,
  volatilityPct: number,
): MonteCarloResult {
  const rng = mulberry32(seedFrom(input, volatilityPct));
  const mu = derivedAnnualReturn(input.portfolio) / 100;
  const sigma = volatilityPct / 100;
  const years = input.years;
  const contribsPerYear =
    input.contributionFrequency === 'monthly' ? 12 :
    input.contributionFrequency === 'quarterly' ? 4 : 1;
  const yearlyContrib = input.periodicContribution * contribsPerYear;

  // Each simulation returns an array of year-end values (gross, no tax for fan chart)
  const allPaths: number[][] = [];

  for (let sim = 0; sim < N_SIMULATIONS; sim++) {
    let value = input.initialDeposit;
    const path: number[] = [];
    for (let y = 0; y < years; y++) {
      // Log-normal annual return
      const annualReturn = Math.exp((mu - 0.5 * sigma * sigma) + sigma * randn(rng)) - 1;
      value = value * (1 + annualReturn) + yearlyContrib;
      if (input.includeBollo) value -= value * BOLLO_RATE;
      // Simplified annual tax on positive gain
      const gain = value - (y === 0 ? input.initialDeposit : allPaths[sim]?.[y - 1] ?? value) - yearlyContrib;
      if (gain > 0) value -= gain * TAX_RATE_STANDARD;
      path.push(Math.max(0, Math.round(value)));
    }
    allPaths.push(path);
  }

  // Extract percentiles year by year
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  for (let y = 0; y < years; y++) {
    const yearValues = allPaths.map(path => path[y] ?? 0).sort((a, b) => a - b);
    p10.push(yearValues[Math.floor(N_SIMULATIONS * 0.10)] ?? 0);
    p50.push(yearValues[Math.floor(N_SIMULATIONS * 0.50)] ?? 0);
    p90.push(yearValues[Math.floor(N_SIMULATIONS * 0.90)] ?? 0);
  }

  return {
    p10,
    p50,
    p90,
    finalP10: p10[years - 1] ?? 0,
    finalP50: p50[years - 1] ?? 0,
    finalP90: p90[years - 1] ?? 0,
  };
}
