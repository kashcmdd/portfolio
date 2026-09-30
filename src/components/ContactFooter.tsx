import React, { useEffect, useRef } from 'react';
import { HlsVideoBackground } from './HlsVideoBackground';
import { warriorDetails } from '../data/portfolioData';
import { ArrowUpRight, MessageSquare, BookOpen, FileDown, FileText, LayoutGrid, Compass, Rss } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';
import { useMotionPref } from './MotionPrefProvider';

interface ContactFooterProps {
  onOpenContactModal: () => void;
  onNavigateTop: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onOpenContactModal,
  onNavigateTop,
}) => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const { reduced } = useMotionPref();

  // The marquee is below the fold, so GSAP is not imported until the footer is
  // near the viewport. A visitor who never scrolls this far never downloads it,
  // and one who does gets the animation as the footer slides in. Under reduced
  // motion the row is simply left static, which is the whole point.
  useEffect(() => {
    const target = marqueeRef.current;
    if (!target || reduced) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const start = () => {
      void import('gsap').then(({ gsap }) => {
        if (cancelled) return;
        ctx = gsap.context(() => {
          gsap.to('.marquee-inner', {
            xPercent: -50,
            repeat: -1,
            duration: 25,
            ease: 'none',
          });
        }, target);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(target);

    return () => {
      cancelled = true;
      observer.disconnect();
      ctx?.revert();
    };
  }, [reduced]);

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

        <NewsletterSignup />

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
            <a
              href={`${import.meta.env.BASE_URL}projects/`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Projects</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}journal/`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}resume/`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Resume</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}KashhCMD-Resume.pdf`}
              download
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>PDF</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}uses/`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Uses</span>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}rss.xml`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Rss className="w-4 h-4" />
              <span>RSS</span>
            </a>
            <button
              onClick={onOpenContactModal}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </div>
        </div>

        {/* Credits, the way the portfolios this one is measured against close:
            small, human, and specific about what it is made of. */}
        <p className="mt-6 text-center text-[11px] font-body text-neutral-600">
          Designed and built by {warriorDetails.name} · React, TypeScript, Vite and Tailwind CSS ·
          Static pages generated at build time
        </p>
      </div>
    </footer>
  );
};
