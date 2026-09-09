'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO } from './ease';
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect';

/**
 * A figure that counts up to its value the first time it scrolls into view.
 *
 * The formatting is described with plain props — `decimals`, `prefix`,
 * `suffix` — rather than a callback, because every caller is a *server*
 * component and React cannot serialise a function across that boundary. The
 * client-side counterpart, `AnimatedNumber`, does take a formatter.
 *
 * Three details that make this safe rather than decorative noise:
 *
 * 1. The server renders the *final* value. Crawlers, no-JS readers and the
 *    reduced-motion path all see the real number, and the element is already
 *    at its final width — a count-up growing from "0" to "1.000" would reflow
 *    the row on every frame otherwise. `tnum` on the surrounding element keeps
 *    every digit the same width for the same reason.
 * 2. The reset to zero happens in a layout effect, before the browser paints,
 *    so the final value never flashes on screen first.
 * 3. The tween writes straight to `textContent`. Routing sixty frames a second
 *    through `setState` would re-render the whole surrounding card for a
 *    number nobody is interacting with.
 */

/** Italian convention: "." groups thousands, "," separates the decimals. */
function formatIt(value: number, decimals: number, grouping: boolean): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const grouped = grouping ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : whole;
  const sign = value < 0 ? '−' : '';
  return fraction ? `${sign}${grouped},${fraction}` : `${sign}${grouped}`;
}

export function CountUp({
  value,
  decimals = 0,
  grouping = true,
  prefix = '',
  suffix = '',
  duration = 1.2,
  delay = 0,
  className,
}: {
  value: number;
  decimals?: number;
  /** Thousands separator. Turn off for years, counts of steps, and IDs. */
  grouping?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const shouldReduce = useReducedMotion();
  const played = useRef(false);

  const render = (v: number) => `${prefix}${formatIt(v, decimals, grouping)}${suffix}`;

  useIsomorphicLayoutEffect(() => {
    if (shouldReduce || played.current || !ref.current) return;
    ref.current.textContent = `${prefix}${formatIt(0, decimals, grouping)}${suffix}`;
  }, [shouldReduce, prefix, suffix, decimals, grouping]);

  useEffect(() => {
    if (shouldReduce || played.current || !inView || !ref.current) return;
    played.current = true;
    const node = ref.current;
    const write = (v: number) => {
      node.textContent = `${prefix}${formatIt(v, decimals, grouping)}${suffix}`;
    };

    const controls = animate(0, value, {
      duration,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: write,
      onComplete: () => write(value),
    });

    return () => controls.stop();
  }, [inView, shouldReduce, value, duration, delay, prefix, suffix, decimals, grouping]);

  return (
    <span ref={ref} className={className}>
      {render(value)}
    </span>
  );
}
