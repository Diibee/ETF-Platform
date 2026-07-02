// Aggiornamento automatico delle metriche di performance degli ETF.
//
// Scarica lo storico prezzi (adjusted close, corretto per dividendi -> valido sia
// per ETF ad accumulazione che a distribuzione) da Yahoo Finance e ricalcola:
//   cagr1y, cagr3y, cagr5y, cagr10y, volatility, maxDrawdown, sharpeRatio
//
// Strategia "merge, non replace": vengono sovrascritte SOLO le metriche calcolabili
// dai prezzi. Tutti gli altri campi (ter, aum, holdings, sectorWeights, geoWeights,
// nome, ecc.) restano quelli curati a mano in etfs.json. Se un simbolo Yahoo fallisce
// o restituisce pochi dati, l'ETF viene saltato e mantiene i valori esistenti.
//
// Nota sui limiti: il rendimento è espresso nella valuta della quotazione mappata in
// yahoo-symbols.json (di norma EUR per i listati .MI). Yahoo non fornisce in modo
// affidabile TER/AUM/holdings per gli ETF europei: quei campi restano manuali.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'etfs.json');
const SYMBOLS_PATH = path.join(__dirname, 'yahoo-symbols.json');

const RISK_FREE_PCT = 2.0;      // tasso privo di rischio per lo Sharpe
const TRADING_DAYS = 252;       // giorni di borsa per anno (annualizzazione volatilità)
const MIN_POINTS = 200;         // punti minimi per calcolare volatilità/Sharpe
const YEARS_HISTORY = 10.5;     // quanto storico scaricare

const round = (n, d = 1) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

// Prezzo (adjclose) più vicino a `years` anni fa rispetto all'ultima data disponibile.
function priceYearsAgo(quotes, years) {
  const last = quotes[quotes.length - 1];
  const target = new Date(last.date);
  target.setFullYear(target.getFullYear() - Math.floor(years));
  // primo punto con data >= target
  const hit = quotes.find(q => q.date >= target);
  // se il primo dato disponibile è già dopo il target, non abbiamo abbastanza storico
  if (!hit || quotes[0].date > target) return null;
  return hit.adjclose;
}

function cagrPct(startPrice, endPrice, years) {
  if (startPrice == null || startPrice <= 0) return null;
  return round((Math.pow(endPrice / startPrice, 1 / years) - 1) * 100, 1);
}

function computeMetrics(quotes) {
  if (quotes.length < MIN_POINTS) return null;

  const first = quotes[0];
  const last = quotes[quotes.length - 1];
  const totalYears = (last.date - first.date) / (365.25 * 24 * 3600 * 1000);

  // CAGR sui vari orizzonti (null se storico insufficiente)
  const cagr1y = cagrPct(priceYearsAgo(quotes, 1), last.adjclose, 1);
  const cagr3y = cagrPct(priceYearsAgo(quotes, 3), last.adjclose, 3);
  const cagr5y = cagrPct(priceYearsAgo(quotes, 5), last.adjclose, 5);
  const cagr10y = cagrPct(priceYearsAgo(quotes, 10), last.adjclose, 10);

  // Volatilità: dev. std dei log-rendimenti giornalieri, annualizzata
  const logRets = [];
  for (let i = 1; i < quotes.length; i++) {
    const p0 = quotes[i - 1].adjclose;
    const p1 = quotes[i].adjclose;
    if (p0 > 0 && p1 > 0) logRets.push(Math.log(p1 / p0));
  }
  const mean = logRets.reduce((s, r) => s + r, 0) / logRets.length;
  const variance = logRets.reduce((s, r) => s + (r - mean) ** 2, 0) / (logRets.length - 1);
  const volatility = round(Math.sqrt(variance) * Math.sqrt(TRADING_DAYS) * 100, 1);

  // Max drawdown: peggior calo da un massimo precedente
  let peak = quotes[0].adjclose;
  let maxDD = 0;
  for (const q of quotes) {
    if (q.adjclose > peak) peak = q.adjclose;
    const dd = q.adjclose / peak - 1;
    if (dd < maxDD) maxDD = dd;
  }
  const maxDrawdown = round(maxDD * 100, 1);

  // Sharpe: (rendimento annualizzato full-period - risk free) / volatilità
  const fullCagr = cagrPct(first.adjclose, last.adjclose, totalYears);
  const sharpeRatio =
    fullCagr != null && volatility > 0 ? round((fullCagr - RISK_FREE_PCT) / volatility, 2) : null;

  return { cagr1y, cagr3y, cagr5y, cagr10y, volatility, maxDrawdown, sharpeRatio };
}

async function fetchQuotes(symbol) {
  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - Math.ceil(YEARS_HISTORY));
  const res = await yahooFinance.chart(symbol, { period1, interval: '1d' });
  return (res.quotes ?? [])
    .filter(q => q.adjclose != null && q.date != null)
    .map(q => ({ date: new Date(q.date), adjclose: q.adjclose }))
    .sort((a, b) => a.date - b.date);
}

async function main() {
  const [rawData, rawSymbols] = await Promise.all([
    fs.readFile(DATA_PATH, 'utf8'),
    fs.readFile(SYMBOLS_PATH, 'utf8'),
  ]);
  const etfs = JSON.parse(rawData);
  const symbols = JSON.parse(rawSymbols);

  let updated = 0;
  const skipped = [];

  for (const etf of etfs) {
    const symbol = symbols[etf.isin];
    if (!symbol || symbol.startsWith('_')) {
      skipped.push(`${etf.ticker} (nessun simbolo)`);
      continue;
    }
    try {
      const quotes = await fetchQuotes(symbol);
      const metrics = computeMetrics(quotes);
      if (!metrics) {
        skipped.push(`${etf.ticker} (${symbol}: dati insufficienti, ${quotes.length} punti)`);
        continue;
      }
      // Merge: sovrascrivi solo i campi calcolati e non-null
      for (const [key, value] of Object.entries(metrics)) {
        if (value != null) etf[key] = value;
      }
      updated++;
      console.log(
        `✓ ${etf.ticker.padEnd(6)} ${symbol.padEnd(9)} ` +
        `1y=${metrics.cagr1y ?? 'n/d'} 5y=${metrics.cagr5y ?? 'n/d'} ` +
        `vol=${metrics.volatility} DD=${metrics.maxDrawdown} Sharpe=${metrics.sharpeRatio ?? 'n/d'}`,
      );
    } catch (err) {
      skipped.push(`${etf.ticker} (${symbol}: ${err.message})`);
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(etfs, null, 2) + '\n', 'utf8');

  console.log(`\nAggiornati ${updated}/${etfs.length} ETF.`);
  if (skipped.length) {
    console.log('Saltati (mantengono i valori esistenti):');
    for (const s of skipped) console.log(`  - ${s}`);
  }
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
