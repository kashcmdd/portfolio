import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { X, CheckCircle2, Target } from 'lucide-react';
import { DemoPlayer } from './DemoPlayer';
import { SmartImage } from './SmartImage';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ShareBar } from './ShareBar';
import { projectUrl } from '../utils/share';
import { useFocusTrap } from '../utils/useFocusTrap';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>(Boolean(project));
  const [demoPlayerOpen, setDemoPlayerOpen] = useState(false);

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
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          tabIndex={-1}
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
              <SmartImage
                src={project.image}
                alt={project.title}
                ratio="2 / 1"
                priority
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
              {/* What the project is worth, stated before the feature list so a
                  skimming reader gets the point even if they read nothing else. */}
              {project.outcome && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#89AACC]/25 bg-[#89AACC]/10 px-3 py-2 text-xs font-body text-neutral-200 sm:text-sm">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#89AACC]" aria-hidden="true" />
                  <span>{project.outcome}</span>
                </p>
              )}
            </div>

          {/* Tech Stack Tags */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-2.5 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#89AACC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                Technologies & Frameworks
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

            {/* System diagram, when the project has one. Placed after the
                highlights so the bullets are the summary and the diagram is
                the detail a reader can choose to go into. */}
            {project.architecture && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-3 font-medium">
                  How It Fits Together
                </div>
                <ArchitectureDiagram arch={project.architecture} />
              </div>
            )}

            {/* Live numbers, only when there are real ones to show. A bot case
                study is the one place a generic portfolio has no proof; a stat
                with no source would be worse than no stat. */}
            {project.stats && project.stats.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center"
                  >
                    <div className="text-lg font-body font-semibold text-white">{stat.value}</div>
                    <div className="mt-0.5 text-[11px] font-body uppercase tracking-wider text-neutral-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* The command surface. For a bot, this is the closest thing to a
                feature list a user can actually act on, and unlike a screenshot
                it says whether the bot does anything useful in a server. */}
            {project.commands && project.commands.length > 0 && (
              <details className="group mt-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-body font-medium uppercase tracking-wider text-neutral-400">
                  Command surface
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <dl className="space-y-2 px-4 pb-4">
                  {project.commands.map((command) => (
                    <div key={command.group} className="flex gap-3 text-xs font-body">
                      <dt className="w-32 shrink-0 font-mono uppercase tracking-wider text-[#89AACC]">
                        {command.group}
                      </dt>
                      <dd className="text-neutral-300">{command.detail}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}

            {/* Interactive Demo Section (only shown if project has a demo source) */}
            {(project.demoUrl || project.codePenId || project.codeSandboxId) && (
              <div className="p-4 rounded-2xl bg-[#89AACC]/10 border border-[#89AACC]/30">
                <div className="text-xs uppercase tracking-wider text-[#89AACC] font-body mb-2 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="9.9 9.9 9.9 14.1 14.1 14.1 14.1 9.9"/>
                  </svg>
                  Interactive Demo
                </div>
                <div className="relative aspect-video rounded-xl bg-[#0a0a0a] border border-[#89AACC]/20 overflow-hidden group cursor-pointer hover:border-[#89AACC]/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#89AACC]/20 to-[#0a0a0a]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setDemoPlayerOpen(true)}
                        className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-[#89AACC] hover:bg-[#89AACC]/20 transition-all duration-300 group-hover:scale-110"
                        aria-label="Launch Interactive Demo"
                      >
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21 5,3"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] to-transparent">
                    <h4 className="text-sm font-body font-semibold text-white mb-1">
                      Live Project Preview
                    </h4>
                    <p className="text-xs font-body text-neutral-400">
                      Interactive demonstration of key features and UI patterns used in this project
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {project.demoFeatures?.map((feature) => (
                    <div
                      key={feature}
                      className="text-center p-2 rounded-lg bg-[#89AACC]/10 border border-[#89AACC]/20"
                    >
                      <div className="text-xs font-body text-[#89AACC] font-semibold">
                        {feature}
                      </div>
                    </div>
                  )) || [
                    'Responsive Design',
                    'Interactive UI',
                    'Modern Framework',
                    'Production Ready'
                  ].slice(0, 4).map((feature) => (
                    <div
                      key={feature}
                      className="text-center p-2 rounded-lg bg-[#89AACC]/10 border border-[#89AACC]/20"
                    >
                      <div className="text-xs font-body text-[#89AACC] font-semibold">
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-wrap gap-3 px-6 py-4 sm:px-8 border-t border-white/10">
              {/* Bot projects lead with the action a visitor actually wants:
                  adding the bot, not reading about it. Rendered only when a real
                  invite exists, so there is never a dead "Add to server" button. */}
              {project.inviteUrl && (
                <a
                  href={project.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 accent-gradient text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:opacity-90 transition-opacity font-body cursor-pointer shadow-lg text-center inline-flex items-center justify-center gap-2"
                >
                  <span>Add to Discord</span>
                </a>
              )}
              {project.supportUrl && (
                <a
                  href={project.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass rounded-full py-2.5 px-5 text-sm font-medium text-white hover:bg-white/20 transition-colors font-body cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Support server</span>
                </a>
              )}
              {/* The modal is a quick read; the generated page is the permalink a
                  reader can quote or open without JavaScript. */}
              <a
                href={`projects/${project.id}/`}
                className="liquid-glass rounded-full py-2.5 px-5 text-sm font-medium text-white hover:bg-white/20 transition-colors font-body cursor-pointer inline-flex items-center justify-center gap-2"
              >
                Read full case study
              </a>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 accent-gradient text-black font-semibold rounded-full py-2.5 px-5 text-sm hover:opacity-90 transition-opacity font-body cursor-pointer shadow-lg text-center inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 5.94 8.23c-3.07.44-5.66 1.81-7.12 4.27m9 6V9"/>
                  </svg>
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

            {/* The project has its own canonical static page, so sharing points
                there rather than at the SPA hash. projectUrl() is the same helper
                the article pages use, so the shared link cannot drift from the
                URL the generator writes. */}
            <div className="border-t border-white/10 pt-4 mt-2">
              <ShareBar url={projectUrl(project.id)} title={project.title} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Demo Player */}
      <DemoPlayer
        isOpen={demoPlayerOpen}
        onClose={() => setDemoPlayerOpen(false)}
        title={project.title}
        demoUrl={project.demoUrl}
        codePenId={project.codePenId}
        codeSandboxId={project.codeSandboxId}
        description={project.demoDescription}
      />
    </AnimatePresence>
  );
};
