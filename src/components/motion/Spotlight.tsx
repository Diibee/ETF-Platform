'use client';

import type { PointerEvent } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pointer-tracked glow for a card.
 *
 * The gradient itself lives in the `.spotlight` utility in `index.css`; this
 * component only feeds it two custom properties. That split is deliberate:
 * writing `--mx`/`--my` on the node never touches React state, so a pointer
 * crossing a 95-card grid causes zero re-renders and the browser only repaints
 * one pseudo-element. `currentTarget` gives us the node without a ref, which
 * keeps this a single stateless function.
 *
 * Coarse pointers never fire `pointermove` before a tap, so on touch the card
 * simply stays in its resting state — nothing to feature-detect.
 */
export function Spotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    node.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div onPointerMove={onPointerMove} className={cn('spotlight', className)}>
      {children}
    </div>
  );
}
