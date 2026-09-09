'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'etf-lab:theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} });

/**
 * The `dark` class on <html> is the single source of truth — the inline script
 * in the root layout sets it before paint, and this provider reads it rather
 * than keeping a parallel copy in state.
 *
 * `useSyncExternalStore` is the right tool here: the class is external state,
 * and reading it through a subscription avoids the setState-inside-useEffect
 * pattern (which triggers a second render pass on every mount).
 */
function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// The server emits no `dark` class; the pre-paint script adds it. Dark is the
// project's default, so this is what the server HTML corresponds to.
function getServerSnapshot(): Theme {
  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    // Flipping the class notifies the store through the MutationObserver.
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice simply won't persist */
    }
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
