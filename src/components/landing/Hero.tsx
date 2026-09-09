import { CtaLink } from './primitives';
import { Reveal } from './Reveal';
import { HeroChart } from './HeroChart';

const TRUST = [
  { value: '30', label: 'ETF nel catalogo' },
  { value: '4', label: 'classi di attivo' },
  { value: '1.000', label: 'simulazioni Monte Carlo' },
  { value: '26% + 0,2%', label: 'capital gain e bollo' },
];

/**
 * Hero.
 *
 * Deliberately NOT wrapped in scroll reveals. Everything here is above the
 * fold, so an entrance animation starting at `opacity: 0` would hold back the
 * Largest Contentful Paint until it finished — measured at +862ms of element
 * render delay, which alone dropped mobile performance below 90. Above-the-fold
 * content paints immediately; the reveals begin with the section below.
 */
export function Hero() {
  return (
    <section className="halo relative overflow-hidden">
      {/* Decorative dotted grid; masked so it fades before the content edge. */}
      <div
        aria-hidden="true"
        className="bg-dotgrid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />

      <div className="shell relative grid items-center gap-x-12 gap-y-12 pt-14 pb-[var(--section-y)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pr-3.5 pl-2 text-xs font-medium text-fg-muted">
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-soft-fg">
              Fiscalità italiana
            </span>
            Lordo e netto, sempre affiancati
          </p>

          <h1 className="text-display text-balance text-fg">
            Il rendimento che leggi non è{' '}
            <span className="text-gradient">quello che incassi</span>.
          </h1>

          <p className="measure text-lead text-pretty text-fg-muted">
            ETF Lab analizza, confronta e simula ETF acquistabili in Italia calcolando
            capital gain, imposta di bollo e inflazione. Nessuna promessa: solo la
            proiezione al netto di quello che lo Stato trattiene davvero.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink href="/simulator">
              Simula il tuo portafoglio
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </CtaLink>
            <CtaLink href="/catalogue" variant="secondary">
              Esplora i 30 ETF
            </CtaLink>
          </div>

          <p className="text-sm text-fg-subtle">
            Gratuito · nessuna registrazione · nessun dato personale raccolto
          </p>
        </div>

        <div className="min-w-0">
          <HeroChart />
        </div>
      </div>

      {/* Trust strip — closes the hero and hands off to the problem section.
          Below the fold on mobile, so revealing on scroll is safe here. */}
      <div className="relative border-y border-border bg-surface/50">
        <dl className="shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4">
          {TRUST.map((t, i) => (
            <Reveal key={t.label} delay={i} className="flex flex-col gap-1">
              <dt className="order-2 text-xs text-fg-subtle">{t.label}</dt>
              <dd className="tnum order-1 m-0 text-h3 leading-none font-semibold tracking-tight text-fg">
                {t.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
