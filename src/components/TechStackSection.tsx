import React, { useState } from 'react';
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
  Check,
  Copy,
} from 'lucide-react';

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
};

export const TechStackSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const categories = ['All', 'Frontend', 'Backend', 'Databases', 'Tools'];

  const filteredSkills =
    activeCategory === 'All'
      ? techSkillsData
      : techSkillsData.filter((s) => s.category === activeCategory);

  const handleCopyInstallCommand = () => {
    navigator.clipboard.writeText('npm install react express discord.js typescript tailwindcss');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="stack" className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-12 lg:px-16 overflow-hidden">
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
              <Terminal className="w-4 h-4 text-[#89AACC]" />
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
