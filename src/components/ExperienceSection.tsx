import React from 'react';
import { motion } from 'motion/react';
import { experienceData, projectsData } from '../data/portfolioData';
import { Project } from '../types';
import { ArrowUpRight, CircleDot } from 'lucide-react';
import { activateOnKey } from '../utils/keyboard';

interface ExperienceSectionProps {
  onSelectProject: (project: Project) => void;
}

// The timeline is built from the same project objects the work section uses, so
// the "view case study" action reuses the existing modal rather than introducing
// a second, thinner project view that would then have to be maintained too.
export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onSelectProject }) => {
  if (experienceData.length === 0) return null;

  return (
    <section
      id="experience"
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
            <span>EXPERIENCE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight">
            A timeline of <span className="font-display italic text-white">shipped work</span>
          </h2>
          <p className="text-sm md:text-base font-body font-light text-neutral-400 mt-2 max-w-xl">
            Independent work across web apps and Discord bots. Every entry links to the case
            study, with the architecture and the reasoning behind it.
          </p>
        </motion.div>

        <ol className="relative border-l border-white/10 ml-1.5">
          {experienceData.map((entry, idx) => {
            const project = entry.projectId
              ? projectsData.find((candidate) => candidate.id === entry.projectId)
              : undefined;

            return (
              <motion.li
                key={entry.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: Math.min(idx * 0.08, 0.32), ease: 'easeOut' }}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* The marker is decorative; the period beside it carries the
                    same meaning for a screen reader. */}
                <CircleDot
                  className="absolute -left-[9px] top-1.5 h-4 w-4 text-[#FF8C42] bg-[#0a0a0a]"
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-[#FF8C42] sm:w-24">
                    {entry.period}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-body font-semibold text-white">
                      {entry.title}
                    </h3>
                    <p className="text-xs font-body uppercase tracking-wider text-neutral-500 mt-0.5">
                      {entry.org}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm md:text-base font-body font-light text-neutral-300 leading-relaxed max-w-2xl">
                  {entry.summary}
                </p>

                {entry.stack && entry.stack.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {entry.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-body text-neutral-300"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}

                {project && (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    onKeyDown={activateOnKey(() => onSelectProject(project))}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141414] px-4 py-2 text-xs font-body font-medium text-white transition-colors hover:bg-[#1f1f1f] hover:border-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42]"
                    aria-label={`Open case study: ${entry.title}`}
                  >
                    <span>View case study</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
                  </button>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
