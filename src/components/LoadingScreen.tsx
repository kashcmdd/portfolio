import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const ROTATING_WORDS = ["Design", "Create", "Inspire", "Build"];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 400);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    const duration = 1000;

    const animateCounter = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const currentVal = Math.floor(progress * 100);

      setCount(currentVal);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateCounter);
      } else {
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateCounter);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
      onClick={onComplete}
      className="fixed inset-0 z-[9999] bg-[#0a0a0a] text-white flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden cursor-pointer"
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
          <span className="w-2 h-2 rounded-full bg-[#89AACC] animate-pulse" />
          Tap to enter
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
