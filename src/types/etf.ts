export type AssetClass = 'equity' | 'bonds' | 'commodities' | 'real_estate';
export type DividendPolicy = 'acc' | 'dist';
export type ReplicationMethod = 'full_physical' | 'sampling' | 'synthetic';
export type Domicile = 'IE' | 'LU' | 'DE' | 'FR' | 'other';

export interface ETF {
  id: string;
  isin: string;
  ticker: string;
  name: string;
  index: string;
  assetClass: AssetClass;
  domicile: Domicile;
  currency: string;
  hedged: boolean;
  ter: number;
  aum: number;
  dividendPolicy: DividendPolicy;
  replicationMethod: ReplicationMethod;
  riskClass: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  inceptionDate: string;
  exchange: string;
  tradingCurrency: string;

  cagr1y?: number;
  cagr3y?: number;
  cagr5y?: number;
  cagr10y?: number;
  volatility?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;

  sectorWeights?: Record<string, number>;
  geoWeights?: Record<string, number>;

  holdings?: Holding[];

  kidUrl?: string;
  trackingDifference?: number;
}

export interface Holding {
  ticker: string;
  name: string;
  weight: number;
  isin?: string;
}

export interface PortfolioEntry {
  etf: ETF;
  weight: number;
}

export type RebalancingMode = 'none' | 'annual';

export interface SimulationInput {
  initialDeposit: number;
  periodicContribution: number;
  contributionFrequency: 'monthly' | 'quarterly' | 'annual';
  years: number;
  compoundFrequency: 'monthly' | 'quarterly' | 'annual';
  portfolio: PortfolioEntry[];
  taxRegime: 'administered' | 'declarative';
  includeBollo: boolean;
  rebalancing?: RebalancingMode;
}

export interface SimulationResult {
  grossFinal: number;
  netFinal: number;
  realFinal: number;
  yearlyGross: number[];
  yearlyNet: number[];
  monteCarlo: MonteCarloResult;
  // Per-ETF value paths over years (only populated for multi-ETF portfolios).
  // Key: ETF ISIN, value: array of year-end values (after tax/bollo).
  yearlyPerEtf?: Record<string, number[]>;
}

export interface MonteCarloResult {
  p10: number[];
  p50: number[];
  p90: number[];
  finalP10: number;
  finalP50: number;
  finalP90: number;
}

export interface UserProfile {
  age: number;
  horizon: number;
  goal: 'growth' | 'income' | 'capital_protection';
  riskTolerance: 1 | 2 | 3 | 4 | 5;
  initialCapital: number;
  monthlyContribution: number;
  experience: 'none' | 'basic' | 'intermediate' | 'advanced';
  dividendPreference: 'accumulation' | 'income';
  esgPreference: boolean;
}

export interface AllocationRecommendation {
  equity: number;
  bonds: number;
  commodities: number;
  realEstate: number;
  suggestedETFs: PortfolioEntry[];
  rationale: string;
}
