import { RefreshCw, FileCode2, Scale, ShieldCheck } from 'lucide-react';
import { TAX_RATE_STANDARD, TAX_RATE_GOV_BONDS, BOLLO_RATE } from '@/utils/tax';
import { SectionHeading, Panel } from './primitives';
import { Reveal } from './Reveal';
import { CATALOGUE } from './stats';


const pct = (n: number) => `${(n * 100).toFixed(n * 100 % 1 === 0 ? 0 : 1).replace('.', ',')}%`;

const METRICS = [
  { value: String(CATALOGUE.count), label: 'ETF nel catalogo', sub: `su ${CATALOGUE.exchanges.length} borse: ${CATALOGUE.exchanges.join(', ')}` },
  { value: String(CATALOGUE.assetClasses), label: 'classi di attivo', sub: 'azionario, obbligazionario, materie prime, immobiliare' },
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

        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {METRICS.map(m => (
            <div key={m.label} className="flex flex-col gap-2">
              <dt className="order-2 text-sm font-medium text-fg">{m.label}</dt>
              <dd className="tnum order-1 m-0 text-h3 leading-none font-semibold tracking-tight text-brand">
                {m.value}
              </dd>
              <dd className="order-3 m-0 text-xs text-pretty text-fg-subtle">{m.sub}</dd>
            </div>
            ))}
          </dl>
        </Reveal>

        <Reveal>
          <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
            {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex">
              <Panel className="flex w-full gap-4 bg-surface">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-positive-soft text-positive-soft-fg"
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight text-fg">{title}</h3>
                  <p className="text-sm text-pretty text-fg-muted">{body}</p>
                </div>
              </Panel>
            </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
