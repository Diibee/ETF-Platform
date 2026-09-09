import type { Metadata } from 'next';
import QuestionnairePage from '@/views/QuestionnairePage';

export const metadata: Metadata = {
  title: 'Profilo investitore',
  description:
    'Otto domande per definire orizzonte, tolleranza al rischio e obiettivo, con una proposta di allocazione fra azionario, obbligazionario, materie prime e immobiliare.',
};

export default function Page() {
  return <QuestionnairePage />;
}
