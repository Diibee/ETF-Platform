'use client';

import { m, useReducedMotion, type Transition, type TargetAndTransition } from 'motion/react';
import { EASE_OUT_QUART } from './ease';

/**
 * Scroll-triggered entrance for a single block.
 *
 * Reduced motion is handled here in JS, deliberately. Motion animates through
 * the Web Animations API rather than CSS transitions, so the global
 * `@media (prefers-reduced-motion: reduce)` rule in index.css cannot touch it,
 * and Motion's own default is `reducedMotion: "never"`. When the user asks for
 * reduced motion we render the plain final state — no observer, no animation,
 * no wrapper — which is also the safest failure mode: the content is visible
 * even if nothing ever fires.
 *
 * The `data-reveal` attribute is what the `<noscript>` rule in the root layout
 * targets, so crawlers and no-JS readers get the final state too.
 */

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'blur';

export type RevealTag = 'div' | 'li' | 'section' | 'span' | 'article' | 'figure' | 'p' | 'header';

export type RevealProps = {
  children: React.ReactNode;
  /** Stagger index — each step delays the reveal by 60ms. */
  delay?: number;
  /** Travel distance in px. Keep small; this is a hint of motion, not a slide. */
  y?: number;
  /** Entrance shape. `up` is the house default. */
  variant?: RevealVariant;
  duration?: number;
  /** Fraction of the element that must be visible before it fires. */
  amount?: number;
  className?: string;
  as?: RevealTag;
};

function hiddenState(variant: RevealVariant, distance: number): TargetAndTransition {
  switch (variant) {
    case 'fade':
      return { opacity: 0 };
    case 'down':
      return { opacity: 0, y: -distance };
    case 'left':
      return { opacity: 0, x: -distance };
    case 'right':
      return { opacity: 0, x: distance };
    case 'scale':
      return { opacity: 0, scale: 0.96, y: distance * 0.5 };
    case 'blur':
      return { opacity: 0, y: distance, filter: 'blur(8px)' };
    case 'up':
    default:
      return { opacity: 0, y: distance };
  }
}

function shownState(variant: RevealVariant): TargetAndTransition {
  const base: TargetAndTransition = { opacity: 1, x: 0, y: 0 };
  if (variant === 'scale') return { ...base, scale: 1 };
  if (variant === 'blur') return { ...base, filter: 'blur(0px)' };
  return base;
}

export function Reveal({
  children,
  delay = 0,
  y = 14,
  variant = 'up',
  duration = 0.5,
  amount = 0.25,
  className,
  as = 'div',
}: RevealProps) {
  const shouldReduce = useReducedMotion();
  const Tag = as;

  if (shouldReduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const transition: Transition = {
    duration,
    delay: delay * 0.06,
    ease: EASE_OUT_QUART,
  };

  const MotionTag = m[as];

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={hiddenState(variant, y)}
      whileInView={shownState(variant)}
      viewport={{ once: true, amount, margin: '0px 0px -8% 0px' }}
      transition={transition}
    >
      {children}
    </MotionTag>
  );
}
