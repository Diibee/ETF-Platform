import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Features } from '@/components/landing/Features';
import { Proof } from '@/components/landing/Proof';
import { Process } from '@/components/landing/Process';
import { Offer } from '@/components/landing/Offer';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';

/* Structured data: describes the tool itself and mirrors the FAQ section so the
   same answers are eligible for rich results. */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'ETF Lab',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'it-IT',
      description:
        'Strumento educativo per analizzare, confrontare e simulare ETF acquistabili in Italia, con calcolo del rendimento netto secondo la fiscalità italiana.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'ETF Lab è un servizio di consulenza finanziaria?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. È uno strumento educativo di analisi personale. Non colloca prodotti e non fornisce raccomandazioni personalizzate ai sensi della MiFID II.',
          },
        },
        {
          '@type': 'Question',
          name: 'Perché il rendimento netto è più basso del lordo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Perché somma capital gain al 26%, imposta di bollo annuale dello 0,2% sul valore del portafoglio e la mancata compensazione delle minusvalenze pregresse.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-medium focus:text-brand-fg"
      >
        Salta al contenuto
      </a>

      <LandingNav />

      {/* tabIndex={-1} is what makes the skip link actually work: without it the
          browser scrolls to <main> but leaves keyboard focus in the nav, so the
          next Tab lands back on the menu — the exact thing the link exists to
          avoid. Automated audits do not catch this. */}
      <main id="contenuto" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Problem />
        <Features />
        <Proof />
        <Process />
        <Offer />
        <Faq />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </>
  );
}
