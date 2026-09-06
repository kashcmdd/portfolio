import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { HlsVideoBackground } from './HlsVideoBackground';
import { warriorDetails } from '../data/portfolioData';
import { ArrowUpRight, MessageSquare, Heart } from 'lucide-react';

interface ContactFooterProps {
  onOpenContactModal: () => void;
  onNavigateTop: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onOpenContactModal,
  onNavigateTop,
}) => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  // Marquee animation with GSAP
  useEffect(() => {
    if (!marqueeRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.marquee-inner', {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: 'none',
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" className="relative w-full bg-[#0a0a0a] text-white overflow-hidden pt-20 pb-10">
      {/* Background HLS Video (Vertically flipped) */}
      <HlsVideoBackground flipVertical />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1] pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        {/* GSAP Infinite Marquee */}
        <div ref={marqueeRef} className="w-full overflow-hidden whitespace-nowrap mb-16 py-4 border-y border-white/10">
          <div className="marquee-inner inline-block flex items-center gap-8 font-display italic text-3xl sm:text-5xl text-neutral-400 font-normal">
            <span>BUILDING THE FUTURE</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>WEB DESIGN & DEV</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>DISCORD BOTS & UTILITIES</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>KASHHCMD PORTFOLIO '26</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>BUILDING THE FUTURE</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>WEB DESIGN & DEV</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>DISCORD BOTS & UTILITIES</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
            <span>KASHHCMD PORTFOLIO '26</span>
            <span className="text-xs font-mono text-neutral-600">✦</span>
          </div>
        </div>

        {/* Main CTA Block */}
        <div className="flex flex-col items-center text-center py-10 my-6">
          {/* Status badge with avatar */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-body mb-6">
            <img
              src={warriorDetails.avatarUrl}
              alt={`${warriorDetails.name} Avatar`}
              className="w-5 h-5 rounded-full object-cover border border-emerald-400/40"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for select projects & collaborations</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-display italic text-white tracking-tight leading-tight max-w-3xl mb-8">
            Let's build something <span className="accent-text-gradient font-bold">remarkable</span> together.
          </h2>

          {/* Email button with gradient hover border ring */}
          <div className="relative group">
            <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
            <button
              onClick={onOpenContactModal}
              className="relative inline-flex items-center gap-3 text-base sm:text-lg font-body font-medium rounded-full px-8 py-4 bg-white text-black hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-2xl"
            >
              <span>Say Hello</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-body text-neutral-400">
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateTop}
              className="group flex items-center gap-1.5 text-white hover:text-[#89AACC] transition-colors cursor-pointer"
            >
              <span className="font-display italic font-bold text-sm">{warriorDetails.name}</span>
              <span className="text-[10px] text-neutral-500 font-mono">© 2026</span>
            </button>
            <span className="text-neutral-700">•</span>
            <span>Crafted with care</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={onOpenContactModal}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discord</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
