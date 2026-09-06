import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FadingVideo } from './FadingVideo';
import { BlurText } from './BlurText';
import { Menu, X } from 'lucide-react';

interface HeroProps {
  onOpenClaimModal: (tier?: string) => void;
  onScrollToCapabilities: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenClaimModal,
  onScrollToCapabilities,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroAnimationProps = (delay: number) => ({
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' },
  });

  return (
    <section id="hero" className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between">
      {/* Background Video (120% width/height, top-aligned, centered horizontally) */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0 pointer-events-none"
        style={{ width: '120%', height: '120%' }}
      />

      {/* Navbar (fixed top-4, px-8 / lg:px-16, z-50) */}
      <header className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: 48x48 liquid-glass circle with italic serif lowercase "a" */}
          <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center cursor-pointer select-none shrink-0 shadow-lg">
            <span className="font-heading italic text-2xl text-white leading-none">
              a
            </span>
          </div>

          {/* Center (desktop only): liquid-glass pill holding 5 links + Claim a Spot button */}
          <nav className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1.5 gap-1 shadow-lg">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onScrollToCapabilities}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Voyages
            </button>
            <button
              onClick={onScrollToCapabilities}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Worlds
            </button>
            <button
              onClick={onScrollToCapabilities}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Innovation
            </button>
            <button
              onClick={() => onOpenClaimModal('Deep Space Transit')}
              className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors cursor-pointer"
            >
              Plan Launch
            </button>

            {/* Claim a Spot + ArrowUpRight icon */}
            <button
              onClick={() => onOpenClaimModal()}
              className="ml-1 bg-white text-black px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-1.5 hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap font-body shadow-sm"
            >
              Claim a Spot
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Right: 48x48 invisible spacer to balance logo on desktop */}
          <div className="hidden md:block w-12 h-12 pointer-events-none" />
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-3 liquid-glass-strong rounded-2xl p-4 flex flex-col gap-3 shadow-2xl border border-white/20 max-w-xs ml-auto"
          >
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left text-sm font-medium font-body text-white/90 hover:text-white py-1"
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToCapabilities();
              }}
              className="text-left text-sm font-medium font-body text-white/90 hover:text-white py-1"
            >
              Voyages & Capabilities
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenClaimModal('Deep Space Transit');
              }}
              className="text-left text-sm font-medium font-body text-white/90 hover:text-white py-1"
            >
              Plan Launch
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenClaimModal();
              }}
              className="bg-white text-black px-4 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-2 font-body mt-2"
            >
              Claim a Spot
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          </motion.div>
        )}
      </header>

      {/* Hero Content Layer (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center pt-28 pb-12 px-4 max-w-5xl mx-auto w-full my-auto">
        {/* Badge (delay 0.4s) */}
        <motion.div
          {...heroAnimationProps(0.4)}
          onClick={() => onOpenClaimModal('Martian Surface Descent')}
          className="liquid-glass rounded-full p-1 inline-flex items-center gap-2 mb-6 cursor-pointer hover:bg-white/10 transition-colors shadow-lg"
        >
          <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full font-body">
            New
          </span>
          <span className="text-sm text-white/90 pr-3 font-body font-normal">
            Maiden Crewed Voyage to Mars Arrives 2026
          </span>
        </motion.div>

        {/* Headline — BlurText component */}
        <div className="max-w-3xl mx-auto">
          <BlurText
            text="Venture Past Our Sky Across the Universe"
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl mx-auto justify-center tracking-[-4px]"
            delayOffset={0.2}
          />
        </div>

        {/* Subheading (delay 0.8s) */}
        <motion.p
          {...heroAnimationProps(0.8)}
          className="mt-6 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight mx-auto"
        >
          Discover the universe in ways once unimaginable. Our pioneering vessels and breakthrough engineering bring deep-space exploration within reach—secure and extraordinary.
        </motion.p>

        {/* CTAs (delay 1.1s) */}
        <motion.div
          {...heroAnimationProps(1.1)}
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
        >
          {/* Primary CTA */}
          <button
            onClick={() => onOpenClaimModal()}
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer font-body shadow-xl group"
          >
            <span>Start Your Voyage</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>

          {/* Secondary CTA */}
          <button
            onClick={onScrollToCapabilities}
            className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors cursor-pointer font-body py-2"
          >
            <span>View Liftoff</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
            >
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </button>
        </motion.div>

        {/* Stats Row (delay 1.3s) */}
        <motion.div
          {...heroAnimationProps(1.3)}
          className="flex flex-wrap items-stretch justify-center gap-4 mt-10"
        >
          {/* Card 1 */}
          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between shadow-lg">
            <div className="text-white mb-6">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">
                34.5 Min
              </div>
              <p className="text-xs text-white font-body font-light mt-2">
                Average Videos Watch Time
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between shadow-lg">
            <div className="text-white mb-6">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">
                2.8B+
              </div>
              <p className="text-xs text-white font-body font-light mt-2">
                Users Across the Globe
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partners section (bottom of hero, delay 1.4s) */}
      <motion.div
        {...heroAnimationProps(1.4)}
        className="relative z-10 flex flex-col items-center gap-4 pb-8 pt-4"
      >
        <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body shadow-sm">
          Collaborating with top aerospace pioneers globally
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 font-heading italic text-white text-2xl md:text-3xl tracking-tight select-none">
          <span className="hover:opacity-100 opacity-90 transition-opacity">Aeon</span>
          <span className="text-white/40 font-normal">·</span>
          <span className="hover:opacity-100 opacity-90 transition-opacity">Vela</span>
          <span className="text-white/40 font-normal">·</span>
          <span className="hover:opacity-100 opacity-90 transition-opacity">Apex</span>
          <span className="text-white/40 font-normal">·</span>
          <span className="hover:opacity-100 opacity-90 transition-opacity">Orbit</span>
          <span className="text-white/40 font-normal">·</span>
          <span className="hover:opacity-100 opacity-90 transition-opacity">Zeno</span>
        </div>
      </motion.div>
    </section>
  );
};
