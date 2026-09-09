import { SectionHeading, CtaLink, CtaArrow } from './primitives';
import { CTA } from './cta';
import { StaggerGroup, StaggerItem } from '@/components/motion';

const STEPS = [
  {
    n: '01',
    title: 'Definisci il profilo',
    body:
      'Otto domande su età, orizzonte, obiettivo, tolleranza al rischio ed esperienza. Nessun dato identificativo.',
    href: CTA.profile.href,
    cta: CTA.profile.label,
  },
  {
    n: '02',
    title: 'Ottieni una ripartizione',
    body:
      'Il motore propone le percentuali fra le quattro classi di attivo, corrette per orizzonte ed età, e spiega da dove arriva ogni aggiustamento.',
  },
  {
    n: '03',
    title: 'Confronta gli strumenti',
    body:
      'Per ogni classe filtri il catalogo su TER, domicilio, politica dividendi e liquidità, con la scheda completa di ogni ETF a fianco.',
    href: CTA.catalogue.href,
    cta: CTA.catalogue.label,
  },
  {
    n: '04',
    title: 'Simula e verifica',
    body:
      'Proiezione lordo, netto e reale, fan chart Monte Carlo, sovrapposizione e correlazione fra gli strumenti scelti.',
    href: CTA.simulator.href,
    cta: CTA.simulator.label,
  },
];

export function Process() {
  return (
    <section id="come-funziona" className="section-y scroll-mt-20">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          eyebrow="Come funziona"
          title="Dal profilo alla proiezione in quattro passaggi"
          lead="Ogni passaggio è indipendente: puoi partire dal catalogo se sai già cosa cercare, o dal simulatore se hai già un portafoglio."
        />

        {/* Steps arrive left to right at 90ms apart, which traces the same path
            the connector rail draws — the sequence *is* the explanation. */}
        <StaggerGroup as="ol" step={0.09} className="grid list-none grid-cols-1 gap-x-8 gap-y-8 p-0 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <StaggerItem as="li" key={s.n} className="group/step relative flex flex-col gap-3">
              {/* Connector rail: drawn only between steps, desktop only. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-4 left-[calc(2rem+0.75rem)] hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-border-strong to-transparent transition-colors duration-500 group-hover/step:from-brand lg:block"
                />
              )}
              <span className="tnum inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs font-semibold text-brand shadow-xs transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-spring)] group-hover/step:-translate-y-0.5 group-hover/step:scale-110 group-hover/step:border-brand group-hover/step:bg-brand group-hover/step:text-brand-fg group-hover/step:shadow-md">
                {s.n}
              </span>
              <h3 className="text-h3 text-fg transition-colors duration-200 group-hover/step:text-brand">
                {s.title}
              </h3>
              <p className="text-sm text-pretty text-fg-muted">{s.body}</p>
              {s.href && s.cta && (
                <CtaLink href={s.href} variant="ghost" className="-ml-3 self-start px-3 text-sm">
                  {s.cta}
                  <CtaArrow size={14} />
                </CtaLink>
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
