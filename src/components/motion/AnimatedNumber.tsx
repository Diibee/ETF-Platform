'use client';

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO } from './ease';

/**
 * A figure that tweens whenever its value changes.
 *
 * The counterpart to `CountUp`: that one fires once when it scrolls into view
 * and is for stats that are simply *there*; this one is for a number that is
 * the answer to something the user just did — a filter narrowing, a slider
 * moving, a simulation re-running. Watching €412.000 travel to €388.000 shows
 * the direction and rough size of the change, which a value that simply
 * replaces itself does not.
 *
 * It never animates on mount, so first paint costs nothing and server and
 * client agree on the markup. As in `CountUp`, frames are written straight to
 * `textContent` rather than through state, so a slider dragged across a
 * results panel doesn't re-render the panel sixty times a second.
 */
export function AnimatedNumber({
  value,
  format = v => Math.round(v).toLocaleString('it-IT'),
  duration = 0.6,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const shouldReduce = useReducedMotion();
  // The formatter is held in a ref so a caller passing an inline arrow cannot
  // restart the tween on every parent render — the animation effect below must
  // depend on the value alone.
  const formatRef = useRef(format);
  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    const node = ref.current;
    const from = previous.current;
    previous.current = value;

    if (!node || from === value) return;

    if (shouldReduce) {
      node.textContent = formatRef.current(value);
      return;
    }

    const controls = animate(from, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: v => {
        node.textContent = formatRef.current(v);
      },
      onComplete: () => {
        node.textContent = formatRef.current(value);
      },
    });

    return () => controls.stop();
  }, [value, duration, shouldReduce]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
