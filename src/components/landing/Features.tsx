import { Table2, TrendingUp, Waves, Landmark, GitCompareArrows, UserCog } from 'lucide-react';
import { SectionHeading, Panel } from './primitives';
import { StaggerGroup, StaggerItem, Spotlight } from '@/components/motion';
import { CATALOGUE, MONTE_CARLO_RUNS_LABEL } from './stats';

const FEATURES = [
  {
    icon: Table2,
    title: 'Catalogo filtrabile',
    body: `${CATALOGUE.count} ETF acquistabili su ${CATALOGUE.exchanges.join(', ')}, filtrabili per classe di attivo, TER, domicilio, politica dividendi e classe di rischio SRI.`,
    meta: `${CATALOGUE.count} strumenti · TER da ${CATALOGUE.terMin}% a ${CATALOGUE.terMax}%`,
  },
  {
    icon: TrendingUp,
    title: 'Simulatore lordo, netto e reale',
    body:
      'Interesse composto con versamenti periodici e tre curve sempre affiancate: valore lordo, netto dopo imposte e reale al netto dell’inflazione.',
    meta: 'Anno per anno, fino a 40 anni',
  },
  {
    icon: Waves,
    title: 'Monte Carlo',
    body:
      `${MONTE_CARLO_RUNS_LABEL} simulazioni su distribuzione log-normale restituiscono lo scenario sfortunato, mediano e fortunato invece di un singolo numero rassicurante.`,
    meta: 'Percentili p10 · p50 · p90',
  },
  {
    icon: Landmark,
    title: 'Fiscalità italiana modellata',
    body:
      'Capital gain al 26%, aliquota agevolata al 12,5% sui titoli di Stato white list, imposta di bollo annuale allo 0,2% e mancata compensazione delle minusvalenze.',
    meta: 'Regime amministrato e dichiarativo',
  },
  {
    icon: GitCompareArrows,
    title: 'Analisi di portafoglio',
    body:
      'Sovrapposizione fra ETF, matrice di correlazione e tabella look-through delle posizioni sottostanti, con avviso quando due strumenti diventano ridondanti.',
    meta: 'Alert oltre correlazione 0,85',
  },
  {
    icon: UserCog,
    title: 'Profilo investitore',
    body:
      'Otto domande su orizzonte, obiettivo e tolleranza al rischio producono una ripartizione fra le quattro classi di attivo, con il ragionamento sempre esplicito.',
    meta: 'Allocazione motivata, non prescritta',
  },
];

export function Features() {
  return (
    <section id="funzioni" className="section-y scroll-mt-20">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          eyebrow="Funzioni"
          title="Sei strumenti, un unico modello di calcolo"
          lead="Ogni funzione lavora sugli stessi dati e sulle stesse regole fiscali, così i numeri non cambiano passando da una schermata all’altra."
        />

        <StaggerGroup as="ul" className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, meta }) => (
            <StaggerItem as="li" key={title} className="flex">
              {/* The radius is repeated on the Spotlight wrapper because its
                  glow pseudo-element inherits `border-radius` — without it the
                  gradient would square off the card's rounded corners. */}
              <Spotlight className="group flex w-full rounded-2xl">
                <Panel hover className="flex w-full flex-col gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-fg transition-[transform,background-color,color] duration-300 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:bg-brand group-hover:text-brand-fg"
                  >
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="text-h3 text-fg transition-colors duration-200 group-hover:text-brand">
                      {title}
                    </h3>
                    <p className="text-sm text-pretty text-fg-muted">{body}</p>
                  </div>
                  <p className="mt-auto border-t border-border pt-3 font-mono text-[0.6875rem] text-fg-subtle transition-colors duration-300 group-hover:border-brand/30 group-hover:text-fg-muted">
                    {meta}
                  </p>
                </Panel>
              </Spotlight>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
