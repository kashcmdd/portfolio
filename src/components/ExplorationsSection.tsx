import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { explorationItemsData } from '../data/portfolioData';
import { ExplorationItem } from '../types';
import { Sparkles, X, Maximize2 } from 'lucide-react';

export const ExplorationsSection: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ExplorationItem | null>(null);

  return (
    <section id="explorations" className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em] mb-3">
            <span className="w-6 h-px bg-neutral-800" />
            <span>EXPLORATIONS</span>
            <span className="w-6 h-px bg-neutral-800" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight mb-4">
            Visual <span className="font-display italic text-white">playground</span>
          </h2>
          <p className="text-sm md:text-base font-body font-light text-neutral-400">
            Experimental UI concepts, micro-animations, bot infrastructure visualizers, and canvas physics prototypes.
          </p>
        </motion.div>

        {/* Explorations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {explorationItemsData.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square rounded-3xl bg-[#141414] border border-neutral-800/80 overflow-hidden cursor-pointer shadow-xl hover:border-neutral-700 transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="liquid-glass px-3 py-1 rounded-full text-[11px] font-body text-neutral-300 border border-white/10">
                    {item.category}
                  </span>
                  <div className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-display italic text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-body font-light text-neutral-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="liquid-glass-strong w-full max-w-xl rounded-3xl p-6 text-white relative shadow-2xl border border-white/20 overflow-hidden"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors text-white cursor-pointer z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-4 border border-white/10">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="liquid-glass px-3 py-1 rounded-full text-xs font-body text-neutral-300 inline-block mb-2">
                {selectedItem.category}
              </span>

              <h3 className="text-2xl font-display italic text-white mb-2">
                {selectedItem.title}
              </h3>

              <p className="text-sm font-body font-light text-neutral-300 leading-relaxed mb-6">
                {selectedItem.description}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="liquid-glass-strong rounded-full px-5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
