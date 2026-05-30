# ETF & Compound Investing Platform

Personal educational tool to analyze, simulate, and select ETFs/index funds purchasable in Italy.
Not a regulated financial advisory service — see Disclaimer section.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts (compound curves, Monte Carlo fan charts, correlation heatmap)
- **Routing**: React Router v6
- **State**: React Context + useReducer (no Redux for now)
- **Data (MVP 1–2)**: static JSON files in `src/data/`
- **Data (MVP 3+)**: scraping pipeline from justETF + issuer CSV downloads (holdings, KID)
- **Backend (MVP 3+)**: Node.js + Express, PostgreSQL

No backend is required for MVP 1 and 2. Keep it purely frontend.

---

## Folder Structure

```
etf-platform/
├── CLAUDE.md
├── src/
│   ├── components/
│   │   ├── catalogue/        # ETF list, filters, detail card
│   │   ├── simulator/        # Compound calculator, Monte Carlo chart
│   │   ├── portfolio/        # Overlap, correlation matrix, look-through
│   │   ├── questionnaire/    # Profiling flow + recommendation output
│   │   └── common/           # Button, Card, Badge, Modal, Disclaimer
│   ├── data/
│   │   └── etfs.json         # Static ETF records (seed with 15–20 ETFs)
│   ├── utils/
│   │   ├── compound.ts       # Compound interest + net-of-tax calculations
│   │   ├── montecarlo.ts     # Monte Carlo simulation engine
│   │   ├── tax.ts            # Italian tax logic (capital gain, bollo, zainetto)
│   │   ├── overlap.ts        # Portfolio overlap calculator
│   │   └── correlation.ts    # Pearson correlation matrix
│   ├── types/
│   │   └── etf.ts            # All TypeScript interfaces (source of truth)
│   ├── App.tsx
│   └── main.tsx
└── public/
```

---

## Core TypeScript Interfaces

Always import from `src/types/etf.ts`. Never redefine these inline.

```ts
// src/types/etf.ts

export type AssetClass = 'equity' | 'bonds' | 'commodities' | 'real_estate';
export type DividendPolicy = 'acc' | 'dist';
export type ReplicationMethod = 'full_physical' | 'sampling' | 'synthetic';
export type Domicile = 'IE' | 'LU' | 'DE' | 'FR' | 'other';

export interface ETF {
  id: string;
  isin: string;
  ticker: string;
  name: string;
  index: string;                   // tracked index name
  assetClass: AssetClass;
  domicile: Domicile;              // IE = lower US dividend withholding tax
  currency: string;                // underlying asset currency (e.g. USD, EUR)
  hedged: boolean;                 // EUR-hedged version?
  ter: number;                     // annual %, e.g. 0.07 = 0.07%
  aum: number;                     // AUM in millions EUR
  dividendPolicy: DividendPolicy;
  replicationMethod: ReplicationMethod;
  riskClass: 1 | 2 | 3 | 4 | 5 | 6 | 7; // KID SRI indicator
  inceptionDate: string;           // ISO date
  exchange: string;                // e.g. 'Borsa Italiana', 'Xetra'
  tradingCurrency: string;         // e.g. 'EUR'

  // Performance & risk metrics
  cagr1y?: number;                 // %
  cagr3y?: number;
  cagr5y?: number;
  cagr10y?: number;
  volatility?: number;             // annualized std dev %
  maxDrawdown?: number;            // worst peak-to-trough %
  sharpeRatio?: number;

  // Breakdown
  sectorWeights?: Record<string, number>;   // e.g. { Technology: 28.5, ... }
  geoWeights?: Record<string, number>;       // e.g. { USA: 63.0, ... }

  // Holdings (required for overlap and correlation)
  holdings?: Holding[];

  // Documents
  kidUrl?: string;
  trackingDifference?: number;     // actual gap vs index per year
}

export interface Holding {
  ticker: string;
  name: string;
  weight: number;  // % of fund
  isin?: string;
}

export interface PortfolioEntry {
  etf: ETF;
  weight: number;  // % allocation (must sum to 100)
}

export interface SimulationInput {
  initialDeposit: number;
  periodicContribution: number;
  contributionFrequency: 'monthly' | 'quarterly' | 'annual';
  years: number;
  compoundFrequency: 'monthly' | 'quarterly' | 'annual';
  portfolio: PortfolioEntry[];     // used to derive estimated return
  taxRegime: 'administered' | 'declarative';
  includeBollo: boolean;
}

export interface SimulationResult {
  grossFinal: number;
  netFinal: number;                // after Italian capital gain tax + bollo
  realFinal: number;               // net + inflation-adjusted
  yearlyGross: number[];
  yearlyNet: number[];
  monteCarlo: MonteCarloResult;
}

export interface MonteCarloResult {
  p10: number[];   // unlucky scenario (10th percentile) — year by year
  p50: number[];   // median
  p90: number[];   // lucky scenario (90th percentile)
  finalP10: number;
  finalP50: number;
  finalP90: number;
}

export interface UserProfile {
  age: number;
  horizon: number;                 // years
  goal: 'growth' | 'income' | 'capital_protection';
  riskTolerance: 1 | 2 | 3 | 4 | 5;
  initialCapital: number;
  monthlyContribution: number;
  experience: 'none' | 'basic' | 'intermediate' | 'advanced';
  dividendPreference: 'accumulation' | 'income';
  esgPreference: boolean;
}

export interface AllocationRecommendation {
  equity: number;       // % target
  bonds: number;
  commodities: number;
  realEstate: number;
  suggestedETFs: PortfolioEntry[];
  rationale: string;
}
```

---

## Italian Tax Logic

All tax calculations live in `src/utils/tax.ts`. Rules to implement:

```ts
// Capital gain tax rates (verify for latest rates before production use)
const TAX_RATE_STANDARD = 0.26;       // 26% on most ETF gains
const TAX_RATE_GOV_BONDS = 0.125;     // 12.5% on white-list government bond ETFs
const BOLLO_RATE = 0.002;             // 0.2% annual stamp duty on portfolio value

// Key Italian-specific rule: ETF gains (redditi di capitale) CANNOT be offset
// against prior capital losses (redditi diversi) — the "zainetto fiscale" problem.
// Model this by applying full tax on every gain without loss offset.

// In "administered" regime: tax is withheld at source by the broker.
// In "declarative" regime: investor declares and pays on tax return.
// For simulation purposes, the gross tax impact is the same — only timing differs.

// Net return formula per year:
// grossGain = endValue - startValue - contributions
// taxDue = grossGain * applicableRate (standard or gov_bonds)
// bolloTaxDue = endValue * BOLLO_RATE
// netValue = endValue - taxDue - bolloTaxDue
```

Always show both gross and net in the simulator. Never show only gross.

---

## Compound & Monte Carlo Logic

```ts
// src/utils/compound.ts
// Derive estimated annual return from portfolio:
// weightedReturn = sum(etf.weight * etf.cagr5y ?? etf.cagr3y ?? assetClassDefault)

// Asset class default CAGRs (conservative baselines, displayed with disclaimer):
const DEFAULT_CAGR: Record<AssetClass, number> = {
  equity:       8.0,   // global equities long-run historical
  bonds:        2.5,
  commodities:  3.5,
  real_estate:  5.0,
};

// src/utils/montecarlo.ts
// Run N = 1000 simulations using:
// - weightedReturn as mean annual return
// - weightedVolatility as std dev (derived from etf.volatility weights)
// - Log-normal return distribution
// Extract p10, p50, p90 from final values
```

---

## Overlap & Correlation Logic

```ts
// src/utils/overlap.ts
// Overlap between two portfolios A and B:
// For each holding present in both: overlap += min(weightInA, weightInB)
// Express as % of portfolio effectively duplicated.

// src/utils/correlation.ts
// Correlation matrix uses Pearson correlation on historical annual returns.
// If only 1–2 years of data available, mark as "insufficient data".
// Display as color-coded heatmap (Recharts or custom SVG).
// Color scale: dark green = -1 (inverse), white = 0, dark red = +1 (identical).
// Warn when correlation > 0.85 between two ETFs (likely redundant).
```

---

## Recommendation Engine

Lives in `src/utils/recommendation.ts`.

```
Horizon < 3y  → equity 10%, bonds 70%, commodities 10%, real_estate 10%
Horizon 3–7y  → equity 40%, bonds 40%, commodities 10%, real_estate 10%
Horizon 7–15y → equity 60%, bonds 25%, commodities 8%, real_estate 7%
Horizon > 15y → equity 75%, bonds 15%, commodities 5%, real_estate 5%

Then adjust by riskTolerance (-2/+2 levels shifts equity ±10%).
Then adjust by age: if age > 55, reduce equity by 5% per 5 years over 55.

For each asset class sleeve, prefer:
  - domicile: 'IE' (lower withholding tax)
  - dividendPolicy: match user's dividendPreference
  - ter: lowest available
  - aum: > 500M (liquidity safety)
  - riskClass: within tolerance
```

---

## MVP Phases — Build in This Order

### MVP 1 (start here)
- [ ] Static ETF catalogue (15–20 ETFs) with all fields populated in `etfs.json`
- [ ] ETF list page with filters (assetClass, dividendPolicy, domicile, TER range)
- [ ] ETF detail page (all fields + KID link)
- [ ] Compound simulator: inputs → gross + net + real output + year-by-year chart

### MVP 2
- [ ] Profiling questionnaire (8 questions)
- [ ] Recommendation engine → allocation % + suggested ETFs
- [ ] Monte Carlo fan chart on simulator

### MVP 3
- [ ] Portfolio builder: add N ETFs with weight sliders
- [ ] Look-through holdings table
- [ ] Overlap calculator
- [ ] Correlation matrix heatmap

### MVP 4
- [ ] Backtest on historical data
- [ ] Rebalancing simulation
- [ ] "Zainetto fiscale" multi-year tax model

### MVP 5
- [ ] Data pipeline: justETF scraping + issuer CSV ingestion
- [ ] Scheduled refresh job

**Always implement in MVP order. Do not jump to MVP 3 features while MVP 1 is incomplete.**

---

## Seed ETF Data (populate etfs.json with at least these)

Cover all four asset classes and both dividend policies:

| ISIN           | Name                        | Category      | Policy | TER   |
|----------------|-----------------------------|---------------|--------|-------|
| IE00B4L5Y983   | iShares Core MSCI World     | equity        | acc    | 0.20% |
| IE00B3RBWM25   | Vanguard FTSE All-World     | equity        | dist   | 0.22% |
| IE00BK5BQT80   | Vanguard FTSE All-World Acc | equity        | acc    | 0.22% |
| IE00B52SFT06   | iShares MSCI EM             | equity        | acc    | 0.18% |
| LU0908500753   | Amundi MSCI World           | equity        | acc    | 0.12% |
| IE00B4WXJJ64   | iShares S&P 500             | equity        | acc    | 0.07% |
| IE00B3F81R35   | iShares Core MSCI Europe    | equity        | acc    | 0.12% |
| IE00B14X4T88   | iShares € Govt Bond 7-10yr  | bonds         | acc    | 0.15% |
| IE00B3F81409   | iShares Core € Corp Bond    | bonds         | acc    | 0.20% |
| LU1650490474   | Amundi Glb Aggregate Bond   | bonds         | acc    | 0.10% |
| IE00B3VVMM84   | iShares Physical Gold       | commodities   | acc    | 0.12% |
| IE00B579F325   | iShares Diversified Commodity | commodities | dist   | 0.19% |
| IE00B5L01S80   | iShares Developed Mkt Prop  | real_estate   | dist   | 0.59% |
| LU1812091194   | Amundi FTSE EPRA NAREIT     | real_estate   | acc    | 0.14% |

---

## UI / UX Rules

- Language: Italian UI labels, English code.
- Every page with return estimates must show this disclaimer (component `<ReturnDisclaimer />`):
  > "I rendimenti stimati si basano su dati storici e non garantiscono rendimenti futuri. Questo strumento è educativo, non consulenza finanziaria."
- Every recommendation output must show `<FriendsDisclaimer />`:
  > "Strumento di analisi personale. Condividere raccomandazioni di investimento personalizzate con terzi può richiedere autorizzazione regolamentare (MiFID II)."
- Risk class badge colors: 1–2 green, 3–4 yellow, 5–7 red.
- Always display both gross and net return side by side — never gross only.
- Domicile 'IE' gets a small "🇮🇪 tax-efficient" badge on the detail card.
- Acc ETFs get a "♻️ accumula" badge; Dist get a "💰 distribuisce" badge.

---

## Coding Conventions

- TypeScript strict mode: no `any`, no implicit returns.
- All monetary calculations in `number` (no float precision issues for display; round to 2 decimals in UI).
- All % values stored as actual percent (8.5 not 0.085).
- Utility functions must be pure — no side effects, no API calls.
- Every component gets a `__tests__/` unit test for its core logic (utils especially).
- Use named exports, not default exports (except pages).
- No inline styles — Tailwind only.
- Keep components under 200 lines; split if larger.

---

## What NOT to Do

- Do NOT hardcode tax rates in components — always import from `tax.ts`.
- Do NOT show gross-only returns without a net alternative.
- Do NOT build MVP 3 features before MVP 1 is complete.
- Do NOT add a backend before it is explicitly requested.
- Do NOT use `localStorage` for portfolio state — keep it in React Context.
- Do NOT recommend specific ETFs as "the best" in UI copy — present data, let the user decide.
- Do NOT skip the disclaimer components on any page that shows returns or recommendations.
