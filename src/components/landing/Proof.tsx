import { RefreshCw, FileCode2, Scale, ShieldCheck } from 'lucide-react';
import { TAX_RATE_STANDARD, TAX_RATE_GOV_BONDS, BOLLO_RATE } from '@/utils/tax';
import { SectionHeading, Panel } from './primitives';
import { StaggerGroup, StaggerItem, CountUp, Spotlight } from '@/components/motion';
import { CATALOGUE } from './stats';


const pct = (n: number) => `${(n * 100).toFixed(n * 100 % 1 === 0 ? 0 : 1).replace('.', ',')}%`;

/* `count` opts a metric into the tweened count-up; the ratio and the decimal
   TER stay literal, because animating "12/95" or "0,07%" digit by digit turns a
   precise figure into a slot machine. */
const METRICS: Array<{ value: string; count?: number; label: string; sub: string }> = [
  { value: String(CATALOGUE.count), count: CATALOGUE.count, label: 'ETF nel catalogo', sub: `su ${CATALOGUE.exchanges.length} borse: ${CATALOGUE.exchanges.join(', ')}` },
  { value: String(CATALOGUE.assetClasses), count: CATALOGUE.assetClasses, label: 'classi di attivo', sub: 'azionario, obbligazionario, materie prime, immobiliare' },
  { value: `${CATALOGUE.ieDomiciled}/${CATALOGUE.count}`, label: 'domiciliati in Irlanda', sub: 'ritenuta ridotta sui dividendi USA' },
  { value: `${CATALOGUE.terMin}%`, label: 'TER più basso rilevato', sub: `fino a ${CATALOGUE.terMax}% sul più caro` },
];

const GUARANTEES = [
  {
    icon: RefreshCw,
    title: 'Metriche aggiornate ogni giorno',
    body:
      'Una GitHub Action interroga Yahoo Finance ogni mattina, riscrive il dataset e fa ripartire il deploy. Nessun numero inserito a mano.',
  },
  {
    icon: Scale,
    title: 'Regole fiscali dichiarate',
    body: `Capital gain ${pct(TAX_RATE_STANDARD)}, aliquota agevolata ${pct(TAX_RATE_GOV_BONDS)} sui titoli di Stato white list, bollo ${pct(BOLLO_RATE)} annuo. Le costanti stanno in un unico file, non sparse nei componenti.`,
  },
  {
    icon: FileCode2,
    title: 'Composizione verificabile',
    body: `${CATALOGUE.withHoldings} ETF riportano le posizioni sottostanti, il che rende sovrapposizione e look-through calcolabili invece che stimate. Dove il dato manca, la schermata lo dichiara.`,
  },
  {
    icon: ShieldCheck,
    title: 'Nessuna raccolta di dati',
    body:
      'Niente account, niente analytics di terze parti, niente portafogli salvati su un server. I parametri che inserisci restano nella sessione del browser.',
  },
];

/**
 * Section 5. Deliberately not testimonials: the project has no users to quote,
 * and inventing quotes would be fabricating reviews. The trust argument here is
 * provenance — where the numbers come from and what is verifiable — which is
 * also the more persuasive claim for a calculation tool.
 */
export function Proof() {
  return (
    <section id="dati" className="section-y scroll-mt-20 border-y border-border bg-surface-2/40">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          align="center"
          eyebrow="Su cosa si basano i numeri"
          title="Nessuna recensione, solo provenienza dei dati"
          lead="Uno strumento di calcolo si giudica dalle fonti e dalle regole che applica. Qui sono entrambe esposte."
        />

        <StaggerGroup as="dl" step={0.07} className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {METRICS.map(m => (
            <StaggerItem key={m.label} className="flex flex-col gap-2">
              <dt className="order-2 text-sm font-medium text-fg">{m.label}</dt>
              <dd className="tnum order-1 m-0 text-h3 leading-none font-semibold tracking-tight text-brand">
                {m.count != null ? <CountUp value={m.count} duration={1.1} /> : m.value}
              </dd>
              <dd className="order-3 m-0 text-xs text-pretty text-fg-subtle">{m.sub}</dd>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <StaggerGroup as="ul" className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <StaggerItem as="li" key={title} className="flex">
              <Spotlight className="group flex w-full rounded-2xl">
                <Panel hover className="flex w-full gap-4 bg-surface">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-positive-soft text-positive-soft-fg transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:-rotate-6"
                  >
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[0.9375rem] font-semibold tracking-tight text-fg">{title}</h3>
                    <p className="text-sm text-pretty text-fg-muted">{body}</p>
                  </div>
                </Panel>
              </Spotlight>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
