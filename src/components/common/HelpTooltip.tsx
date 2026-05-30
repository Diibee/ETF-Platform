import { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlipLeft(rect.right + 268 > window.innerWidth);
    }
    setOpen(v => !v);
  }

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-bold leading-none transition-colors flex-shrink-0"
        aria-label="Aiuto"
      >
        ?
      </button>
      {open && (
        <div
          className={`absolute z-50 top-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed ${flipLeft ? 'right-6' : 'left-6'}`}
        >
          {content}
          {flipLeft
            ? <div className="absolute -right-1.5 top-1.5 w-3 h-3 bg-white dark:bg-gray-800 border-r border-t border-gray-200 dark:border-gray-700 rotate-45" />
            : <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-[-45deg]" />
          }
        </div>
      )}
    </div>
  );
}
