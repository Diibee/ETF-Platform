import { SectionHeading, CtaLink } from './primitives';
import { Reveal } from './Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Definisci il profilo',
    body:
      'Otto domande su età, orizzonte, obiettivo, tolleranza al rischio ed esperienza. Nessun dato identificativo.',
    href: '/questionnaire',
    cta: 'Compila il profilo',
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
    href: '/catalogue',
    cta: 'Apri il catalogo',
  },
  {
    n: '04',
    title: 'Simula e verifica',
    body:
      'Proiezione lordo, netto e reale, fan chart Monte Carlo, sovrapposizione e correlazione fra gli strumenti scelti.',
    href: '/simulator',
    cta: 'Apri il simulatore',
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

        <ol className="grid list-none grid-cols-1 gap-x-8 gap-y-10 p-0 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i} className="relative flex flex-col gap-3">
              {/* Connector rail: drawn only between steps, desktop only. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-4 left-[calc(2rem+0.75rem)] hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-border-strong to-transparent lg:block"
                />
              )}
              <span className="tnum inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs font-semibold text-brand shadow-xs">
                {s.n}
              </span>
              <h3 className="text-h3 text-fg">{s.title}</h3>
              <p className="text-sm text-pretty text-fg-muted">{s.body}</p>
              {s.href && s.cta && (
                <CtaLink href={s.href} variant="ghost" className="-ml-3 self-start px-3 text-sm">
                  {s.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </CtaLink>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
