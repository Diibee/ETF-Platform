import type { Metadata } from 'next';
import CataloguePage from '@/views/CataloguePage';

export const metadata: Metadata = {
  title: 'Catalogo ETF',
  description:
    'Filtra e confronta ETF acquistabili in Italia per classe di attivo, TER, domicilio, politica dividendi e classe di rischio SRI.',
};

export default function Page() {
  return <CataloguePage />;
}
