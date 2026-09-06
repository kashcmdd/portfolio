import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry } from '../types';
import { X, Calendar, Clock, Tag } from 'lucide-react';

interface JournalModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="liquid-glass-strong w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-body text-neutral-400 mb-3">
            <span className="liquid-glass px-3 py-1 rounded-full text-white font-medium flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#89AACC]" /> {entry.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {entry.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {entry.readTime}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display italic text-white tracking-tight mb-3">
            {entry.title}
          </h2>

          <p className="text-sm font-body text-neutral-300 font-light mb-6 border-b border-white/10 pb-4 italic">
            {entry.subtitle}
          </p>

          {/* Banner Image */}
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 border border-white/10">
            <img
              src={entry.image}
              alt={entry.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Paragraphs */}
          <div className="space-y-4 font-body font-light text-sm sm:text-base text-neutral-200 leading-relaxed mb-8">
            {entry.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="liquid-glass-strong rounded-full py-2.5 px-6 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Close Article
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
