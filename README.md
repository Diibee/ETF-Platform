# ETF Lab

Strumento educativo per analizzare, confrontare e simulare ETF e fondi indice
acquistabili in Italia, con la fiscalità italiana applicata a ogni proiezione.

> **Non è consulenza finanziaria.** Progetto personale a scopo educativo. Non
> costituisce raccomandazione di investimento né sollecitazione all'acquisto o
> alla vendita di strumenti finanziari. Verifica sempre aliquote e
> caratteristiche dei prodotti sulla documentazione ufficiale dell'emittente.

## Cosa fa

- **Catalogo** — 30 ETF su Borsa Italiana e Xetra, filtrabili per classe di
  attivo, TER, domicilio, politica dividendi e classe di rischio SRI.
- **Simulatore** — interesse composto con tre curve sempre affiancate: lordo,
  netto (capital gain 26% + bollo 0,2% annuo) e reale al netto dell'inflazione.
- **Monte Carlo** — 1.000 simulazioni su distribuzione log-normale, con
  percentili p10 / p50 / p90. Il generatore è seeded: gli stessi input
  producono sempre la stessa proiezione.
- **Analisi di portafoglio** — sovrapposizione fra ETF, matrice di
  correlazione, tabella look-through delle posizioni sottostanti.
- **Profilazione** — questionario che propone una ripartizione fra le quattro
  classi di attivo, con il ragionamento esplicito.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Recharts · Motion · `next/font`

Tutte le pagine sono generate staticamente al build, comprese le 30 schede ETF
(`generateStaticParams`). Non serve un runtime server.

## Sviluppo

```bash
npm install
```

```bash
npm run dev
```

| Script | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo su `localhost:3000` |
| `npm run build` | Build di produzione |
| `npm run start` | Serve la build di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run update-data` | Aggiorna le metriche ETF da Yahoo Finance |

## Struttura

```
app/          Route, layout e metadata (App Router)
src/views/    Componenti a livello di pagina renderizzati dalle route
src/components/
  landing/    Sezioni della landing page + primitiva <Reveal>
  catalogue/  Lista, filtri, schede ETF
  simulator/  Form, grafici, analisi di portafoglio
  questionnaire/
  common/     Badge, disclaimer, navbar, tooltip
src/utils/    Logica pura: compound, montecarlo, tax, overlap, correlation
src/data/     etfs.json — dataset statico
src/index.css Design token (layer dashboard + layer landing)
```

`src/views/` e non `src/pages/`: Next.js interpreta una cartella `src/pages/`
come Pages Router legacy e rifiuta il build.

## Dati

`src/data/etfs.json` è il dataset. Una GitHub Action
(`.github/workflows/update-etf-data.yml`) esegue `scripts/update-etf-data.mjs`
ogni mattina alle 06:00 UTC, aggiorna le metriche da Yahoo Finance e committa
il file: il push fa scattare il redeploy su Vercel.

Le caratteristiche strutturali (ISIN, domicilio, TER, politica dividendi,
classe SRI) sono inserite a mano dalla documentazione degli emittenti; solo
performance e rischio sono automatizzate.

## Deploy

Vercel. `vercel.json` fissa `framework: nextjs`; ogni push su `main` fa
partire un deploy.

## Convenzioni

Le regole di progetto (design token, fiscalità, ordine degli MVP, vincoli
dell'App Router) stanno in [`CLAUDE.md`](./CLAUDE.md).
