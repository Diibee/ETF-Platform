import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * React logs a warning when `useLayoutEffect` runs during server rendering,
 * because there is no layout to read. Every one of these call sites measures
 * the DOM before paint — nav indicators, count-up resets — so on the server
 * the effect simply must not run at all, and swapping the hook is the
 * documented way to say that.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
