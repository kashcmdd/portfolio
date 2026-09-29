import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Accessibility, Check } from 'lucide-react';
import { useA11yPrefs } from './A11yPrefProvider';
import type { TextSizePref } from '../utils/a11yPrefs';

const TEXT_SIZES: { value: TextSizePref; label: string; sample: string }[] = [
  { value: 'normal', label: 'Default', sample: 'A' },
  { value: 'large', label: 'Large', sample: 'A' },
  { value: 'xlarge', label: 'Larger', sample: 'A' },
];

export const A11yMenu: React.FC = () => {
  const { prefs, setContrast, setTextSize, reset, isDefault } = useA11yPrefs();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // A popover is not a dialog, so it does not need a focus trap - it just has to
  // get out of the way when the visitor clicks elsewhere or presses Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Accessibility settings"
        className="p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white shrink-0"
      >
        <Accessibility className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="group"
          aria-label="Accessibility preferences"
          className="absolute right-0 top-full mt-3 w-64 rounded-2xl liquid-glass-strong p-4 z-50 text-left shadow-2xl"
        >
          <p className="text-sm font-heading font-semibold text-white mb-3">Display</p>

          <label className="flex items-center justify-between gap-3 cursor-pointer py-1.5">
            <span className="text-sm text-white/90">High contrast</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={prefs.contrast === 'high'}
                onChange={(e) => setContrast(e.target.checked ? 'high' : 'normal')}
              />
              <span className="w-9 h-5 rounded-full bg-white/15 transition-colors peer-checked:bg-[#89AACC] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#89AACC]" />
              <span className="absolute left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </span>
          </label>

          <fieldset className="mt-3">
            <legend className="text-sm text-white/90 mb-1.5">Text size</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {TEXT_SIZES.map((size) => {
                const active = prefs.textSize === size.value;
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setTextSize(size.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition-colors cursor-pointer ${
                      active
                        ? 'border-[#89AACC] bg-[#89AACC]/15 text-white'
                        : 'border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="font-body leading-none"
                      style={{
                        fontSize:
                          size.value === 'normal' ? '0.875rem' : size.value === 'large' ? '1.05rem' : '1.2rem',
                      }}
                    >
                      {size.sample}
                    </span>
                    <span className="text-[0.625rem] leading-none">{size.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {!isDefault && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Reset to site defaults
            </button>
          )}
        </div>
      )}
    </div>
  );
};
