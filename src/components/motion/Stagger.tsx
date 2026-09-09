'use client';

import { m, useReducedMotion, type Variants } from 'motion/react';
import { EASE_OUT_QUART } from './ease';

/**
 * Cascading entrance for a list or grid.
 *
 * `Reveal` fades a whole block in as one unit, which reads as a single flat
 * card no matter how many items it holds. `StaggerGroup` instead drives its
 * children through Motion's variant propagation: the group owns the
 * `whileInView` trigger and one IntersectionObserver, and every `StaggerItem`
 * below it inherits the `hidden` → `show` transition with an offset. One
 * observer per grid, not one per card — which is what makes this safe on the
 * 95-card catalogue.
 *
 * `step` is the per-item offset in seconds. Keep it under 0.06 for long lists:
 * the tail of a 12-item grid at 0.1 takes 1.2s to finish, which stops reading
 * as polish and starts reading as lag.
 */

const CONTAINER: Variants = {
  hidden: {},
  show: (custom: { step: number; delay: number }) => ({
    transition: { staggerChildren: custom.step, delayChildren: custom.delay },
  }),
};

const ITEM: Variants = {
  hidden: (custom: { y: number; blur: boolean }) => ({
    opacity: 0,
    y: custom.y,
    ...(custom.blur ? { filter: 'blur(6px)' } : null),
  }),
  show: (custom: { y: number; blur: boolean }) => ({
    opacity: 1,
    y: 0,
    ...(custom.blur ? { filter: 'blur(0px)' } : null),
    transition: { duration: 0.5, ease: EASE_OUT_QUART },
  }),
};

type GroupTag = 'div' | 'ul' | 'ol' | 'dl' | 'section';
type ItemTag = 'div' | 'li' | 'article' | 'span';

export function StaggerGroup({
  children,
  className,
  as = 'div',
  step = 0.055,
  delay = 0,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  as?: GroupTag;
  step?: number;
  delay?: number;
  amount?: number;
}) {
  const shouldReduce = useReducedMotion();
  const Tag = as;

  if (shouldReduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = m[as];

  return (
    <MotionTag
      className={className}
      custom={{ step, delay }}
      variants={CONTAINER}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: '0px 0px -6% 0px' }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'div',
  y = 16,
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: ItemTag;
  /** Travel distance in px. */
  y?: number;
  /** Adds a blur-to-sharp pass. Costs a repaint per frame — small lists only. */
  blur?: boolean;
}) {
  const shouldReduce = useReducedMotion();
  const Tag = as;

  if (shouldReduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = m[as];

  return (
    <MotionTag data-reveal="" className={className} custom={{ y, blur }} variants={ITEM}>
      {children}
    </MotionTag>
  );
}
