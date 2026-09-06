import React from 'react';
import { motion } from 'motion/react';
import { HlsVideoBackground } from './HlsVideoBackground';
import { Code2, Bot, Server, Database, ArrowRight } from 'lucide-react';

interface CapabilitiesSectionProps {
  onSelectCapability?: (title: string) => void;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({
  onSelectCapability,
}) => {
  const capabilities = [
    {
      id: 'fullstack-web',
      icon: Code2,
      tags: ['React 19', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      title: 'Full-Stack Web Dev',
      body: 'Building fast, responsive single-page and server-rendered web applications with clean component structure, state management, and pixel-perfect UI execution.',
    },
    {
      id: 'discord-bots',
      icon: Bot,
      tags: ['Discord.js v14', 'Custom Bots', 'Slash Commands', 'Automation'],
      title: 'Discord Bot Dev',
      body: 'Architecting high-uptime Discord bots with modular event handlers, database synchronization, interactive buttons, select menus, and real-time dashboard integrations.',
    },
    {
      id: 'rest-apis',
      icon: Server,
      tags: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth'],
      title: 'REST API & Backend',
      body: 'Designing scalable backend microservices, secure REST endpoints, middleware auth pipelines, rate limiting, and seamless data payload formatting.',
    },
    {
      id: 'cloud-db',
      icon: Database,
      tags: ['MongoDB', 'MySQL', 'SQLite', 'Pterodactyl Panel'],
      title: 'Databases & Cloud Ops',
      body: 'Configuring structured relational & NoSQL databases, automated Vercel deployments, container process management, and live server health telemetry.',
    },
  ];

  return (
    <section
      id="capabilities"
      className="relative w-full min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col justify-between py-24"
    >
      {/* Background Video */}
      <HlsVideoBackground
        fallbackSource="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none" />

      {/* Content Layer (z-10) */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 flex flex-col justify-between min-h-screen max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-auto">
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-body text-neutral-400 mb-6 uppercase tracking-[0.3em] font-medium flex items-center gap-2"
          >
            <span className="w-8 h-px bg-neutral-700" />
            // CAPABILITIES & WHAT I DO
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
          >
            Engineering
            <br />
            evolved
          </motion.h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 mb-6">
          {capabilities.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 + idx * 0.12 }}
                onClick={() => onSelectCapability?.(item.title)}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[350px] flex flex-col justify-between hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-white/10 hover:border-white/25 shadow-2xl"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  {/* Left: 44x44 nested liquid-glass square */}
                  <div className="w-[44px] h-[44px] rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <IconComp className="h-5 w-5 text-white" />
                  </div>

                  {/* Right: small liquid-glass tags */}
                  <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-neutral-300 font-body whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Middle spacer */}
                <div className="flex-1" />

                {/* Bottom section */}
                <div className="mt-6">
                  <h3 className="font-display italic text-white text-2xl sm:text-3xl tracking-tight leading-tight flex items-center justify-between mb-2">
                    <span>{item.title}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 font-body font-light leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info line */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10 text-xs font-body text-neutral-400 gap-4">
          <div>
            WARRIOROG · FULL-STACK & DISCORD BOT ARCHITECTURE
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Clean Code</span>
            <span className="hover:text-white cursor-pointer transition-colors">High Uptime</span>
            <span className="hover:text-white cursor-pointer transition-colors">Modern UI/UX</span>
          </div>
        </div>
      </div>
    </section>
  );
};
