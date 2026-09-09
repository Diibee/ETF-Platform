import { SectionHeading } from './primitives';
import { StaggerGroup, StaggerItem } from '@/components/motion';

const FAQS = [
  {
    q: 'ETF Lab è un servizio di consulenza finanziaria?',
    a: 'No. È uno strumento educativo di analisi personale. Non raccoglie profili per conto terzi, non colloca prodotti e non fornisce raccomandazioni personalizzate ai sensi della MiFID II. Le ripartizioni proposte dal questionario sono il risultato di regole dichiarate, non un consiglio di investimento.',
  },
  {
    q: 'Da dove arrivano i dati sugli ETF?',
    a: 'Le metriche di performance e rischio sono raccolte da Yahoo Finance tramite uno script automatico che gira ogni mattina e riscrive il dataset del progetto. Le caratteristiche strutturali — ISIN, domicilio, TER, politica dividendi, classe di rischio SRI — provengono dalla documentazione degli emittenti.',
  },
  {
    q: 'Perché il rendimento netto è così più basso del lordo?',
    a: 'Perché somma tre effetti che le schede prodotto tengono separati: il capital gain al 26% sulla plusvalenza, l’imposta di bollo dello 0,2% annuo calcolata sul valore del portafoglio, e il fatto che i guadagni da ETF non possono essere compensati con minusvalenze pregresse. Su orizzonti lunghi il bollo pesa più di quanto si aspetti, perché si applica ogni anno sull’intero controvalore.',
  },
  {
    q: 'Che cos’è lo zainetto fiscale?',
    a: 'È il credito di minusvalenze accumulato con operazioni in perdita, utilizzabile per quattro anni. Il punto critico è che i guadagni da ETF sono classificati come redditi di capitale, mentre le minusvalenze sono redditi diversi: le due categorie non si compensano. Lo zainetto resta quindi inutilizzato, e il simulatore applica l’imposta piena su ogni guadagno.',
  },
  {
    q: 'Le proiezioni Monte Carlo sono previsioni?',
    a: 'No. Sono la distribuzione di mille percorsi generati da rendimento medio e volatilità storici del portafoglio, su distribuzione log-normale. Servono a mostrare quanto sia ampio il ventaglio dei risultati possibili, non a indicare quale si verificherà. Lo scenario p10 è tanto plausibile quanto il p90.',
  },
  {
    q: 'Perché il domicilio irlandese conta?',
    a: 'Un ETF domiciliato in Irlanda beneficia del trattato fiscale fra Irlanda e Stati Uniti, che riduce la ritenuta alla fonte sui dividendi azionari statunitensi dal 30% al 15%. Su un fondo a esposizione globale la differenza si riflette direttamente sul rendimento composto nel lungo periodo.',
  },
  {
    q: 'I miei dati vengono salvati?',
    a: 'No. Non esiste registrazione, non ci sono account e i parametri che inserisci vivono nella memoria della pagina finché resta aperta. Il progetto non usa analytics di terze parti e non trasmette i portafogli a nessun server.',
  },
];

/**
 * Native <details>/<summary> accordion: keyboard-operable, screen-reader
 * friendly and searchable by the browser's own find-in-page, with zero
 * JavaScript. A custom disclosure widget here would be strictly worse.
 *
 * The open/close height is animated in CSS via `::details-content` and
 * `interpolate-size` (see the interaction layer in `index.css`), which is the
 * only way to get an eased accordion without giving up the native element.
 * Browsers that don't support it snap open exactly as before.
 */
export function Faq() {
  return (
    <section id="faq" className="section-y scroll-mt-20">
      <div className="shell flex flex-col gap-[var(--section-gap)]">
        <SectionHeading
          eyebrow="Domande frequenti"
          title="Le obiezioni, per iscritto"
          lead="Su cosa fa lo strumento, da dove prende i dati e — soprattutto — cosa non è."
        />

        <StaggerGroup step={0.045} className="measure mx-auto w-full">
          {FAQS.map(f => (
            <StaggerItem key={f.q} y={10}>
              <details className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg py-5 text-left transition-colors duration-200 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[1.0625rem] font-semibold tracking-tight text-fg transition-[color,transform] duration-200 ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 group-hover:text-brand">
                    {f.q}
                  </h3>
                  {/* A plus that rotates into a cross: one glyph, two states,
                      and the rotation direction reads as opening rather than
                      as a chevron flipping. */}
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-fg-subtle transition-[transform,color] duration-300 ease-[var(--ease-out-quart)] group-hover:text-brand group-open:rotate-135"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-5 text-pretty text-fg-muted">{f.a}</p>
              </details>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
