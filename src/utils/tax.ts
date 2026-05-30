export const TAX_RATE_STANDARD = 0.26;
export const TAX_RATE_GOV_BONDS = 0.125;
export const BOLLO_RATE = 0.002;

// ETF gains (redditi di capitale) cannot be offset against prior capital losses
// (redditi diversi) — the "zainetto fiscale" problem.
// We always apply full tax on every positive gain without loss offset.
//
// taxRegime affects timing only (broker-withheld vs. self-declared on tax return),
// not the gross tax amount. Simulation treats them identically.
