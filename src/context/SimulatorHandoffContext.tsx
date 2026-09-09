'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import type { PortfolioEntry, SimulationInput } from '@/types/etf';

/**
 * Replaces React Router's `navigate(path, { state })` handoff.
 *
 * The App Router has no per-navigation state channel, and CLAUDE.md forbids
 * putting portfolio state in localStorage — so the questionnaire parks its
 * payload here, pushes to /simulator, and the simulator consumes it exactly
 * once. Both routes sit under the same root layout, so the provider survives
 * the client-side navigation between them.
 */
export interface SimulatorHandoff {
  portfolio?: PortfolioEntry[];
  initialDeposit?: number;
  periodicContribution?: number;
  contributionFrequency?: SimulationInput['contributionFrequency'];
  years?: number;
}

interface SimulatorHandoffValue {
  setHandoff: (payload: SimulatorHandoff) => void;
  /** Returns the pending payload and clears it, so a reload starts clean. */
  consumeHandoff: () => SimulatorHandoff | null;
}

const SimulatorHandoffContext = createContext<SimulatorHandoffValue>({
  setHandoff: () => {},
  consumeHandoff: () => null,
});

export function SimulatorHandoffProvider({ children }: { children: React.ReactNode }) {
  // A ref, not state: parking a payload must never re-render the tree. The
  // consumer reads it in its own state initialiser on the next route's first
  // render, so no re-render is needed to hand it over.
  const pending = useRef<SimulatorHandoff | null>(null);

  const setHandoff = useCallback((payload: SimulatorHandoff) => {
    pending.current = payload;
  }, []);

  const consumeHandoff = useCallback(() => {
    const value = pending.current;
    pending.current = null;
    return value;
  }, []);

  return (
    <SimulatorHandoffContext.Provider value={{ setHandoff, consumeHandoff }}>
      {children}
    </SimulatorHandoffContext.Provider>
  );
}

export function useSimulatorHandoff() {
  return useContext(SimulatorHandoffContext);
}
