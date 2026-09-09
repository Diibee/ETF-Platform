import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ETF } from '@/types/etf';
import etfsData from '@/data/etfs.json';
import EtfDetailPage from '@/views/EtfDetailPage';

const etfs = etfsData as unknown as ETF[];

/** Pre-renders all 30 detail pages at build time — static HTML, no client fetch. */
export function generateStaticParams() {
  return etfs.map(etf => ({ isin: etf.isin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ isin: string }>;
}): Promise<Metadata> {
  const { isin } = await params;
  const etf = etfs.find(e => e.isin === isin);
  if (!etf) return { title: 'ETF non trovato' };

  return {
    title: etf.name,
    description: `${etf.name} (${etf.isin}) — TER ${etf.ter}%, indice ${etf.index}, domicilio ${etf.domicile}. Metriche, composizione e fiscalità italiana.`,
    alternates: { canonical: `/catalogue/${etf.isin}` },
  };
}

export default async function Page({ params }: { params: Promise<{ isin: string }> }) {
  const { isin } = await params;
  if (!etfs.some(e => e.isin === isin)) notFound();

  return <EtfDetailPage isin={isin} />;
}
