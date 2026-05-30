import type { AssetClass, DividendPolicy, ReplicationMethod } from '../types/etf';

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value == null) return 'n/d';
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value);
}

export function formatAum(aum: number): string {
  if (aum >= 1000) return `€${(aum / 1000).toFixed(1)}B`;
  return `€${aum.toFixed(0)}M`;
}

export function assetClassLabel(ac: AssetClass): string {
  const map: Record<AssetClass, string> = {
    equity: 'Azionario',
    bonds: 'Obbligazionario',
    commodities: 'Materie Prime',
    real_estate: 'Immobiliare',
  };
  return map[ac];
}

export function dividendPolicyLabel(dp: DividendPolicy): string {
  return dp === 'acc' ? 'Accumulazione' : 'Distribuzione';
}

export function replicationLabel(r: ReplicationMethod): string {
  const map: Record<ReplicationMethod, string> = {
    full_physical: 'Fisica completa',
    sampling: 'Campionamento',
    synthetic: 'Sintetica (swap)',
  };
  return map[r];
}

export function riskClassColor(riskClass: number): 'green' | 'yellow' | 'red' {
  if (riskClass <= 2) return 'green';
  if (riskClass <= 4) return 'yellow';
  return 'red';
}

export function assetClassColor(ac: AssetClass): 'blue' | 'green' | 'yellow' | 'purple' {
  const map: Record<AssetClass, 'blue' | 'green' | 'yellow' | 'purple'> = {
    equity: 'blue',
    bonds: 'green',
    commodities: 'yellow',
    real_estate: 'purple',
  };
  return map[ac];
}
