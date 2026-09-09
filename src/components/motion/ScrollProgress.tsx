'use client';

import { m, useReducedMotion, useScroll, useSpring } from 'motion/react';

/**
 * Reading-progress hairline pinned under the landing header.
 *
 * `useScroll` reads from a rAF loop rather than a scroll listener, and the bar
 * animates `scaleX` only, so this never touches layout. Under reduced motion
 * the spring is dropped — the bar still tracks the scroll position exactly,
 * it just stops easing towards it.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduce = useReducedMotion();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX: shouldReduce ? scrollYProgress : smooth }}
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-brand via-brand to-accent"
    />
  );
}
