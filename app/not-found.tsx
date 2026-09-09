import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="space-y-2">
        <p className="font-mono text-sm text-fg-subtle">404</p>
        <h1 className="text-h2 text-fg">Pagina non trovata</h1>
        <p className="text-fg-muted">La risorsa richiesta non esiste o è stata spostata.</p>
      </div>
      <Link
        href="/"
        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-brand px-5 font-medium text-brand-fg transition-colors duration-200 hover:bg-brand-hover"
      >
        Torna alla home
      </Link>
    </main>
  );
}
