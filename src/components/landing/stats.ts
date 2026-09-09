import type { ETF } from '@/types/etf';
import etfsData from '@/data/etfs.json';

const etfs = etfsData as unknown as ETF[];

/**
 * Catalogue facts, derived from the dataset at build time.
 *
 * The landing copy used to hardcode "30 ETF" and "Trenta ETF" in three places.
 * When the catalogue grew to 95 the page kept advertising 30 — the exact
 * failure this module exists to prevent. Nothing about the catalogue should be
 * typed into a sentence; import it from here so it cannot go stale, and let the
 * daily data pipeline update the copy for free.
 */
const ters = etfs.map(e => e.ter).filter((t): t is number => typeof t === 'number').sort((a, b) => a - b);

/** Italian decimal comma, for figures that appear in prose. */
const it = (n: number) => String(n).replace('.', ',');

export const CATALOGUE = {
  count: etfs.length,
  assetClasses: new Set(etfs.map(e => e.assetClass)).size,
  ieDomiciled: etfs.filter(e => e.domicile === 'IE').length,
  withHoldings: etfs.filter(e => e.holdings && e.holdings.length > 0).length,
  exchanges: [...new Set(etfs.map(e => e.exchange))],
  terMin: it(ters[0] ?? 0),
  terMax: it(ters[ters.length - 1] ?? 0),
} as const;

/** Monte Carlo iterations, mirrored from `src/utils/montecarlo.ts`. */
export const MONTE_CARLO_RUNS = 1000;

/**
 * Pre-formatted for prose. `toLocaleString('it-IT')` renders 1000 as "1000":
 * Italian CLDR sets minimumGroupingDigits to 2, so grouping only kicks in at
 * five digits. Group explicitly so the copy reads "1.000" as intended, and so
 * the server and client can never disagree over an ICU detail.
 */
export const MONTE_CARLO_RUNS_LABEL = MONTE_CARLO_RUNS
  .toString()
  .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
