import React from 'react';
import { motion } from 'motion/react';
import { testimonialsData } from '../data/portfolioData';
import { safeHref } from '../utils/url';
import { Quote } from 'lucide-react';

/**
 * Renders nothing until real testimonials exist.
 *
 * The strongest portfolios are the ones that cite other people. The failure mode
 * is an "Add testimonial" slot filled with invented or generic praise, which a
 * reader spots instantly and which costs more trust than an empty page. So the
 * section is wired up and list-driven, and simply disappears while the list is
 * empty (see testimonialsData in portfolioData.ts).
 */
export const TestimonialsSection: React.FC = () => {
  if (testimonialsData.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-10 lg:px-16 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em] mb-2">
            <span className="w-8 h-px bg-neutral-800" />
            <span>TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight">
            What people <span className="font-display italic text-white">say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonialsData.map((testimonial, idx) => (
            <motion.figure
              key={`${testimonial.author}-${idx}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: Math.min(idx * 0.1, 0.3), ease: 'easeOut' }}
              className="liquid-glass flex flex-col rounded-3xl border border-white/10 p-6 sm:p-8"
            >
              <Quote className="h-6 w-6 text-[#FF8C42]" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm sm:text-base font-body font-light leading-relaxed text-neutral-200">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 text-xs font-body text-neutral-400">
                <span className="font-semibold text-white">{testimonial.author}</span>
                {testimonial.role ? ` — ${testimonial.role}` : ''}
                {safeHref(testimonial.url) && (
                  <>
                    {' · '}
                    <a
                      href={safeHref(testimonial.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF8C42] hover:underline"
                    >
                      Source
                    </a>
                  </>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
