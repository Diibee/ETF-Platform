import { Check, Circle } from 'lucide-react';
import { SectionHeading, CtaLink, Panel } from './primitives';
import { Reveal } from './Reveal';
import { CTA, CTA_REASSURANCE } from './cta';
import { ReturnDisclaimer } from '@/components/common/ReturnDisclaimer';
import { FriendsDisclaimer } from '@/components/common/FriendsDisclaimer';

const INCLUDED = [
  'Catalogo completo di 30 ETF con schede dettagliate',
  'Simulatore interesse composto lordo, netto e reale',
  'Fan chart Monte Carlo su 1.000 simulazioni',
  'Modello fiscale italiano: capital gain, bollo, mancata compensazione',
  'Sovrapposizione, correlazione e look-through di portafoglio',
  'Questionario di profilazione e ripartizione suggerita',
  'Nessuna registrazione e nessun dato personale raccolto',
];

const ROADMAP = [
  'Backtest su serie storiche',
  'Simulazione di ribilanciamento',
  'Zainetto fiscale su più anni',
  'Ingestione automatica dei KID di emittente',
];

export function Offer() {
  return (
    <section id="accesso" className="section-y scroll-mt-20 border-y border-border bg-surface-2/40">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          align="center"
          eyebrow="Accesso"
          title="Tutto incluso, senza costi"
          lead="ETF Lab nasce come strumento personale di analisi. Non c’è un piano a pagamento, non c’è un funnel: quello che vedi è tutto quello che c’è."
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="flex">
            <Panel className="flex w-full flex-col gap-6 border-brand/35 p-6 shadow-md">
              <div className="flex flex-col gap-2">
                <span className="w-fit rounded-full bg-brand px-3 py-1 text-[0.6875rem] font-semibold tracking-wide text-brand-fg uppercase">
                  Disponibile ora
                </span>
                <h3 className="text-h3 text-fg">Accesso completo</h3>
                <p className="flex items-baseline gap-2">
                  <span className="text-display leading-none text-fg">€0</span>
                  <span className="text-sm text-fg-subtle">per sempre</span>
                </p>
              </div>

              <ul className="flex list-none flex-col gap-3 p-0">
                {INCLUDED.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
                    <Check size={17} strokeWidth={2.5} aria-hidden="true" className="mt-0.5 shrink-0 text-positive" />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row">
                <CtaLink href={CTA.simulator.href} className="w-full sm:w-auto">
                  {CTA.simulator.label}
                </CtaLink>
                <CtaLink href={CTA.profile.href} variant="secondary" className="w-full sm:w-auto">
                  {CTA.profile.label}
                </CtaLink>
              </div>
              <p className="text-xs text-fg-subtle">{CTA_REASSURANCE}</p>
            </Panel>
          </Reveal>

          <Reveal delay={1} className="flex">
            <Panel className="flex w-full flex-col gap-6 bg-surface/60">
              <div className="flex flex-col gap-1">
                <h3 className="text-h3 text-fg">In arrivo</h3>
                <p className="text-sm text-fg-subtle">
                  Sul percorso di sviluppo, non ancora disponibile.
                </p>
              </div>

              <ul className="flex list-none flex-col gap-3 p-0">
                {ROADMAP.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-fg-subtle">
                    <Circle size={15} strokeWidth={2} aria-hidden="true" className="mt-1 shrink-0 opacity-50" />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        </div>

        <Reveal delay={2} className="flex flex-col gap-3">
          <FriendsDisclaimer />
          <ReturnDisclaimer />
        </Reveal>
      </div>
    </section>
  );
}
