import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CinematicVideoBackground, VIDEO_SOURCES } from './CinematicVideoBackground';
import { warriorDetails } from '../data/portfolioData';
import { ArrowUpRight, Eye } from 'lucide-react';

interface HeroSectionProps {
  onNavigateToWork: () => void;
  onOpenContactModal: () => void;
}

const ROLES = ["Web Dev", "Discord Bot Dev"];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateToWork,
  onOpenContactModal,
}) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to('.name-reveal', {
        opacity: 1,
        y: 0,
        duration: 1.0,
        delay: 0.1,
      }).to(
        '.blur-in',
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.8,
          stagger: 0.1,
        },
        '-=0.6'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSelectVideo = (index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col justify-between items-center text-center select-none pt-24 pb-8 md:pb-12"
    >
      <CinematicVideoBackground activeIndex={activeVideo} />

      <div className="relative z-10 my-auto max-w-5xl px-4 sm:px-6 flex flex-col items-center w-full my-auto">
        <div className="blur-in opacity-0 translate-y-4 filter blur-md mb-4 sm:mb-6">
          <div className="liquid-glass rounded-full pl-2 pr-4 py-1 text-[11px] sm:text-xs font-body text-neutral-300 uppercase tracking-[0.15em] flex items-center gap-2.5 border border-white/10 shadow-lg hover:border-white/30 transition-all cursor-default group">
            <div className="relative shrink-0">
              <img
                src={warriorDetails.avatarUrl}
                alt={`${warriorDetails.name} Avatar`}
                className="w-6 h-6 rounded-full object-cover border border-white/30 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
            </div>
            <span>{warriorDetails.name.toUpperCase()} · PORTFOLIO '26</span>
          </div>
        </div>

        <h1 className="name-reveal opacity-0 translate-y-10 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-white mb-4 sm:mb-6 font-bold drop-shadow-2xl">
          {warriorDetails.name}
        </h1>

        <div className="blur-in opacity-0 translate-y-4 filter blur-md text-base sm:text-xl md:text-2xl text-neutral-200 font-body font-light mb-4 sm:mb-6 max-w-2xl">
          A{' '}
          <span
            key={roleIndex}
            className="font-display italic text-white font-semibold animate-role-fade-in inline-block px-1 accent-text-gradient"
          >
            {ROLES[roleIndex]}
          </span>{' '}
          building fast, purposeful software.
        </div>

        <p className="blur-in opacity-0 translate-y-4 filter blur-md text-xs sm:text-sm md:text-base text-neutral-300 max-w-lg font-body font-light leading-relaxed mb-8">
          Crafting high-scale Discord bot engines, REST API platforms, and fluid liquid-glass web applications.
        </p>

        <div className="blur-in opacity-0 translate-y-4 filter blur-md flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 w-full px-2">
          <div className="relative group w-full sm:w-auto">
            <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
            <button
              onClick={onNavigateToWork}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-semibold px-7 py-3.5 bg-white text-black hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer font-body shadow-2xl min-h-[44px]"
            >
              <span>Explore Projects</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative group w-full sm:w-auto">
            <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
            <button
              onClick={onOpenContactModal}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-medium px-7 py-3.5 border border-white/20 bg-[#0a0a0a]/80 backdrop-blur-md text-white hover:border-white/40 transition-all duration-300 transform hover:scale-105 cursor-pointer font-body min-h-[44px]"
            >
              <span>Get in Touch</span>
            </button>
          </div>
        </div>

        <div className="blur-in opacity-0 translate-y-4 filter blur-md w-full max-w-xl">
          <div className="liquid-glass rounded-full p-1.5 border border-white/15 bg-black/40 backdrop-blur-xl flex items-center justify-between gap-1 shadow-2xl overflow-x-auto">
            <div className="hidden sm:flex items-center gap-1.5 pl-3 pr-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider shrink-0">
              <Eye className="w-3.5 h-3.5 text-[#89AACC]" />
              <span>ATMOSPHERE</span>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-1">
              {VIDEO_SOURCES.map((v, idx) => {
                const isActive = activeVideo === idx;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVideo(idx)}
                    disabled={isTransitioning}
                    className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-300 cursor-pointer whitespace-nowrap min-h-[36px] flex-1 sm:flex-initial ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
