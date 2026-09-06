import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Code, Zap, Award } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Self-Taught Engineering",
      description: "Driven by passion, curiosity, and relentless practical building.",
    },
    {
      icon: Code,
      value: "20+",
      label: "Digital Projects Built",
      description: "Full-stack apps, Discord frameworks, APIs, and UI libraries.",
    },
    {
      icon: Zap,
      value: "10k+",
      label: "Discord Community Users",
      description: "Bots and infrastructure serving active users in real-time.",
    },
    {
      icon: Award,
      value: "99.9%",
      label: "Target System Uptime",
      description: "Architected with error boundaries, logging, and process monitors.",
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
                className="liquid-glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
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
