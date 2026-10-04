import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Project, ProjectKind } from '../types';
import { projectsData } from '../data/portfolioData';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { activateOnKey } from '../utils/keyboard';
import { SmartImage } from './SmartImage';

// The bento cards already pin their box with an aspect utility. Translating that
// same Tailwind class into a plain "w / h" string is what lets the browser know
// an image's ratio before it has the file, which is what stops the card from
// resizing when the image lands. Read off the data so a new ratio needs no
// second edit here.
const RATIOS: Record<string, string> = {
  'aspect-[16/9]': '16 / 9',
  'aspect-[16/10]': '16 / 10',
  'aspect-[4/3]': '4 / 3',
};

interface SelectedWorksSectionProps {
  onSelectProject: (project: Project) => void;
}

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'az', label: 'A–Z' },
  { id: 'za', label: 'Z–A' },
  { id: 'tech', label: 'Primary tech' },
] as const;

type SortId = (typeof SORTS)[number]['id'];

export const SelectedWorksSection: React.FC<SelectedWorksSectionProps> = ({
  onSelectProject,
}) => {
  const [kind, setKind] = useState<ProjectKind | 'All'>('All');
  const [sort, setSort] = useState<SortId>('featured');

  const kinds = useMemo<ProjectKind[]>(
    () => Array.from(new Set(projectsData.map((p) => p.kind))),
    []
  );

  const visible = useMemo(() => {
    const filtered = kind === 'All' ? projectsData : projectsData.filter((p) => p.kind === kind);
    // "Featured" deliberately keeps the hand-tuned bento order rather than
    // sorting, because the column spans and the 7/5 rhythm were chosen to pair
    // up in the current sequence.
    if (sort === 'featured') return filtered;
    const sorted = [...filtered];
    if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === 'tech') sorted.sort((a, b) => (a.tags[0] ?? '').localeCompare(b.tags[0] ?? ''));
    return sorted;
  }, [kind, sort]);

  // The bento column spans were hand-picked for the full curated set, where the
  // 12/7/5/5/7 rhythm lines up. Once a filter or a sort reorders the list those
  // spans stop composing and leave holes, so anything that is not the untouched
  // featured set falls back to uniform full-width rows.
  const bentoMode = visible.length === projectsData.length && sort === 'featured';

  const colClassFor = (project: Project) => {
    if (!bentoMode) return 'md:col-span-6';
    return project.colSpanDesktop === 12
      ? 'md:col-span-12'
      : project.colSpanDesktop === 7
        ? 'md:col-span-7'
        : 'md:col-span-5';
  };
  return (
    <section id="work" className="relative w-full bg-[#0a0612] text-white py-20 md:py-28 px-6 md:px-10 lg:px-16 overflow-hidden">
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
              className="relative inline-flex items-center gap-2 rounded-full text-xs font-medium px-5 py-2.5 bg-[#150f22] text-white hover:bg-[#211832] border border-white/10 transition-colors cursor-pointer font-body"
            >
              <span>Explore All Case Studies</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
            </button>
          </div>
        </motion.div>

        {/* Filter + Sort controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div
            role="group"
            aria-label="Filter projects by type"
            className="flex flex-wrap items-center gap-2"
          >
            {(['All', ...kinds] as const).map((option) => {
              const active = kind === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-xs font-body font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-black border-white'
                      : 'bg-[#150f22] text-neutral-300 border-white/10 hover:bg-[#211832] hover:border-white/20'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="project-sort"
              className="text-xs font-body text-neutral-400 uppercase tracking-widest"
            >
              Sort
            </label>
            <div className="relative">
              <select
                id="project-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortId)}
                className="appearance-none rounded-full bg-[#150f22] border border-white/10 text-neutral-200 text-xs font-body pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42]"
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id} className="bg-[#150f22]">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* The count is announced rather than only shown, so a screen reader
            user hears the list actually changed after activating a chip. */}
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          {kind === 'All' ? '' : ` in ${kind}`}, sorted by{' '}
          {SORTS.find((s) => s.id === sort)?.label}.
        </p>

        {visible.length === 0 ? (
          <p className="text-sm font-body text-neutral-400 py-12 text-center border border-dashed border-white/10 rounded-3xl">
            No projects in this category yet.
          </p>
        ) : (
        /* Bento Grid (12 / 7 / 5 / 5 / 7) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {visible.map((project, idx) => {
            const isHero = !bentoMode ? false : project.colSpanDesktop === 12;
            const colClass = colClassFor(project);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                onClick={() => onSelectProject(project)}
                onKeyDown={activateOnKey(() => onSelectProject(project))}
                role="button"
                tabIndex={0}
                aria-label={`Open case study: ${project.title}`}
                className={`${colClass} group relative bg-[#150f22] border border-neutral-800/80 rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42] ${project.aspectRatio}`}
              >
                    {/* Background Image */}
                    <SmartImage
                      src={project.image}
                      alt={project.title}
                      ratio={RATIOS[project.aspectRatio] || '4 / 3'}
                      sizes="(min-width: 768px) 58vw, 100vw"
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
                    <h3
                      className={`font-body font-semibold text-white tracking-tight ${
                        isHero ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'
                      }`}
                    >
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
                      <div className="relative bg-[#0a0612] text-white px-5 py-2.5 rounded-full text-sm font-body font-medium flex items-center gap-2">
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

          {/* Interactive Demo Badge. Keyed on any demo source, not just a custom
              demoUrl, so a CodePen/CodeSandbox-only project still shows it. */}
          {(project.demoUrl || project.codePenId || project.codeSandboxId) && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500/60" title="Interactive Demo Available"></div>
              <span className="text-[10px] font-mono text-neutral-500">Live Demo</span>
            </div>
          )}
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
