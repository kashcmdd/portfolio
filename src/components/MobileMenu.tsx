import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Github, Search, X } from 'lucide-react';
import { warriorDetails } from '../data/portfolioData';
import { useFocusTrap } from '../utils/useFocusTrap';
import { useMotionPref } from './MotionPrefProvider';

interface MobileMenuItem {
  id: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  navItems: MobileMenuItem[];
  activeSection: string;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenSearchModal: () => void;
  onOpenContactModal: () => void;
}

const PANEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Full-screen navigation for phones, replacing the small dropdown that used to
 * hang under the navbar. It is rendered in a portal so the navbar's backdrop
 * filter cannot become its containing block, and it takes over the screen the
 * way the rest of the site's dialogs already do: focus trapped, Escape closes,
 * background scrolling stopped, focus returned to the hamburger.
 *
 * The slide and the staggered links are skipped when the visitor has asked for
 * reduced motion; the panel still opens, it just no longer travels.
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  navItems,
  activeSection,
  onClose,
  onNavigate,
  onOpenSearchModal,
  onOpenContactModal,
}) => {
  const { reduced } = useMotionPref();
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  // Close the panel, then run the action once React has restored the body
  // scroll lock. Opening a modal or scrolling to a section while the page is
  // still locked would silently do nothing.
  const afterClose = (action: () => void) => {
    onClose();
    window.requestAnimationFrame(action);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // A rotation to a desktop viewport should not leave a full-screen phone
    // menu open behind the desktop navbar.
    const desktop = window.matchMedia('(min-width: 768px)');
    const onBreakpoint = () => {
      if (desktop.matches) onClose();
    };
    desktop.addEventListener('change', onBreakpoint);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-navigation"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          tabIndex={-1}
          initial={reduced ? false : { y: '100%' }}
          animate={{ y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '100%' }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: PANEL_EASE }}
          className="fixed inset-0 z-[95] outline-none md:hidden"
        >
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl" />

          <div className="relative flex h-full flex-col px-6 pb-8 pt-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                {warriorDetails.githubHandle} / Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto py-8">
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => afterClose(() => onNavigate(item.id))}
                      initial={reduced ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { duration: 0.45, delay: 0.12 + index * 0.06, ease: 'easeOut' }
                      }
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left font-body text-2xl font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC] ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        className={`h-5 w-5 ${isActive ? 'text-[#89AACC]' : 'text-neutral-600'}`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => afterClose(onOpenSearchModal)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              <a
                href={warriorDetails.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>

              <div className="cta-ring rounded-full p-[2px]">
                <button
                  type="button"
                  onClick={() => afterClose(onOpenContactModal)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC]"
                >
                  <span>Let's Talk</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
