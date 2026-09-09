'use client';

import { LazyMotion, domAnimation } from 'motion/react';

/**
 * Single motion feature bundle for the whole app.
 *
 * Every animated component in `src/components/motion/` uses `m` rather than
 * `motion`, so the feature set has to be provided exactly once, here, instead
 * of being re-mounted by each primitive. `strict` makes that a compile-time
 * contract: importing `motion.div` anywhere below this provider throws.
 *
 * `domAnimation` (~15kb) covers animations, variants, exit animations and the
 * hover/tap/focus gestures — everything this app uses. `domMax` is not loaded
 * because nothing here needs drag, pan or layout projection: the nav indicator
 * animates measured offsets instead of using `layoutId`, precisely so this
 * bundle can stay small.
 *
 * `children` arrives as a prop, so the server components below it stay server
 * components — wrapping the tree costs nothing but this file.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
