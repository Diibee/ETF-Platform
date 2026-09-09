'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface HelpTooltipProps {
  content: string;
}

/**
 * Inline help popover.
 *
 * Every wrapper is a `<span>` on purpose: this component is used inside `<p>`
 * elements (see MetricBox), and a `<div>` there is invalid HTML that the
 * server renderer and the client resolve differently, which broke hydration.
 */
export function HelpTooltip({ content }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlipLeft(rect.right + 268 > window.innerWidth);
    }
    setOpen(v => !v);
  }

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        aria-label="Aiuto"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="ml-1 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold leading-none text-fg-subtle transition-colors duration-200 hover:bg-brand-soft hover:text-brand-soft-fg"
      >
        ?
      </button>
      {open && (
        <span
          id={panelId}
          role="tooltip"
          className={`absolute top-0 z-50 block w-64 rounded-xl border border-border bg-surface p-3 text-xs leading-relaxed font-normal tracking-normal text-fg-muted shadow-lg ${flipLeft ? 'right-6' : 'left-6'}`}
        >
          {content}
          <span
            aria-hidden="true"
            className={`absolute top-1.5 size-3 border-t bg-surface ${
              flipLeft ? '-right-1.5 rotate-45 border-r border-border' : '-left-1.5 -rotate-45 border-l border-border'
            }`}
          />
        </span>
      )}
    </span>
  );
}
