import { RefreshCw, FileCode2, Scale, ShieldCheck } from 'lucide-react';
import type { ETF } from '@/types/etf';
import etfsData from '@/data/etfs.json';
import { TAX_RATE_STANDARD, TAX_RATE_GOV_BONDS, BOLLO_RATE } from '@/utils/tax';
import { SectionHeading, Panel } from './primitives';
import { Reveal } from './Reveal';

const etfs = etfsData as unknown as ETF[];

/* Derived from the dataset at build time, so these figures can never drift
   away from what the catalogue actually contains. */
const TOTAL = etfs.length;
const IE_DOMICILED = etfs.filter(e => e.domicile === 'IE').length;
const WITH_HOLDINGS = etfs.filter(e => e.holdings && e.holdings.length > 0).length;
const ASSET_CLASSES = new Set(etfs.map(e => e.assetClass)).size;
const TERS = etfs.map(e => e.ter).sort((a, b) => a - b);
const EXCHANGES = [...new Set(etfs.map(e => e.exchange))];

const pct = (n: number) => `${(n * 100).toFixed(n * 100 % 1 === 0 ? 0 : 1).replace('.', ',')}%`;

const METRICS = [
  { value: String(TOTAL), label: 'ETF nel catalogo', sub: `su ${EXCHANGES.length} borse: ${EXCHANGES.join(', ')}` },
  { value: String(ASSET_CLASSES), label: 'classi di attivo', sub: 'azionario, obbligazionario, materie prime, immobiliare' },
  { value: `${IE_DOMICILED}/${TOTAL}`, label: 'domiciliati in Irlanda', sub: 'ritenuta ridotta sui dividendi USA' },
  { value: `${TERS[0].toString().replace('.', ',')}%`, label: 'TER più basso rilevato', sub: `fino a ${TERS[TERS.length - 1].toString().replace('.', ',')}% sul più caro` },
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
    body: `${WITH_HOLDINGS} ETF riportano le posizioni sottostanti, il che rende sovrapposizione e look-through calcolabili invece che stimate. Dove il dato manca, la schermata lo dichiara.`,
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
          eyebrow="Su cosa si basano i numeri"
          title="Nessuna recensione, solo provenienza dei dati"
          lead="Uno strumento di calcolo si giudica dalle fonti e dalle regole che applica. Qui sono entrambe esposte."
        />

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i} className="flex flex-col gap-1.5">
              <dt className="order-2 text-sm font-medium text-fg">{m.label}</dt>
              <dd className="tnum order-1 m-0 text-h2 leading-none font-semibold tracking-tight text-brand">
                {m.value}
              </dd>
              <dd className="order-3 m-0 text-xs text-pretty text-fg-subtle">{m.sub}</dd>
            </Reveal>
          ))}
        </dl>

        <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {GUARANTEES.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i % 2} className="flex">
              <Panel className="flex w-full gap-4 bg-surface">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-positive-soft text-positive-soft-fg"
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight text-fg">{title}</h3>
                  <p className="text-sm text-pretty text-fg-muted">{body}</p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
