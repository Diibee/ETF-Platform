// Automatic justETF data scraper
// Fetches ETF profile pages from justETF.com and extracts fundamental data
// Updates src/data/etfs.json with the scraped information
//
// Run: node scripts/scrape-etf-data.cjs
//
// NOTE: Web scraping of justETF should respect their terms of service.
// This script fetches public profile pages and is intended for personal/educational use.

const fs = require('node:fs/promises');
const path = require('node:path');
const axios = require('axios');
const cheerio = require('cheerio');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'etfs.json');

// TER regex - matches "TER 0.20%", "0.20% p.a.", etc.
const TER_REGEX = /[Tt][Ee][Rr][\s]*:?[\s]*([\d.,]+)%/i;

// General percentage regex
const PERCENT_REGEX = /([\d.,]+)%/g;

// Number formatter - handles "0.20", "0,07", "102811"
function parseNumber(str) {
  if (str == null) return null;
  const s = String(str).trim();
  // Handle European decimal "0,07"
  if (s.match(/^\d+,\d+$/)) {
    const [int, dec] = s.split(',');
    return parseFloat(`${int}.${dec}`);
  }
  // Handle thousands separators - just remove non-digits except dot
  return parseFloat(s.replace(/[^\d.-]/g, ''));
}

// Parse percentage like "0.20%" or "0,07% p.a."
function parsePercentage(str) {
  if (str == null) return null;
  const s = String(str).trim();
  // Keep only digits, dots, commas, and % sign
  const cleaned = s.replace(/[^\d.,%]/g, '');
  if (!cleaned.includes('%')) return null;
  const numStr = cleaned.replace('%', '');
  // Replace comma with dot for European decimal format
  const num = parseFloat(numStr.replace(',', '.'));
  return isNaN(num) ? null : num;
}

async function fetchEtfProfile(isin, useItaly = false) {
  const baseUrl = useItaly
    ? 'https://www.justetf.com/it/etf-profile.html'
    : 'https://www.justetf.com/en/etf-profile.html';
  const url = `${baseUrl}?isin=${encodeURIComponent(isin)}`;

  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const $ = cheerio.load(html, { normalizeWhitespace: true });
    const pageText = cheerio.load(html).text();

    const result = { isin };

    // --- Extract TER ---
    let terValue = null;
    let terMatch = pageText.match(TER_REGEX);
    if (!terMatch) {
      // Try extracting after "TER" label in HTML
      const terLabel = cheerio.load(html).text()
        .split('\n')
        .find((line) => line.toLowerCase().includes('ter'));
      if (terLabel) {
        const percentMatch = PERCENT_REGEX.exec(terLabel);
        if (percentMatch) {
          terValue = parsePercentage(percentMatch[0]);
        }
      }
    }
    if (terMatch && terMatch[1]) {
      terValue = parsePercentage(terMatch[0]);
    }
    if (terValue !== null) result.ter = terValue;

    // --- Extract fund size / AUM ---
    result.aum = null;
    const aumMatch = pageText.match(/[Ff]und[^a-z]*size[^a-z]*([\d.,]+)/i);
    if (aumMatch) result.aum = parseNumber(aumMatch[1]);
    if (!result.aum) {
      const aumMatch2 = pageText.match(/AUM[^a-z]*([\d.,]+)/i);
      if (aumMatch2) result.aum = parseNumber(aumMatch2[1]);
    }

    // --- Extract distribution policy ---
    result.distributionPolicy = null;
    const lower = pageText.toLowerCase();
    if (lower.includes('accumulating')) result.distributionPolicy = 'acc';
    else if (lower.includes('distributing')) result.distributionPolicy = 'dist';

    // --- Extract replication method ---
    result.replicationMethod = null;
    if (lower.includes('physical full') || lower.includes('physical (optimized)'))
      result.replicationMethod = 'full_physical';
    else if (lower.includes('sampling')) result.replicationMethod = 'sampling';
    else if (lower.includes('synthetic')) result.replicationMethod = 'synthetic';

    // --- Extract inception date ---
    result.inceptionDate = null;
    const dateMatch = pageText.match(/(\d{1,2}[\s.\-/]\w+[\s.\-/]\d{2,4})/i);
    if (dateMatch) result.inceptionDate = dateMatch[1].trim();

    // --- Extract fund currency ---
    result.currency = null;
    const currencyMatch = pageText.match(/[Ff]und[^a-z]*currency[^a-z]*([A-Z]{3})/i);
    if (currencyMatch) result.currency = currencyMatch[1];

    // --- Extract volatility ---
    result.volatility = null;
    const volMatch = pageText.match(/[Vv]olatilit[^a-z]*1?y[^a-z]*([\d.,]+)%/i);
    if (volMatch && volMatch[1]) result.volatility = parsePercentage(volMatch[1]);

    // --- Extract performance returns (CAGR) ---
    result.cagr1y = null;
    result.cagr3y = null;
    result.cagr5y = null;

    const r1y = pageText.match(/return[^a-z]_?1y[^a-z]*([\d.,\-\+]+)%/i);
    const r3y = pageText.match(/return[^a-z]_?3y[^a-z]*([\d.,\-\+]+)%/i);
    const r5y = pageText.match(/return[^a-z]_?5y[^a-z]*([\d.,\-\+]+)%/i);

    if (r1y && r1y[1]) result.cagr1y = parsePercentage(r1y[1]);
    if (r3y && r3y[1]) result.cagr3y = parsePercentage(r3y[1]);
    if (r5y && r5y[1]) result.cagr5y = parsePercentage(r5y[1]);

    // --- Extract max drawdown ---
    result.maxDrawdown = null;
    const ddMatch = pageText.match(/[Mm]ax[^a-z]*[Dd]raw[^a-z]*down[^a-z]*([\d.,\-\+]+)%/i);
    if (ddMatch && ddMatch[1]) result.maxDrawdown = parsePercentage(ddMatch[1]);

    // --- Extract risk class / SRI indicator ---
    result.riskClass = null;
    const riskMatch = pageText.match(/[Rr]isk[^a-z]*class[^a-z]*([1-7])/i);
    if (riskMatch) result.riskClass = parseInt(riskMatch[1], 10);

    console.log(`  ✓ ISIN ${isin} ter=${result.ter} dist=${result.distributionPolicy} repl=${result.replicationMethod}`);
    return result;
  } catch (err) {
    // console.error(`✗ Failed ISIN ${isin}: ${err.message}`);
    return null;
  }
}

// Safe merge: only overwrite fields that are null in the target
function safeMerge(existing, scraped) {
  const allowedUpdateKeys = [
    'ter',
    'aum',
    'distributionPolicy',
    'replicationMethod',
    'inceptionDate',
    'currency',
    'volatility',
    'cagr1y',
    'cagr3y',
    'cagr5y',
    'maxDrawdown',
    'riskClass',
  ];

  let updated = 0;
  for (const key of allowedUpdateKeys) {
    if (scraped[key] != null && existing[key] == null) {
      existing[key] = scraped[key];
      updated++;
    } else if (scraped[key] != null && existing[key] != null) {
      // If existing has null-ish value (0 for ter), update it
      // TER: if existing is 0 (uninitialized), update; if already set, keep
      if (key === 'ter') {
        if (existing[key] === 0) {
          existing[key] = scraped[key];
          updated++;
        }
      } else if (key === 'aum') {
        if (existing[key] === null) {
          existing[key] = scraped[key];
          updated++;
        }
      }
    }
  }
  return updated;
}

async function main() {
  // Read existing ETF data
  const rawData = await fs.readFile(DATA_PATH, 'utf8');
  let etfs = JSON.parse(rawData);

  const isins = etfs.map((etf) => etf.isin);

  console.log(`Starting justETF scrape for ${isins.length} ETFs...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const isin of isins) {
    try {
      // Scrape English profile first
      let profile = await fetchEtfProfile(isin, false);

      // Only scrape Italian version if TER not found in English
      if (profile && profile.ter === null) {
        const italianProfile = await fetchEtfProfile(isin, true);
        if (italianProfile && italianProfile.ter) {
          profile = italianProfile;
        } else {
          skipped++;
          continue;
        }
      }

      if (profile) {
        const existing = etfs.find((e) => e.isin === isin);
        if (existing) {
          const mergeResult = safeMerge(existing, profile);
          if (mergeResult > 0) updated++;
          // If no fields merged, still count as processed
          if (mergeResult === 0) skipped++;
        }
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
    }

    // Rate limiting - be respectful to justETF servers
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Save updated data
  await fs.writeFile(DATA_PATH, JSON.stringify(etfs, null, 2) + '\n', 'utf8');

  console.log(`\nScrape complete. Updated: ${updated}, Preserved: ${isins.length - updated - skipped}, Skipped: ${skipped}, Failed: ${failed}/${isins.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});