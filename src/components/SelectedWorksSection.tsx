import React from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { projectsData } from '../data/portfolioData';
import { ArrowUpRight, Github, ExternalLink, Sparkles } from 'lucide-react';

interface SelectedWorksSectionProps {
  onSelectProject: (project: Project) => void;
}

export const SelectedWorksSection: React.FC<SelectedWorksSectionProps> = ({
  onSelectProject,
}) => {
  return (
    <section id="work" className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em] mb-2">
              <span className="w-8 h-px bg-neutral-800" />
              <span>SELECTED WORK</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight">
              Featured <span className="font-display italic text-white">projects</span>
            </h2>
            <p className="text-sm md:text-base font-body font-light text-neutral-400 mt-2 max-w-lg">
              A selection of projects I've worked on, from concept and architecture to production deployment.
            </p>
          </div>

          <div className="hidden md:inline-flex relative group">
            <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
            <button
              onClick={() => onSelectProject(projectsData[0])}
              className="relative inline-flex items-center gap-2 rounded-full text-xs font-medium px-5 py-2.5 bg-[#141414] text-white hover:bg-[#1f1f1f] border border-white/10 transition-colors cursor-pointer font-body"
            >
              <span>Explore All Case Studies</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
            </button>
          </div>
        </motion.div>

        {/* Bento Grid (7 / 5 / 5 / 7) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projectsData.map((project, idx) => {
            const colClass =
              project.colSpanDesktop === 7 ? 'md:col-span-7' : 'md:col-span-5';

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                onClick={() => onSelectProject(project)}
                className={`${colClass} group relative bg-[#141414] border border-neutral-800/80 rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:border-neutral-700 ${project.aspectRatio}`}
              >
                {/* Background Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Halftone radial pattern overlay */}
                <div
                  className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                  }}
                />

                {/* Always-visible subtle bottom dark gradient for title accessibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Default Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end justify-between gap-4 z-10 transition-opacity duration-300 group-hover:opacity-20">
                  <div>
                    <span className="text-[11px] font-body text-neutral-400 uppercase tracking-widest block mb-1">
                      {project.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-body font-semibold text-white tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center shrink-0 text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Hover Backdrop Overlay with Glass & Pill */}
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 sm:p-8 z-20">
                  <div className="flex justify-between items-start">
                    <span className="liquid-glass px-3 py-1 rounded-full text-xs font-body text-neutral-300">
                      {project.category}
                    </span>
                    <div className="flex gap-2">
                      <span className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="my-auto text-center px-4">
                    {/* Hover Label Pill */}
                    <div className="inline-flex relative group/pill">
                      <span className="absolute -inset-[1.5px] rounded-full accent-gradient opacity-100 animate-gradient-shift pointer-events-none" />
                      <div className="relative bg-[#0a0a0a] text-white px-5 py-2.5 rounded-full text-sm font-body font-medium flex items-center gap-2">
                        <span>View —</span>
                        <span className="font-display italic text-base font-normal">
                          {project.title}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-body font-light text-neutral-300 mt-4 line-clamp-2 max-w-md mx-auto">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/10 text-neutral-300 text-[11px] font-body px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
