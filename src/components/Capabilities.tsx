import React from 'react';
import { motion } from 'motion/react';
import { FadingVideo } from './FadingVideo';

interface CapabilitiesProps {
  onOpenCardDetail?: (title: string) => void;
}

export const Capabilities: React.FC<CapabilitiesProps> = ({ onOpenCardDetail }) => {
  const cards = [
    {
      id: 'ai-scenery',
      iconPath: 'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z',
      tags: ['Natural Context', 'Photo Realism', 'Infinite Settings', 'Eco-Vibe'],
      title: 'AI Scenery',
      body: 'AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.',
    },
    {
      id: 'batch-production',
      iconPath: 'M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z',
      tags: ['Scale Fast', 'Visual Consistency', 'Time Saver', 'Ready to Post'],
      title: 'Batch Production',
      body: 'Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.',
    },
    {
      id: 'smart-lighting',
      iconPath: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z',
      tags: ['Ray Tracing', 'Physical Shadows', 'Studio Quality', 'Sunlight Sync'],
      title: 'Smart Lighting',
      body: 'Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.',
    },
  ];

  return (
    <section id="capabilities" className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between">
      {/* Background Video (full-bleed, no 120% scale) */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Content Container */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-12 flex flex-col justify-between min-h-screen max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-auto">
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-body text-white/80 mb-6 tracking-wide"
          >
            // Capabilities
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
          >
            Production
            <br />
            evolved
          </motion.h2>
        </div>

        {/* Three cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 + idx * 0.15 }}
              onClick={() => onOpenCardDetail?.(card.title)}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:bg-white/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/20 shadow-xl"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                {/* Left: 44x44 nested liquid-glass square */}
                <div className="w-[44px] h-[44px] rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 fill-current text-white"
                  >
                    <path d={card.iconPath} />
                  </svg>
                </div>

                {/* Right: 4 small liquid-glass pill tags */}
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle spacer */}
              <div className="flex-1" />

              {/* Bottom section */}
              <div className="mt-6">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none flex items-center justify-between">
                  <span>{card.title}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </h3>

                <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
                  {card.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info line */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10 text-xs font-body text-white/60 gap-4">
          <div>
            AETHERIA SPACE INC. © 2026 — NEXT-GEN DEEP SPACE INFRASTRUCTURE
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Safety Specs</span>
            <span className="hover:text-white cursor-pointer transition-colors">Telemetry API</span>
            <span className="hover:text-white cursor-pointer transition-colors">Launch Schedule</span>
          </div>
        </div>
      </div>
    </section>
  );
};
