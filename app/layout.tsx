import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/context/ThemeContext';
import { SimulatorHandoffProvider } from '@/context/SimulatorHandoffContext';
import '@/index.css';

// Self-hosted at build time: no render-blocking request to fonts.googleapis.com
// and no layout shift, because Next generates the size-adjusted fallback.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'], // 500 is never used in the UI
  variable: '--font-plex-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'Menlo', 'monospace'],
});

const SITE = 'https://etf-platform.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'ETF Lab · Analisi e simulazione ETF Italia',
    template: '%s · ETF Lab',
  },
  description:
    'Analizza, confronta e simula ETF acquistabili in Italia. Rendimento lordo e netto con fiscalità italiana, Monte Carlo e analisi di portafoglio. Strumento educativo.',
  applicationName: 'ETF Lab',
  keywords: ['ETF', 'Italia', 'fiscalità', 'interesse composto', 'Monte Carlo', 'portafoglio', 'TER'],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: SITE,
    siteName: 'ETF Lab',
    title: 'ETF Lab · Analisi e simulazione ETF Italia',
    description:
      'Rendimento lordo e netto con fiscalità italiana, Monte Carlo e analisi di portafoglio. Strumento educativo, non consulenza finanziaria.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#080b12' },
  ],
};

// Runs before hydration so the persisted theme never flashes the wrong palette.
// `beforeInteractive` is the App Router way to do this: a bare <script> tag in
// JSX makes React 19 warn and never re-executes it on the client.
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('etf-lab:theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        {/* Scroll reveals render with an inline `opacity:0` in the server HTML.
            If scripting is unavailable that state would never be cleared, so
            force the final state for no-JS readers and crawlers. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <ThemeProvider>
          <SimulatorHandoffProvider>{children}</SimulatorHandoffProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
