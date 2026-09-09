import { Receipt, Layers, Ban, Gauge } from 'lucide-react';
import { SectionHeading } from './primitives';
import { Reveal } from './Reveal';

const PROBLEMS = [
  {
    icon: Receipt,
    title: 'Il lordo è ovunque, il netto quasi mai',
    body:
      'Le schede prodotto mostrano il rendimento dell indice. Capital gain al 26%, imposta di bollo annuale e inflazione restano fuori dal grafico, ma non dal tuo conto.',
  },
  {
    icon: Ban,
    title: 'Le minusvalenze non si compensano',
    body:
      'I guadagni da ETF sono redditi di capitale e non possono essere compensati con perdite pregresse. Lo "zainetto fiscale" resta pieno e inutilizzabile: pochi simulatori lo modellano.',
  },
  {
    icon: Layers,
    title: 'Due ETF, un solo portafoglio',
    body:
      'Un World e uno S&P 500 sembrano diversificazione. Nella pratica condividono gran parte delle prime posizioni: il rischio si concentra invece di distribuirsi.',
  },
  {
    icon: Gauge,
    title: 'Il TER non è il costo totale',
    body:
      'Alla commissione dichiarata si aggiungono tracking difference, domicilio del fondo e ritenute sui dividendi. Due ETF con lo stesso TER non costano lo stesso.',
  },
];

export function Problem() {
  return (
    <section id="problema" className="section-y scroll-mt-20 border-b border-border bg-surface-2/40">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          eyebrow="Il problema"
          title="Scegliere un ETF in Italia è un esercizio di dati mancanti"
          lead="Quattro ostacoli ricorrenti che separano il rendimento pubblicizzato da quello che resta davvero in tasca."
        />

        <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-8 p-0 md:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent shadow-xs"
              >
                <Icon size={19} strokeWidth={2} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-h3 text-fg">{title}</h3>
                <p className="text-pretty text-fg-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
