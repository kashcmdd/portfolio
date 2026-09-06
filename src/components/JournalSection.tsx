import React from 'react';
import { motion } from 'motion/react';
import { JournalEntry } from '../types';
import { journalEntriesData } from '../data/portfolioData';
import { ArrowUpRight, BookOpen } from 'lucide-react';

interface JournalSectionProps {
  onSelectJournal: (entry: JournalEntry) => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  onSelectJournal,
}) => {
  return (
    <section id="journal" className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em] mb-2">
              <span className="w-8 h-px bg-neutral-800" />
              <span>JOURNAL & THOUGHTS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight">
              Recent <span className="font-display italic text-white">thoughts</span>
            </h2>
            <p className="text-sm md:text-base font-body font-light text-neutral-400 mt-2 max-w-lg">
              Articles and personal reflections on self-taught software engineering, Discord bot architecture, and UI craftsmanship.
            </p>
          </div>

          <div className="hidden md:inline-flex relative group">
            <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
            <button
              onClick={() => onSelectJournal(journalEntriesData[0])}
              className="relative inline-flex items-center gap-2 rounded-full text-xs font-medium px-5 py-2.5 bg-[#141414] text-white hover:bg-[#1f1f1f] border border-white/10 transition-colors cursor-pointer font-body"
            >
              <span>Read Latest Entry</span>
              <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
            </button>
          </div>
        </motion.div>

        {/* Horizontal Pills list */}
        <div className="space-y-4">
          {journalEntriesData.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => onSelectJournal(entry)}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-4 md:p-5 rounded-[28px] sm:rounded-full bg-[#141414]/50 hover:bg-[#141414] border border-neutral-800 hover:border-neutral-700 transition-all duration-300 cursor-pointer shadow-lg"
            >
              {/* Image + Info */}
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-body uppercase text-neutral-400 tracking-wider mb-1">
                    <span className="text-[#89AACC] font-semibold">{entry.category}</span>
                    <span>·</span>
                    <span>{entry.readTime}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-body font-medium text-white group-hover:text-neutral-200 transition-colors line-clamp-1">
                    {entry.title}
                  </h3>
                </div>
              </div>

              {/* Date & Arrow button */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                <span className="text-xs font-mono text-neutral-400 shrink-0">
                  {entry.date}
                </span>
                <div className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
