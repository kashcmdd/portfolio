import React from 'react';
import { motion } from 'motion/react';
import { warriorDetails } from '../data/portfolioData';
import { Sparkles, Terminal, Code, Cpu, Target, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative w-full bg-[#0a0a0a] text-white py-20 md:py-28 px-6 md:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col gap-3 mb-12"
        >
          <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em]">
            <span className="w-8 h-px bg-neutral-800" />
            <span>ABOUT THE DEVELOPER</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display italic text-white tracking-tight">
            Curious by nature, <span className="accent-text-gradient">driven by code</span>.
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bio Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-7 liquid-glass rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-6">
              <div className="relative shrink-0">
                <img
                  src={warriorDetails.avatarUrl}
                  alt={`${warriorDetails.name} Avatar`}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black" />
              </div>
              <div>
                <h3 className="text-xl font-body font-semibold text-white flex items-center gap-2">
                  <span>{warriorDetails.name}</span>
                </h3>
                <p className="text-xs font-body text-neutral-400">{warriorDetails.title}</p>
              </div>
            </div>

            <p className="text-base md:text-lg font-body font-light text-neutral-200 leading-relaxed mb-6">
              {warriorDetails.bio}
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-6">
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-body mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
                Development Philosophy
              </div>
              <p className="text-sm font-body font-light text-neutral-300 italic">
                "{warriorDetails.philosophy}"
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-center">
              <div className="liquid-glass rounded-2xl p-3 border border-white/10">
                <div className="text-2xl font-display italic text-white font-bold">Self-Taught</div>
                <div className="text-[11px] font-body text-neutral-400 mt-0.5">Continuous Learning</div>
              </div>
              <div className="liquid-glass rounded-2xl p-3 border border-white/10">
                <div className="text-2xl font-display italic text-white font-bold">Web & Bots</div>
                <div className="text-[11px] font-body text-neutral-400 mt-0.5">Two Fronts</div>
              </div>
              <div className="liquid-glass rounded-2xl p-3 border border-white/10 col-span-2 sm:col-span-1">
                <div className="text-2xl font-display italic text-white font-bold">Design-Focused</div>
                <div className="text-[11px] font-body text-neutral-400 mt-0.5">UI & Polish</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Goals & Experience Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Goals Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="liquid-glass rounded-3xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-body mb-4 font-semibold">
                <Target className="w-4 h-4 text-[#89AACC]" />
                Long-Term Aspirations
              </div>
              <ul className="space-y-3 font-body text-xs sm:text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC] mt-1.5 shrink-0" />
                  <span>Building high-quality, impactful software products.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC] mt-1.5 shrink-0" />
                  <span>Creating robust developer tools & open-source packages.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC] mt-1.5 shrink-0" />
                  <span>Mastering advanced cloud system design & distributed databases.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC] mt-1.5 shrink-0" />
                  <span>Scaling Discord bots and REST API services for thousands of active users.</span>
                </li>
              </ul>
            </motion.div>

            {/* Beyond Coding Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="liquid-glass rounded-3xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-body mb-3 font-semibold">
                <Compass className="w-4 h-4 text-[#4E85BF]" />
                Beyond Coding
              </div>
              <p className="text-xs sm:text-sm font-body font-light text-neutral-300 leading-relaxed">
                Outside of active development, I explore emerging web technologies, study software architecture, experiment with novel UI design patterns, and contribute to personal open-source projects.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
