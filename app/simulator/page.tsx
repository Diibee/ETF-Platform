import type { Metadata } from 'next';
import SimulatorPage from '@/views/SimulatorPage';

export const metadata: Metadata = {
  title: 'Simulatore interesse composto',
  description:
    'Simula la crescita del portafoglio con rendimento lordo, netto (capital gain 26% + bollo 0,2%) e reale al netto dell inflazione, con fan chart Monte Carlo.',
};

export default function Page() {
  return <SimulatorPage />;
}
