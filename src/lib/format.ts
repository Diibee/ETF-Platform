const EUR_0 = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const EUR_2 = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUM_0 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 });

/** Whole euros — the default for every projected figure. */
export function formatEur(value: number): string {
  return EUR_0.format(value);
}

/** Euros with cents — only for small, exact amounts. */
export function formatEurExact(value: number): string {
  return EUR_2.format(value);
}

/** Compact euros for chart axes and tight chips: €1,2 Mln / €340 K. */
export function formatEurCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}€${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace('.', ',')} Mln`;
  if (abs >= 1_000) return `${sign}€${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1).replace('.', ',')} K`;
  return `${sign}€${NUM_0.format(abs)}`;
}

/** Percentages are stored as actual percent (8.5 → "8,50%"). */
export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return 'n/d';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/** Same as formatPercent but always carries an explicit sign. */
export function formatPercentSigned(value: number | null | undefined, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return 'n/d';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(decimals).replace('.', ',')}%`;
}

/** Signed euro delta, using a true minus sign rather than a hyphen. */
export function formatEurSigned(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${EUR_0.format(Math.abs(value))}`;
}

/** AUM arrives in millions of EUR. */
export function formatAum(aum: number): string {
  if (aum >= 1000) return `€${(aum / 1000).toFixed(1).replace('.', ',')} Mld`;
  return `€${NUM_0.format(Math.round(aum))} Mln`;
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value == null || Number.isNaN(value)) return 'n/d';
  return value.toFixed(decimals).replace('.', ',');
}

/** ISO date → "mar 2019". Falls back to the raw string when unparseable. */
export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('it-IT', { month: 'short', year: 'numeric' }).format(d);
}

/** Whole years elapsed since an ISO date. */
export function yearsSince(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}
