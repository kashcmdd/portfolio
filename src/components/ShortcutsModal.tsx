import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard } from 'lucide-react';
import { useFocusTrap } from '../utils/useFocusTrap';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Only shortcuts that actually do something are listed. A cheatsheet that names
// a key the site does not implement is worse than no cheatsheet, because the
// reader blames themselves when nothing happens.
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Ctrl', 'K'], label: 'Open search and commands' },
  { keys: ['/'], label: 'Open search and commands' },
  { keys: ['?'], label: 'Show this shortcut list' },
  { keys: ['↑', '↓'], label: 'Move through search results' },
  { keys: ['Enter'], label: 'Open the highlighted result' },
  { keys: ['Esc'], label: 'Close any dialog' },
  { keys: ['Tab'], label: 'Move between controls in a dialog' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-start justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          tabIndex={-1}
          className="liquid-glass-strong my-auto w-full max-w-md rounded-3xl border border-white/20 p-6 text-white shadow-2xl sm:p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 cursor-pointer rounded-full liquid-glass p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-[#89AACC]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl italic text-white">Keyboard shortcuts</h2>
              <p className="font-body text-xs text-neutral-400">
                Move around without reaching for the mouse.
              </p>
            </div>
          </div>

          <dl className="flex flex-col gap-3">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.label + shortcut.keys.join('')}
                className="flex items-center justify-between gap-4"
              >
                <dt className="font-body text-sm text-neutral-300">{shortcut.label}</dt>
                <dd className="flex shrink-0 items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-neutral-200"
                    >
                      {key}
                    </kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShortcutsModal;
