import { useParams, Link } from 'react-router-dom';
import type { ETF } from '../types/etf';
import etfsData from '../data/etfs.json';
import { Badge } from '../components/common/Badge';
import { HelpTooltip } from '../components/common/HelpTooltip';
import {
  formatPercent,
  formatAum,
  assetClassLabel,
  dividendPolicyLabel,
  replicationLabel,
  riskClassColor,
  assetClassColor,
} from '../utils/formatters';

const etfs = etfsData as unknown as ETF[];

function MetricBox({ label, value, highlight, help }: { label: string; value: string; highlight?: boolean; help?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
        {label}
        {help && <HelpTooltip content={help} />}
      </p>
      <p className={`text-lg font-bold ${highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

function WeightBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300 w-40 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

export default function EtfDetailPage() {
  const { isin } = useParams<{ isin: string }>();
  const etf = etfs.find(e => e.isin === isin);

  if (!etf) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">ETF non trovato</p>
        <Link to="/catalogue" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          ← Torna al catalogo
        </Link>
      </div>
    );
  }

  const riskColor = riskClassColor(etf.riskClass);
  const acColor = assetClassColor(etf.assetClass);

  const sortedSectors = etf.sectorWeights
    ? Object.entries(etf.sectorWeights).sort((a, b) => b[1] - a[1])
    : [];
  const sortedGeo = etf.geoWeights
    ? Object.entries(etf.geoWeights).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/catalogue" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
          ← Torna al catalogo
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{etf.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{etf.isin} · {etf.ticker}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Indice: {etf.index}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={riskColor}>SRI {etf.riskClass}/7</Badge>
              <HelpTooltip content="Indicatore sintetico di rischio e rendimento (SRRI/SRI) dal documento KID. Scala 1–7: 1–2 = rischio basso (es. fondi monetari), 3–4 = rischio medio (obbligazioni, bilanciati), 5–7 = rischio alto (azionario, materie prime). Non misura il rischio di perdita totale, ma è una stima della volatilità storica." />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <div className="flex items-center gap-1">
              <Badge variant={acColor}>{assetClassLabel(etf.assetClass)}</Badge>
              <HelpTooltip content="Classe di attivo: Azionario = azioni di società; Obbligazionario = titoli di debito; Materie prime = oro, petrolio ecc.; Immobiliare = fondi REIT. Classi diverse hanno rischio/rendimento attesi differenti." />
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="gray">
                {etf.dividendPolicy === 'acc' ? '♻️' : '💰'} {dividendPolicyLabel(etf.dividendPolicy)}
              </Badge>
              <HelpTooltip content="Accumulazione (Acc): i dividendi vengono reinvestiti automaticamente nell'ETF. Ideale per crescita a lungo termine e ottimizzazione fiscale. Distribuzione (Dist): i dividendi vengono pagati in contanti sul conto. Utile per chi vuole un reddito periodico." />
            </div>
            {etf.domicile === 'IE' && (
              <div className="flex items-center gap-1">
                <Badge variant="green">🇮🇪 tax-efficient</Badge>
                <HelpTooltip content="Gli ETF domiciliati in Irlanda (IE) beneficiano del trattato fiscale USA-Irlanda: la ritenuta sui dividendi azionari USA è del 15% anziché del 30%. Su un fondo con molte azioni USA questo si traduce in un vantaggio reale sul rendimento netto." />
              </div>
            )}
            {etf.hedged && (
              <div className="flex items-center gap-1">
                <Badge variant="blue">EUR hedged</Badge>
                <HelpTooltip content="La copertura valutaria (hedge) neutralizza il rischio di cambio tra la valuta degli asset (es. USD) e l'EUR. Riduce la volatilità da cambio ma ha un costo annuo (hedging cost) che può erodere il rendimento, specialmente quando i tassi d'interesse divergono." />
              </div>
            )}
            <div className="flex items-center gap-1">
              <Badge variant="gray">{etf.domicile}</Badge>
              <HelpTooltip content="Paese di domicilio del fondo. IE = Irlanda (il più comune, vantaggioso per trattati fiscali). LU = Lussemburgo. DE/FR = meno vantaggiosi per investitori italiani su dividendi USA." />
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="gray">{replicationLabel(etf.replicationMethod)}</Badge>
              <HelpTooltip content="Fisica completa: il fondo acquista tutte le azioni dell'indice (massima trasparenza). Campionamento: acquista un sottoinsieme rappresentativo, usato su indici molto ampi. Sintetica (swap): usa derivati per replicare l'indice, con potenziale rischio controparte ma a volte più efficiente fiscalmente." />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <MetricBox
              label="TER annuo"
              value={formatPercent(etf.ter)}
              help="Total Expense Ratio: costo annuo totale del fondo, prelevato automaticamente dal patrimonio. Include gestione, custodia, audit. Non include costi di transazione. Più basso = meglio. Un TER di 0.20% su €10.000 costa €20/anno."
            />
            <MetricBox
              label="AUM"
              value={formatAum(etf.aum)}
              help="Assets Under Management: patrimonio totale gestito dall'ETF. AUM elevato (>500M€) indica buona liquidità, spread denaro/lettera ridotti e minor rischio di chiusura del fondo. Fondi piccoli (<100M€) possono essere illiquidi o venire liquidati."
            />
            <MetricBox
              label="Valuta base"
              value={etf.currency}
              help="Valuta in cui sono denominati gli asset sottostanti (es. USD per azioni americane). Non è la valuta in cui compri l'ETF: quella è la valuta di trading. Il rischio di cambio dipende dalla valuta base, non da quella di trading."
            />
            <MetricBox
              label="Valuta trading"
              value={etf.tradingCurrency}
              help="Valuta in cui l'ETF è quotato e scambiato in borsa (quasi sempre EUR per ETF su Borsa Italiana). Puoi comprare un ETF in EUR anche se gli asset sottostanti sono in USD: il cambio avviene internamente al fondo."
            />
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Performance storica</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricBox label="CAGR 1 anno" value={formatPercent(etf.cagr1y)} highlight={(etf.cagr1y ?? 0) >= 0}
              help="Rendimento annuo composto nell'ultimo anno. Utile per il trend recente, ma troppo breve per valutare un ETF: un singolo anno può essere eccezionalmente buono o cattivo." />
            <MetricBox label="CAGR 3 anni" value={formatPercent(etf.cagr3y)} highlight={(etf.cagr3y ?? 0) >= 0}
              help="Rendimento annuo composto medio negli ultimi 3 anni. Più affidabile dell'1 anno: cattura un ciclo di mercato più completo ma può ancora riflettere una fase particolarmente positiva o negativa." />
            <MetricBox label="CAGR 5 anni" value={formatPercent(etf.cagr5y)} highlight={(etf.cagr5y ?? 0) >= 0}
              help="Rendimento annuo composto medio negli ultimi 5 anni. Il riferimento più usato per confrontare ETF: abbastanza lungo da smussare la volatilità, abbastanza recente da essere rilevante. Usato dal simulatore come stima del rendimento atteso." />
            <MetricBox label="CAGR 10 anni" value={formatPercent(etf.cagr10y)} highlight={(etf.cagr10y ?? 0) >= 0}
              help="Rendimento annuo composto medio negli ultimi 10 anni. Il più rappresentativo del potenziale a lungo termine, ma disponibile solo per ETF con storia sufficiente." />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricBox label="Volatilità annua" value={formatPercent(etf.volatility)}
              help="Deviazione standard annualizzata dei rendimenti. Misura quanto il valore oscilla: 15% di volatilità significa che il rendimento può variare di ±15% rispetto alla media in un anno tipico. Alta volatilità = più rischio ma anche più potenziale di guadagno." />
            <MetricBox label="Max Drawdown" value={formatPercent(etf.maxDrawdown)}
              help="Perdita massima dal picco al minimo successivo nella storia dell'ETF. Esempio: -50% significa che a un certo punto l'ETF ha perso metà del suo valore dal massimo precedente. È la misura di rischio più concreta: indica quanto avresti potuto perdere nel peggior momento." />
            <MetricBox label="Sharpe Ratio" value={etf.sharpeRatio != null ? etf.sharpeRatio.toFixed(2) : 'n/d'}
              help="Rendimento extra rispetto al tasso privo di rischio, diviso per la volatilità. Misura la qualità del rendimento: >1 è buono, >2 è eccellente. Permette di confrontare ETF con volatilità diverse: un ETF con Sharpe più alto rende di più per unità di rischio assunto." />
          </div>
          {etf.trackingDifference != null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
              Tracking difference: <span className="font-medium text-gray-700 dark:text-gray-300">{formatPercent(etf.trackingDifference, 2)}</span> annuo vs. indice
              <HelpTooltip content="Differenza tra il rendimento dell'ETF e quello dell'indice che replica. Diversa dal TER: include anche entrate da securities lending e inefficienze di replica. Un valore negativo (es. -0.05%) significa che l'ETF ha fatto meglio dell'indice, grazie al prestito titoli." />
            </p>
          )}
        </div>

        {/* Sector & Geo */}
        {(sortedSectors.length > 0 || sortedGeo.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {sortedSectors.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Composizione settoriale</h2>
                <div className="space-y-2.5">
                  {sortedSectors.map(([sector, weight]) => (
                    <WeightBar key={sector} label={sector} value={weight} />
                  ))}
                </div>
              </div>
            )}
            {sortedGeo.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Esposizione geografica</h2>
                <div className="space-y-2.5">
                  {sortedGeo.map(([country, weight]) => (
                    <WeightBar key={country} label={country} value={weight} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Holdings */}
        {etf.holdings && etf.holdings.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Principali posizioni</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 font-medium">Ticker</th>
                    <th className="pb-2 font-medium">Nome</th>
                    <th className="pb-2 font-medium text-right">Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {etf.holdings.map(h => (
                    <tr key={h.ticker} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <td className="py-2 font-mono text-gray-700 dark:text-gray-300">{h.ticker}</td>
                      <td className="py-2 text-gray-800 dark:text-gray-200">{h.name}</td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{h.weight.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scheda tecnica */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Scheda tecnica</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center">
                Data lancio
                <HelpTooltip content="Data di creazione dell'ETF. Fondi con storia più lunga permettono di valutare il comportamento in diversi cicli di mercato (crisi 2008, COVID 2020, ecc.). ETF giovani (<3 anni) hanno dati storici insufficienti per valutazioni affidabili." />
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{etf.inceptionDate}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center">
                Borsa
                <HelpTooltip content="Borsa su cui è quotato l'ETF. Borsa Italiana (Milano) è la più conveniente per investitori italiani: evita costi di cambio valuta e la maggior parte dei broker italiani ha commissioni più basse rispetto a Xetra o Euronext." />
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{etf.exchange}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center">
                Replica
                <HelpTooltip content="Fisica completa: compra tutti i titoli dell'indice (massima trasparenza, nessun rischio controparte). Campionamento: compra un sottoinsieme ottimizzato, usato su indici con migliaia di titoli. Sintetica: usa swap con una banca, può essere più efficiente ma introduce rischio controparte (limitato al 10% per legge UCITS)." />
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{replicationLabel(etf.replicationMethod)}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center">
                Domicilio
                <HelpTooltip content="Paese legale del fondo. IE (Irlanda) è preferibile per chi investe in ETF con esposizione USA: ritenuta dividendi USA al 15% vs 30% per fondi non-irlandesi. LU (Lussemburgo) è il secondo più comune. La scelta del domicilio impatta il rendimento netto reale." />
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{etf.domicile}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <dt className="text-gray-500 dark:text-gray-400 flex items-center">
                Copertura valutaria
                <HelpTooltip content="EUR hedged: il rischio di cambio tra la valuta degli asset (es. USD) e l'EUR viene neutralizzato tramite contratti forward. Utile in periodi di USD debole, ma ha un costo (tipicamente 0.3–1% annuo). Non coperto: il rendimento include l'oscillazione del cambio, storicamente positivo per investitori EUR su asset USD nel lungo periodo." />
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{etf.hedged ? 'EUR hedged' : 'Non coperto'}</dd>
            </div>
          </dl>
        </div>

        {/* KID Link */}
        {etf.kidUrl && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Documento KID (KIID)</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Key Information Document, richiesto dalla normativa UE</p>
            </div>
            <a
              href={etf.kidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apri KID →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
