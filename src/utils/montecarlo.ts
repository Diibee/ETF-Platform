import type { MonteCarloResult, SimulationInput } from '../types/etf';
import { derivedAnnualReturn } from './compound';
import { TAX_RATE_STANDARD, BOLLO_RATE } from './tax';

const N_SIMULATIONS = 1000;

// Generates a standard normal sample via Box-Muller transform
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function runMonteCarlo(
  input: SimulationInput,
  volatilityPct: number,
): MonteCarloResult {
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
      const annualReturn = Math.exp((mu - 0.5 * sigma * sigma) + sigma * randn()) - 1;
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
