import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { techSkillsData } from '../data/portfolioData';
import {
  Code2,
  Globe,
  FileCode,
  Palette,
  Layout,
  Server,
  Cpu,
  Bot,
  Network,
  Database,
  Table,
  HardDrive,
  GitBranch,
  Terminal,
  Cloud,
  Sparkles,
  Braces,
  Activity,
  Container,
  Workflow,
  SquareTerminal,
  Check,
  Copy,
} from 'lucide-react';
import SkillsRadar, { LEVEL_SCORE } from './SkillsRadar';

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Globe,
  FileCode,
  Palette,
  Layout,
  Server,
  Cpu,
  Bot,
  Network,
  Database,
  Table,
  HardDrive,
  GitBranch,
  Terminal,
  Cloud,
  Sparkles,
  Braces,
  Activity,
  Container,
  Workflow,
  SquareTerminal,
};

const LEVELS = ['Expert', 'Advanced', 'Proficient'] as const;

// Ordered strongest to weakest; the legend and the bar segments both read off
// this list, so a new level only needs one entry here.
const LEVEL_BAR: Record<(typeof LEVELS)[number], string> = {
  Expert: 'bg-gradient-to-r from-[#FF8C42] to-[#B23A0F]',
  Advanced: 'bg-[#B23A0F]/70',
  Proficient: 'bg-white/20',
};

const LEVEL_DOT: Record<(typeof LEVELS)[number], string> = {
  Expert: 'bg-[#FF8C42]',
  Advanced: 'bg-[#B23A0F]',
  Proficient: 'bg-neutral-500',
};

// TechSkill.level is an open string, so every lookup has to be able to miss.
// The maps stay keyed by the level union so that adding a level is a compile
// error here rather than a silently unstyled bar at runtime.
const levelBarClass = (level: string) =>
  LEVEL_BAR[level as (typeof LEVELS)[number]] ?? 'bg-white/20';

export const TechStackSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);
  // Cleared on unmount so the reset does not fire after the section is gone.
  const copyTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    []
  );

  const categories = ['All', 'Frontend', 'Backend', 'Databases', 'DevOps', 'Tools'];

  const filteredSkills =
    activeCategory === 'All'
      ? techSkillsData
      : techSkillsData.filter((s) => s.category === activeCategory);

  // Proficiency was previously only ever a text badge, so the grid could not
  // answer "where am I strongest" without reading all 21 cards. Grouping the
  // same data by category makes the shape of the stack readable at a glance,
  // and each bar doubles as the category filter below.
  const categoryBreakdown = Array.from(new Set(techSkillsData.map((s) => s.category))).map(
    (category) => {
      const inCategory = techSkillsData.filter((s) => s.category === category);
      return {
        category,
        total: inCategory.length,
        levels: LEVELS.map((level) => ({
          level,
          count: inCategory.filter((s) => s.level === level).length,
        })),
      };
    }
  );

  const handleCopyInstallCommand = () => {
    // Best-effort copy; a refused clipboard must not surface as an unhandled
    // rejection, and the label still confirms the intent.
    navigator.clipboard
      ?.writeText('npm install react express discord.js typescript tailwindcss')
      .catch(() => {});
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="stack" className="relative w-full bg-[#0a0612] text-white py-20 md:py-28 px-6 md:px-12 lg:px-16 overflow-hidden">
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
              <span>TECHNOLOGIES & TOOLS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-white font-medium tracking-tight">
              My core <span className="font-display italic text-white">stack</span>
            </h2>
            <p className="text-sm md:text-base font-body font-light text-neutral-400 mt-2 max-w-lg">
              Languages, libraries, frameworks, and cloud deployment engines I use daily to turn ideas into reality.
            </p>
          </div>

          {/* Copy Terminal Command Button */}
          <button
            onClick={handleCopyInstallCommand}
            className="liquid-glass rounded-2xl p-3 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 cursor-pointer text-left self-start md:self-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-[#FF8C42]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase">STACK COMMAND</div>
              <div className="text-xs font-mono text-white flex items-center gap-1.5">
                <span>npm i react express discord.js...</span>
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              </div>
            </div>
          </button>
        </motion.div>

        <SkillsRadar skills={techSkillsData} />

        {/* Proficiency breakdown: one stacked bar per category, click to filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="liquid-glass rounded-3xl border border-white/10 p-5 sm:p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-xs font-body uppercase tracking-[0.25em] text-neutral-400">
              Proficiency by category
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              {LEVELS.map((level) => (
                <span
                  key={level}
                  className="flex items-center gap-1.5 text-[10px] font-body text-neutral-400"
                >
                  <span className={`w-2 h-2 rounded-full ${LEVEL_DOT[level]}`} />
                  {level}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {categoryBreakdown.map((row) => {
              const isActive = activeCategory === row.category;
              return (
                <button
                  key={row.category}
                  onClick={() => setActiveCategory(isActive ? 'All' : row.category)}
                  aria-pressed={isActive}
                  className="group grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 sm:gap-4 text-left cursor-pointer"
                >
                  <span
                    className={`text-sm font-body transition-colors truncate ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'
                    }`}
                  >
                    {row.category}
                  </span>

                  {/* flex-basis in % so each bar is directly comparable */}
                  <span className="flex h-2.5 rounded-full overflow-hidden bg-white/5">
                    {row.levels.map(({ level, count }) =>
                      count === 0 ? null : (
                        <span
                          key={level}
                          className={`h-full transition-opacity ${LEVEL_BAR[level]} ${
                            isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'
                          }`}
                          style={{ flexBasis: `${(count / row.total) * 100}%` }}
                        />
                      )
                    )}
                  </span>

                  <span className="text-xs font-body text-neutral-500 tabular-nums text-right">
                    {row.total}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-body font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-black shadow-lg'
                  : 'liquid-glass text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, idx) => {
            const IconComponent = iconMap[skill.icon] || Code2;
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5 text-neutral-200" />
                  </div>
                  <span className="text-[10px] font-body uppercase tracking-wider text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {skill.level}
                  </span>
                </div>

                <h3 className="text-base font-body font-semibold text-white mb-1">
                  {skill.name}
                </h3>
                <p className="text-xs font-body font-light text-neutral-400 leading-relaxed">
                  {skill.description}
                </p>

                {/* Per-skill bar. The level used to be a word in a badge, which
                    is not comparable at a glance across 21 cards; a bar is. */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-body uppercase tracking-wider text-neutral-500">
                      {skill.level}
                    </span>
                    <span className="text-[10px] font-body tabular-nums text-neutral-500">
                      {LEVEL_SCORE[skill.level] ?? 0}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full bg-white/5 overflow-hidden"
                    role="meter"
                    aria-valuenow={LEVEL_SCORE[skill.level] ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill.name} proficiency`}
                  >
                    <motion.div
                      className={`h-full rounded-full ${levelBarClass(skill.level)}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${LEVEL_SCORE[skill.level] ?? 0}%` }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.8, delay: 0.1 + idx * 0.04, ease: 'easeOut' }}
                    />
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
