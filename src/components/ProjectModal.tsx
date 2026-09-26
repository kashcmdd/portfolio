import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { X, Github, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Case studies run long, so the panel scrolls internally and the page behind
  // it has to stop moving.
  useEffect(() => {
    if (!project) return;
    bodyRef.current?.scrollTo({ top: 0 });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          className="liquid-glass-strong my-auto flex max-h-[calc(100dvh_-_1.5rem)] sm:max-h-[calc(100dvh_-_3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/20 text-white shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            ref={bodyRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-6 pb-6 sm:px-8 sm:pt-8"
          >
            {/* Banner Image */}
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6 border border-white/10">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="liquid-glass px-3 py-1 rounded-full text-xs font-body text-neutral-300 inline-block mb-1">
                  {project.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display italic text-white font-bold">
                  {project.title}
                </h2>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-body font-semibold text-white mb-2">
                {project.subtitle}
              </h3>
              <p className="text-xs sm:text-sm font-body font-light text-neutral-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Tech Stack Tags */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-2.5 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" /> Technologies & Frameworks
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="liquid-glass px-3 py-1 rounded-full text-xs font-body text-white border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Deliverables */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-2 font-medium">
                Key Architecture Highlights
              </div>
              <ul className="space-y-1.5 text-xs font-body text-neutral-300">
                {(project.highlights ?? [
                  'Asynchronous event loops & high-speed REST endpoints',
                  'Zero-downtime containerized deployments & state persistence',
                  'Responsive, fluid UI with liquid glass visual tokens',
                ]).map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#89AACC] shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex flex-wrap gap-3 px-6 py-4 sm:px-8 border-t border-white/10">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 accent-gradient text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:opacity-90 transition-opacity font-body cursor-pointer shadow-lg text-center inline-flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Live Site
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  project.liveUrl
                    ? 'liquid-glass rounded-full py-2.5 px-5 text-sm font-medium text-white hover:bg-white/20 transition-colors font-body cursor-pointer inline-flex items-center justify-center gap-2'
                    : 'flex-1 accent-gradient text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:opacity-90 transition-opacity font-body cursor-pointer shadow-lg text-center inline-flex items-center justify-center gap-2'
                }
              >
                <Github className="w-4 h-4" />
                View Repository
              </a>
            )}
            <button
              onClick={onClose}
              className="liquid-glass rounded-full py-2.5 px-5 text-sm font-medium text-white hover:bg-white/20 transition-colors font-body cursor-pointer"
            >
              Close Case Study
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
