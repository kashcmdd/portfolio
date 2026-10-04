import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { activateOnKey } from '../utils/keyboard';

interface LoadingScreenProps {
  onComplete: () => void;
}

const ROTATING_WORDS = ["Haunt", "Carve", "Beware", "Summon"];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 400);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    // The intro used to run a fixed one-second countdown regardless of whether
    // anything was still loading, which made every visitor wait on a number
    // rather than on the page. It now finishes when the document has actually
    // loaded, with a short floor so the word animation is not a flash, and a
    // hard ceiling so a slow or dead asset cannot hold the page hostage.
    const MIN_MS = 420;
    const MAX_MS = 1600;
    const start = performance.now();
    let done = false;
    let raf = 0;
    let minTimer = 0;
    let ceiling = 0;
    let completeTimer = 0;

    const finish = () => {
      if (done) return;
      done = true;
      setCount(100);
      completeTimer = window.setTimeout(onComplete, 120);
    };

    const ready = () => {
      const elapsed = performance.now() - start;
      minTimer = window.setTimeout(finish, Math.max(0, MIN_MS - elapsed));
    };

    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    ceiling = window.setTimeout(finish, MAX_MS);

    const animate = (now: number) => {
      if (done) return;
      const progress = Math.min((now - start) / MAX_MS, 1);
      setCount(Math.min(99, Math.floor(progress * 100)));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      done = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(ceiling);
      window.clearTimeout(completeTimer);
      window.removeEventListener('load', ready);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
      onClick={onComplete}
      onKeyDown={activateOnKey(onComplete)}
      role="button"
      tabIndex={0}
      aria-label="Enter the portfolio"
      className="fixed inset-0 z-[9999] bg-[#0a0a0a] text-white flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF8C42]"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-neutral-500 uppercase tracking-[0.3em] font-body"
        >
          KashhCMD Portfolio
        </motion.div>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-body flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse" />
          Enter if you dare
        </motion.div>
      </div>

      <div className="my-auto flex items-center justify-center text-center py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={ROTATING_WORDS[wordIndex]}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.95 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-white/90 tracking-tight font-bold"
          >
            {ROTATING_WORDS[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-body hidden sm:block">
            Initializing digital environment...
          </div>

          <div className="text-6xl md:text-8xl lg:text-9xl font-display text-white tabular-nums leading-none tracking-tighter ml-auto font-bold">
            {String(count).padStart(3, '0')}
          </div>
        </div>

        <div className="w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden relative">
          <div
            className="h-full accent-gradient transition-all duration-75 origin-left"
            style={{
              transform: `scaleX(${count / 100})`,
              transformOrigin: 'left center',
              boxShadow: '0 0 8px rgba(137, 170, 204, 0.45)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
