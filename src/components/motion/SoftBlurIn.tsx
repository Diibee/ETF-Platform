'use client';

import { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'motion/react';

/**
 * Per-character reveal: each letter fades up out of a soft blur, Apple's
 * keynote title entrance.
 *
 * Adapted from `soft-blur-in` by @educalvolpz on 21st.dev. Three changes were
 * needed to make it safe here:
 *
 * 1. `motion.span` → `m.span`. The app provides a single `domAnimation` bundle
 *    from `MotionRoot` in `strict` mode, and `motion.*` throws under it.
 * 2. Characters are grouped by word. The original splits the whole string into
 *    inline-block spans, which lets the browser break a line *between any two
 *    letters* — "Scegliere" wrapping as "Scegli / ere", with no hyphen. Each
 *    word is now its own `whitespace-nowrap` box, so line breaking still only
 *    happens at spaces and `text-balance` keeps working.
 * 3. Inline styles moved to Tailwind classes, per the project's conventions.
 *
 * The trigger stays where the original put it — one `useInView` on the
 * wrapper, driving every character. Giving each letter its own `whileInView`
 * would put forty IntersectionObservers on a single heading.
 *
 * Use it on headings, and only below the fold: every character starts at
 * `opacity: 0`, so on a hero title this would hold back the Largest
 * Contentful Paint by the full length of the animation.
 *
 * `filter` repaints on every frame, so this is priced per character. A section
 * heading is fine; a paragraph is not.
 */

const DURATION = 0.9;
/** Apple's signature ease-out. */
const EASE = [0.22, 1, 0.36, 1] as const;

export function SoftBlurIn({
  children,
  className,
  delay = 0,
  stagger = 25,
}: {
  children: string;
  className?: string;
  /** Delay before the first character starts, in milliseconds. */
  delay?: number;
  /** Per-character offset, in milliseconds. */
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <span className={className}>{children}</span>;
  }

  // Offsets are computed up front so a character's delay reflects its position
  // in the whole string, not in its word — otherwise every word would restart
  // the cascade and the reveal would read as six separate animations.
  const words = children.split(' ');
  // Quadratic in the number of words, which is fine: a heading has a dozen at
  // most, and a running accumulator would be a reassignment during render.
  const wordOffsets = words.map((_, w) =>
    words.slice(0, w).reduce((sum, prev) => sum + prev.length + 1, 0),
  );

  return (
    <span ref={ref} aria-label={children} className={className}>
      {words.map((word, w) => (
        // The space is a sibling of the word box, never inside it: a space
        // inside a `whitespace-nowrap` element is not a break opportunity, and
        // the heading would stop wrapping altogether.
        <span key={`${word}-${w}`} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, i) => (
              <m.span
                key={i}
                data-reveal=""
                className="inline-block"
                initial={{ opacity: 0, y: 16, filter: 'blur(12px)' }}
                animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
                transition={{
                  duration: DURATION,
                  delay: delay / 1000 + ((wordOffsets[w] + i) * stagger) / 1000,
                  ease: EASE,
                }}
              >
                {char}
              </m.span>
            ))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}
