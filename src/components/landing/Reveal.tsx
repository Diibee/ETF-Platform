'use client';

import { m, LazyMotion, domAnimation, useReducedMotion, type Transition } from 'motion/react';

/**
 * The landing page's only motion primitive: a scroll-triggered fade-up.
 *
 * Uses `LazyMotion` + `m` + the `domAnimation` feature bundle so the client
 * pays ~5kb instead of the full `motion` runtime — these sections need
 * transforms and opacity, nothing else.
 *
 * Reduced motion is handled here in JS, deliberately. Motion animates through
 * the Web Animations API rather than CSS transitions, so the global
 * `@media (prefers-reduced-motion: reduce)` rule in index.css cannot touch it,
 * and Motion's own default is `reducedMotion: "never"`. When the user asks for
 * reduced motion we therefore render the plain final state — no observer, no
 * animation, no wrapper — which is also the safest failure mode: the content
 * is visible even if nothing ever fires.
 */
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

export type RevealProps = {
  children: React.ReactNode;
  /** Stagger index — each step delays the reveal by 60ms. */
  delay?: number;
  /** Travel distance in px. Keep small; this is a hint of motion, not a slide. */
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'span';
};

export function Reveal({ children, delay = 0, y = 14, className, as = 'div' }: RevealProps) {
  const shouldReduce = useReducedMotion();
  const Tag = as;

  if (shouldReduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const transition: Transition = {
    duration: 0.5,
    delay: delay * 0.06,
    ease: EASE_OUT_QUART,
  };

  const MotionTag = m[as];

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionTag
        data-reveal=""
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
        transition={transition}
      >
        {children}
      </MotionTag>
    </LazyMotion>
  );
}
