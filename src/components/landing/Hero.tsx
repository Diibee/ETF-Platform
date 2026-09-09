import { CtaLink, CtaArrow, Eyebrow } from './primitives';
import { StaggerGroup, StaggerItem, CountUp } from '@/components/motion';
import { HeroChart } from './HeroChart';
import { CTA, CTA_REASSURANCE } from './cta';
import { CATALOGUE, MONTE_CARLO_RUNS } from './stats';

const TRUST: Array<{ value: number | string; label: string }> = [
  { value: CATALOGUE.count, label: 'ETF nel catalogo' },
  { value: CATALOGUE.assetClasses, label: 'classi di attivo' },
  { value: MONTE_CARLO_RUNS, label: 'simulazioni Monte Carlo' },
  { value: '26% + 0,2%', label: 'capital gain e bollo' },
];

/**
 * Hero.
 *
 * Three deliberate restraints:
 *
 * 1. Nothing above the fold is wrapped in a scroll reveal. An entrance
 *    animation starting at `opacity: 0` holds back the Largest Contentful
 *    Paint until it finishes — measured at +862ms. The motion that *is* here
 *    (the chart drawing itself in, the pulsing status dot) animates properties
 *    that leave the text painted at full opacity from the first frame.
 * 2. One decorative device, not four. This previously stacked a gradient-text
 *    headline span, a radial halo, a dotted grid and a split pill badge. Each
 *    is a stock flourish; together they read as generated rather than
 *    designed. The headline now carries the weight on its own.
 * 3. The trust strip counts up rather than fading in. It sits at the fold on
 *    desktop, so a fade would either fire before it is seen or not at all;
 *    tweened figures read as the page computing them, which is the claim the
 *    strip is making anyway.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* The single remaining flourish: a soft brand wash behind the fold. */}
      <div
        aria-hidden="true"
        className="halo pointer-events-none absolute inset-x-0 top-0 h-[32rem]"
      />

      <div className="shell relative grid items-center gap-x-12 gap-y-12 pt-12 pb-[var(--section-y)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-16">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow className="inline-flex items-center gap-2">
            {/* Two stacked dots: the outer one expands and fades on a loop, the
                inner one stays put so the marker never disappears. */}
            <span aria-hidden="true" className="relative inline-flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            Fiscalità italiana, in ogni proiezione
          </Eyebrow>

          <h1 className="text-display text-balance text-fg">
            Il rendimento che leggi non è quello che incassi.
          </h1>

          <p className="measure text-lead text-pretty text-fg-muted">
            ETF Lab analizza, confronta e simula ETF acquistabili in Italia calcolando
            capital gain, imposta di bollo e inflazione. Nessuna promessa: solo la
            proiezione al netto di quello che lo Stato trattiene davvero.
          </p>

          {/* Full width under `sm`: at 375px a shrink-wrapped button sits in the
              middle of the screen and misses the thumb arc entirely. */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CtaLink href={CTA.simulator.href} className="w-full sm:w-auto">
              {CTA.simulator.label}
              <CtaArrow />
            </CtaLink>
            <CtaLink href={CTA.catalogue.href} variant="secondary" className="w-full sm:w-auto">
              {CTA.catalogue.label}
            </CtaLink>
          </div>

          <p className="text-sm text-fg-subtle">{CTA_REASSURANCE}</p>
        </div>

        <div className="min-w-0">
          <HeroChart />
        </div>
      </div>

      {/* Trust strip — closes the hero and hands off to the problem section. */}
      <div className="relative border-y border-border bg-surface/50">
        <StaggerGroup
          as="dl"
          step={0.07}
          amount={0.4}
          className="shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4"
        >
          {TRUST.map(t => (
            <StaggerItem key={t.label} y={10} className="flex flex-col gap-1">
              <dt className="order-2 text-xs text-fg-subtle">{t.label}</dt>
              <dd className="tnum order-1 m-0 text-h3 leading-none font-semibold tracking-tight text-fg">
                {typeof t.value === 'number' ? (
                  <CountUp value={t.value} duration={1.1} />
                ) : (
                  t.value
                )}
              </dd>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
