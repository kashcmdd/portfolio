import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { X, ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenContactModal: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenContactModal,
}) => {
  if (!project) return null;

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
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-2 font-medium">
              Key Architecture Highlights
            </div>
            <ul className="space-y-1.5 text-xs font-body text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>Asynchronous event loops & high-speed REST endpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>Zero-downtime containerized deployments & state persistence</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>Responsive, fluid UI with liquid glass visual tokens</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenContactModal();
              }}
              className="flex-1 accent-gradient text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:opacity-90 transition-opacity font-body cursor-pointer shadow-lg text-center"
            >
              Discuss Similar Project
            </button>
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
