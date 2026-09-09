import type { ETF, PortfolioEntry, SimulationInput } from '@/types/etf';
import etfsData from '@/data/etfs.json';
import { runSimulation } from '@/utils/compound';
import { formatEurCompact } from '@/lib/format';

const etfs = etfsData as unknown as ETF[];

/* A conventional long-horizon mix drawn from the real catalogue. */
const MIX: Array<{ isin: string; weight: number }> = [
  { isin: 'IE00B4L5Y983', weight: 60 }, // iShares Core MSCI World
  { isin: 'IE00B14X4T88', weight: 25 }, // iShares € Govt Bond 7-10yr
  { isin: 'IE00B3VVMM84', weight: 8 },  // iShares Physical Gold
  { isin: 'LU1812091194', weight: 7 },  // Amundi FTSE EPRA NAREIT
];

const YEARS = 20;
const INITIAL = 10_000;
const MONTHLY = 300;

const W = 560;
const H = 240;
const PAD = { top: 16, right: 8, bottom: 24, left: 8 };

/** Smooth-ish polyline through the yearly series, scaled into the viewBox. */
function toPath(series: number[], max: number, close = false): string {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (series.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const d = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  if (!close) return d;
  return `${d} L${x(series.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;
}

/**
 * The hero visual — a real projection, not a decorative squiggle.
 *
 * This is a server component, so `runSimulation` executes once at build time
 * and the client receives static SVG: no chart library, no hydration, no CLS.
 * The point it makes is the product's core thesis — the gap between the gross
 * curve everyone quotes and the net curve you actually keep.
 */
export function HeroChart() {
  const portfolio: PortfolioEntry[] = MIX.map(m => {
    const etf = etfs.find(e => e.isin === m.isin);
    return etf ? { etf, weight: m.weight } : null;
  }).filter((p): p is PortfolioEntry => p !== null);

  const input: SimulationInput = {
    initialDeposit: INITIAL,
    periodicContribution: MONTHLY,
    contributionFrequency: 'monthly',
    years: YEARS,
    compoundFrequency: 'monthly',
    portfolio,
    taxRegime: 'administered',
    includeBollo: true,
  };

  const result = runSimulation(input);
  const gross = result.yearlyGross;
  const net = result.yearlyNet;
  const max = Math.max(...gross) * 1.06;
  const drag = result.grossFinal - result.netFinal;

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-shadow duration-500 ease-[var(--ease-out-quart)] hover:shadow-xl">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-6 py-4">
        <div>
          <p className="text-[0.9375rem] font-semibold tracking-tight text-fg">
            Proiezione a {YEARS} anni
          </p>
          <p className="text-xs text-fg-subtle">
            {formatEurCompact(INITIAL)} iniziali + {MONTHLY} €/mese · portafoglio 60/25/8/7
          </p>
        </div>
        {/* Hidden below sm: at 375px this wraps onto its own line and reads as
            an orphaned chip. The provenance claim is made at length in the
            "Su cosa si basano i numeri" section anyway. */}
        <span className="hidden items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 font-mono text-[0.6875rem] text-fg-subtle sm:inline-flex">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-positive" />
          dati reali dal catalogo
        </span>
      </div>

      <div className="px-3 pt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Proiezione a ${YEARS} anni: valore lordo ${formatEurCompact(result.grossFinal)}, valore netto dopo imposte italiane ${formatEurCompact(result.netFinal)}. La differenza fiscale è di ${formatEurCompact(drag)}.`}
        >
          <defs>
            <linearGradient id="hero-gross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--data-gross)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--data-gross)" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="hero-net" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--data-net)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--data-net)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {gridLines.map(g => {
            const innerH = H - PAD.top - PAD.bottom;
            const y = PAD.top + innerH - g * innerH;
            return (
              <line
                key={g}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}

          {/* Areas fade in behind the strokes that are still being drawn, so
              the shape reads as filling rather than as two separate reveals. */}
          <path
            d={toPath(gross, max, true)}
            fill="url(#hero-gross)"
            className="animate-fade-in [animation-delay:600ms] [animation-duration:900ms]"
          />
          <path
            d={toPath(net, max, true)}
            fill="url(#hero-net)"
            className="animate-fade-in [animation-delay:750ms] [animation-duration:900ms]"
          />
          {/* `pathLength={1}` normalises the geometry so the dash length in the
              `.draw-in` utility is a constant, not something JavaScript has to
              measure with `getTotalLength()` after hydration. The net curve
              starts a beat later than the gross one: the gap between them is
              the point the chart is making, and drawing them in sequence is
              what makes that gap legible. */}
          <path
            d={toPath(gross, max)}
            pathLength={1}
            fill="none"
            stroke="var(--data-gross)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="draw-in [animation-delay:120ms]"
          />
          <path
            d={toPath(net, max)}
            pathLength={1}
            fill="none"
            stroke="var(--data-net)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="draw-in [animation-delay:320ms]"
          />
        </svg>
      </div>

      <figcaption className="grid grid-cols-3 gap-3 border-t border-border px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-wide text-fg-subtle">
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--data-gross)]" />
            Lordo
          </span>
          <span className="tnum text-[1.0625rem] font-semibold text-fg">
            {formatEurCompact(result.grossFinal)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-wide text-fg-subtle">
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--data-net)]" />
            Netto
          </span>
          <span className="tnum text-[1.0625rem] font-semibold text-fg">
            {formatEurCompact(result.netFinal)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-fg-subtle">
            Peso fiscale
          </span>
          <span className="tnum text-[1.0625rem] font-semibold text-accent">
            −{formatEurCompact(drag)}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
