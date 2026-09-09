import { CtaLink, Eyebrow } from './primitives';
import { Reveal } from './Reveal';
import { HeroChart } from './HeroChart';
import { CTA, CTA_REASSURANCE } from './cta';

const TRUST = [
  { value: '30', label: 'ETF nel catalogo' },
  { value: '4', label: 'classi di attivo' },
  { value: '1.000', label: 'simulazioni Monte Carlo' },
  { value: '26% + 0,2%', label: 'capital gain e bollo' },
];

/**
 * Hero.
 *
 * Two deliberate restraints:
 *
 * 1. Nothing here is wrapped in a scroll reveal. Everything is above the fold,
 *    so an entrance animation starting at `opacity: 0` holds back the Largest
 *    Contentful Paint until it finishes — measured at +862ms.
 * 2. One decorative device, not four. This previously stacked a gradient-text
 *    headline span, a radial halo, a dotted grid and a split pill badge. Each
 *    is a stock flourish; together they read as generated rather than
 *    designed. The headline now carries the weight on its own.
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
          <Eyebrow>Fiscalità italiana, in ogni proiezione</Eyebrow>

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
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

      {/* Trust strip — closes the hero and hands off to the problem section.
          Below the fold on mobile, so revealing on scroll is safe here. */}
      <div className="relative border-y border-border bg-surface/50">
        <Reveal>
          <dl className="shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4">
            {TRUST.map(t => (
            <div key={t.label} className="flex flex-col gap-1">
              <dt className="order-2 text-xs text-fg-subtle">{t.label}</dt>
              <dd className="tnum order-1 m-0 text-h3 leading-none font-semibold tracking-tight text-fg">
                {t.value}
              </dd>
            </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
