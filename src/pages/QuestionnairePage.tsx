import { useState } from 'react';
import type { ETF, UserProfile } from '../types/etf';
import etfsData from '../data/etfs.json';
import { buildRecommendation, type RecommendationOutput } from '../utils/recommendation';
import { QuestionnaireForm, type QuestionnaireResult } from '../components/questionnaire/QuestionnaireForm';
import { RecommendationResult } from '../components/questionnaire/RecommendationResult';

const etfs = etfsData as unknown as ETF[];

export default function QuestionnairePage() {
  const [result, setResult] = useState<{ profile: UserProfile; recommendation: RecommendationOutput } | null>(null);

  function handleComplete({ profile, preferredEtfCount }: QuestionnaireResult) {
    const recommendation = buildRecommendation(profile, etfs, preferredEtfCount);
    setResult({ profile, recommendation });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className={`mx-auto px-4 py-10 ${result ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {!result ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questionario di profilazione</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                9 domande per costruire un portafoglio ETF adatto al tuo profilo.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <QuestionnaireForm onComplete={handleComplete} />
            </div>
          </>
        ) : (
          <RecommendationResult
            profile={result.profile}
            recommendation={result.recommendation}
            onReset={() => setResult(null)}
          />
        )}
      </div>
    </div>
  );
}
