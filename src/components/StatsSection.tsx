import React from 'react';
import { motion } from 'motion/react';
import { Layers, Bot, Terminal, Trophy } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Layers,
      value: "6",
      label: "Deep Case Studies",
      description: "Long-form write-ups on the systems, choices and trade-offs behind each build.",
    },
    {
      icon: Bot,
      value: "70+",
      label: "Nebula AI Tools",
      description: "A DeepSeek-backed tool layer that can read and change a live Discord server.",
    },
    {
      icon: Terminal,
      value: "25+",
      label: "Music Bot Commands",
      description: "Queue, filters, lyrics, playlists and tiered playback behind one Lavalink pipeline.",
    },
    {
      icon: Trophy,
      value: "41",
      label: "Hand-Built Rank Icons",
      description: "The full Bronze-to-Champion ladder, drawn as SVG for the Rainbow Leaderboard.",
    },
  ];

  return (
    <section className="relative w-full bg-[#0a0a0a] text-white py-16 px-6 md:px-12 lg:px-16 overflow-hidden border-y border-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="liquid-glass panel-accent rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#89AACC]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Metric 0{idx + 1}</span>
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl font-display italic text-white font-bold tracking-tight mb-1 accent-text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-sm font-body font-semibold text-white mb-1">
                    {stat.label}
                  </div>
                  <p className="text-xs font-body font-light text-neutral-400 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
