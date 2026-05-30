import { useState } from 'react';
import type { UserProfile } from '../../types/etf';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const TOTAL_STEPS = 9;

export interface QuestionnaireResult {
  profile: UserProfile;
  preferredEtfCount: number;
}

interface QuestionnaireFormProps {
  onComplete: (result: QuestionnaireResult) => void;
}

const OPTION_CLS =
  'flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20';
const OPTION_ACTIVE = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700';
const OPTION_IDLE = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900';

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${OPTION_CLS} ${active ? OPTION_ACTIVE : OPTION_IDLE} w-full text-left`}
    >
      <span
        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${active ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
    </button>
  );
}

function StepHeader({ step, title, subtitle }: { step: Step; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
          {step} / {TOTAL_STEPS}
        </span>
        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function QuestionnaireForm({ onComplete }: QuestionnaireFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [age, setAge] = useState<number>(35);
  const [horizon, setHorizon] = useState<number>(10);
  const [goal, setGoal] = useState<UserProfile['goal']>('growth');
  const [riskTolerance, setRiskTolerance] = useState<UserProfile['riskTolerance']>(3);
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [experience, setExperience] = useState<UserProfile['experience']>('basic');
  const [dividendPreference, setDividendPreference] = useState<UserProfile['dividendPreference']>('accumulation');
  const [preferredEtfCount, setPreferredEtfCount] = useState<number>(4);

  function next() { setStep(s => Math.min(s + 1, TOTAL_STEPS) as Step); }
  function back() { setStep(s => Math.max(s - 1, 1) as Step); }

  function finish() {
    onComplete({
      profile: { age, horizon, goal, riskTolerance, initialCapital, monthlyContribution, experience, dividendPreference, esgPreference: false },
      preferredEtfCount,
    });
  }

  const NAV = (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <button type="button" onClick={back}
          className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          ← Indietro
        </button>
      )}
      {step < TOTAL_STEPS ? (
        <button type="button" onClick={next}
          className="ml-auto px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          Avanti →
        </button>
      ) : (
        <button type="button" onClick={finish}
          className="ml-auto px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
          Vedi raccomandazione →
        </button>
      )}
    </div>
  );

  if (step === 1) return (
    <div>
      <StepHeader step={1} title="Quanti anni hai?" subtitle="Serve per calibrare l'orizzonte e il rischio in base all'età." />
      <div className="space-y-4">
        <input type="range" min={18} max={80} value={age}
          onChange={e => setAge(Number(e.target.value))} className="w-full accent-blue-600" />
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{age} anni</p>
      </div>
      {NAV}
    </div>
  );

  if (step === 2) return (
    <div>
      <StepHeader step={2} title="Qual è il tuo orizzonte temporale?" subtitle="Per quanti anni vuoi tenere investito il capitale?" />
      <div className="space-y-4">
        <input type="range" min={1} max={40} value={horizon}
          onChange={e => setHorizon(Number(e.target.value))} className="w-full accent-blue-600" />
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{horizon} anni</p>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500"><span>1 anno</span><span>40 anni</span></div>
      </div>
      {NAV}
    </div>
  );

  if (step === 3) return (
    <div>
      <StepHeader step={3} title="Qual è il tuo obiettivo principale?" />
      <div className="space-y-3">
        <OptionButton active={goal === 'growth'} onClick={() => setGoal('growth')}>
          <span><span className="font-semibold">Crescita del capitale</span>
          <span className="block text-gray-400 text-xs mt-0.5">Massimizzare il rendimento nel lungo periodo.</span></span>
        </OptionButton>
        <OptionButton active={goal === 'income'} onClick={() => setGoal('income')}>
          <span><span className="font-semibold">Reddito periodico</span>
          <span className="block text-gray-400 text-xs mt-0.5">Generare flussi di cassa attraverso dividendi.</span></span>
        </OptionButton>
        <OptionButton active={goal === 'capital_protection'} onClick={() => setGoal('capital_protection')}>
          <span><span className="font-semibold">Protezione del capitale</span>
          <span className="block text-gray-400 text-xs mt-0.5">Ridurre al minimo il rischio di perdita.</span></span>
        </OptionButton>
      </div>
      {NAV}
    </div>
  );

  if (step === 4) return (
    <div>
      <StepHeader step={4} title="Quanto rischio sei disposto ad accettare?" subtitle="Se il tuo portafoglio scendesse del 20%, come reagiresti?" />
      <div className="space-y-3">
        {([
          [1, 'Venderei subito', 'Perdite anche modeste mi creano forte ansia.'],
          [2, 'Sarei molto preoccupato', 'Accetto solo oscillazioni minime.'],
          [3, 'Resterei investito ma monitorerei', 'Capisco le fluttuazioni di mercato.'],
          [4, 'Comprerei altro a prezzi più bassi', 'Le correzioni sono opportunità.'],
          [5, 'Sono del tutto tranquillo', 'Ho esperienza di cicli di mercato.'],
        ] as [UserProfile['riskTolerance'], string, string][]).map(([val, label, sub]) => (
          <OptionButton key={val} active={riskTolerance === val} onClick={() => setRiskTolerance(val)}>
            <span><span className="font-semibold">{val}. {label}</span>
            <span className="block text-gray-400 dark:text-gray-500 text-xs mt-0.5">{sub}</span></span>
          </OptionButton>
        ))}
      </div>
      {NAV}
    </div>
  );

  if (step === 5) return (
    <div>
      <StepHeader step={5} title="Quanto puoi investire inizialmente?" />
      <div className="space-y-4">
        <input type="range" min={0} max={500000} step={500} value={initialCapital}
          onChange={e => setInitialCapital(Number(e.target.value))} className="w-full accent-blue-600" />
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
          {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(initialCapital)}
        </p>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500"><span>0 €</span><span>500.000 €</span></div>
      </div>
      {NAV}
    </div>
  );

  if (step === 6) return (
    <div>
      <StepHeader step={6} title="Quanto puoi versare ogni mese?" />
      <div className="space-y-4">
        <input type="range" min={0} max={5000} step={50} value={monthlyContribution}
          onChange={e => setMonthlyContribution(Number(e.target.value))} className="w-full accent-blue-600" />
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
          {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyContribution)}/mese
        </p>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500"><span>0 €</span><span>5.000 €/mese</span></div>
      </div>
      {NAV}
    </div>
  );

  if (step === 7) return (
    <div>
      <StepHeader step={7} title="Qual è la tua esperienza con gli investimenti?" />
      <div className="space-y-3">
        {([
          ['none', 'Nessuna', 'Non ho mai investito prima d\'ora.'],
          ['basic', 'Base', 'Conosco i concetti fondamentali (ETF, azioni, obbligazioni).'],
          ['intermediate', 'Intermedia', 'Gestisco già un portafoglio diversificato.'],
          ['advanced', 'Avanzata', 'Uso analisi tecnica, opzioni o strategie complesse.'],
        ] as [UserProfile['experience'], string, string][]).map(([val, label, sub]) => (
          <OptionButton key={val} active={experience === val} onClick={() => setExperience(val)}>
            <span><span className="font-semibold">{label}</span>
            <span className="block text-gray-400 dark:text-gray-500 text-xs mt-0.5">{sub}</span></span>
          </OptionButton>
        ))}
      </div>
      {NAV}
    </div>
  );

  if (step === 8) return (
    <div>
      <StepHeader step={8} title="Preferisci accumulare o ricevere dividendi?" subtitle="Questa scelta influenza quali ETF ti vengono suggeriti." />
      <div className="space-y-3">
        <OptionButton active={dividendPreference === 'accumulation'} onClick={() => setDividendPreference('accumulation')}>
          <span><span className="font-semibold">♻️ Accumulazione</span>
          <span className="block text-gray-400 text-xs mt-0.5">I dividendi vengono reinvestiti automaticamente (fiscalmente più efficiente in Italia).</span></span>
        </OptionButton>
        <OptionButton active={dividendPreference === 'income'} onClick={() => setDividendPreference('income')}>
          <span><span className="font-semibold">💰 Distribuzione</span>
          <span className="block text-gray-400 text-xs mt-0.5">I dividendi vengono pagati periodicamente sul conto.</span></span>
        </OptionButton>
      </div>
      {NAV}
    </div>
  );

  return (
    <div>
      <StepHeader step={9} title="Quanti ETF vuoi nel portafoglio?" subtitle="Più ETF = più diversificazione, ma anche più strumenti da gestire e ribilanciare." />
      <div className="space-y-4">
        <input type="range" min={2} max={8} value={preferredEtfCount}
          onChange={e => setPreferredEtfCount(Number(e.target.value))} className="w-full accent-blue-600" />
        <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{preferredEtfCount} ETF</p>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500"><span>2 (essenziale)</span><span>8 (granulare)</span></div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
          Ti mostreremo 3 portafogli (Semplice / Bilanciato / Diversificato) intorno a questa preferenza.
        </p>
      </div>
      {NAV}
    </div>
  );
}
