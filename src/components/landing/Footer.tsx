import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { CtaLink, CtaArrow } from './primitives';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion';
import { CTA } from './cta';

const COLUMNS = [
  {
    heading: 'Strumento',
    links: [
      { href: '/catalogue', label: 'Catalogo ETF' },
      { href: '/simulator', label: 'Simulatore' },
      { href: '/questionnaire', label: 'Profilo investitore' },
    ],
  },
  {
    heading: 'Pagina',
    links: [
      { href: '#problema', label: 'Il problema' },
      { href: '#funzioni', label: 'Funzioni' },
      { href: '#dati', label: 'Provenienza dei dati' },
      { href: '#faq', label: 'Domande frequenti' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      {/* Closing CTA band — the page's last conversion point. */}
      <div className="halo border-b border-border">
        <div className="shell flex flex-col items-center gap-6 py-[var(--section-y)] text-center">
          <Reveal>
            <h2 className="text-h2 measure text-balance text-fg">
              Guarda quanto resta dopo le imposte, prima di investire
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <p className="measure text-lead text-pretty text-fg-muted">
              Nessuna registrazione. Inserisci importo, durata e portafoglio: la proiezione
              netta compare subito.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CtaLink href={CTA.simulator.href} className="w-full sm:w-auto">
                {CTA.simulator.label}
                <CtaArrow />
              </CtaLink>
              <CtaLink href={CTA.catalogue.href} variant="secondary" className="w-full sm:w-auto">
                {CTA.catalogue.label}
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="shell grid grid-cols-1 gap-x-8 gap-y-8 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-4">
          <Link href="/" aria-label="ETF Lab — home">
            <Logo />
          </Link>
          <p className="measure text-sm text-pretty text-fg-muted">
            Strumento educativo per analizzare, confrontare e simulare ETF e fondi indice
            acquistabili in Italia, con la fiscalità italiana applicata a ogni proiezione.
          </p>
        </div>

        {COLUMNS.map(col => (
          <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-3">
            <h2 className="text-eyebrow uppercase text-fg-subtle">{col.heading}</h2>
            <StaggerGroup as="ul" step={0.04} className="flex list-none flex-col gap-2 p-0">
              {col.links.map(l => (
                <StaggerItem as="li" key={l.href} y={8}>
                  <Link
                    href={l.href}
                    className="underline-wipe inline-block text-sm text-fg-muted transition-colors duration-200 hover:text-fg"
                  >
                    {l.label}
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="shell flex flex-col gap-4 py-6 md:flex-row md:items-start md:justify-between">
          <p className="measure text-xs text-pretty text-fg-subtle">
            © {year} ETF Lab. Strumento educativo di analisi personale, non consulenza
            finanziaria né sollecitazione all’investimento. I rendimenti passati non
            garantiscono rendimenti futuri. Verifica sempre aliquote e caratteristiche dei
            prodotti sulla documentazione ufficiale dell’emittente.
          </p>
          <p className="shrink-0 font-mono text-xs text-fg-subtle">
            Dati aggiornati quotidianamente
          </p>
        </div>
      </div>
    </footer>
  );
}
