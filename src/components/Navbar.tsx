import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { warriorDetails } from '../data/portfolioData';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenContactModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenContactModal,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'work', label: 'Work' },
    { id: 'journal', label: 'Journal' },
    { id: 'stack', label: 'Stack' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center rounded-full backdrop-blur-xl border border-white/10 bg-[#141414]/80 px-2 py-1.5 transition-all duration-300 max-w-full ${
          scrolled ? 'shadow-xl shadow-black/40 border-white/15 bg-[#141414]/95' : 'shadow-md shadow-black/10'
        }`}
      >
        {/* Logo circle with GitHub Avatar */}
        <button
          onClick={() => onNavigate('hero')}
          className="group relative w-9 h-9 rounded-full flex items-center justify-center p-[1.5px] transition-transform duration-300 hover:scale-110 cursor-pointer shrink-0 overflow-hidden"
          aria-label="Go to Home"
        >
          {/* Accent gradient border ring */}
          <span className="absolute inset-0 rounded-full accent-gradient opacity-80 group-hover:opacity-100 transition-opacity animate-gradient-shift" />
          <img
            src={warriorDetails.avatarUrl}
            alt={warriorDetails.name}
            className="relative w-full h-full rounded-full object-cover border border-black z-10"
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-800 mx-1.5 hidden md:block" />

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-xs sm:text-sm font-medium rounded-full px-3.5 py-1.5 transition-all cursor-pointer font-body ${
                  isActive
                    ? 'text-white bg-white/15 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-800 mx-1.5 hidden md:block" />

        {/* Say Hi Button with animated gradient border */}
        <div className="relative group ml-1 shrink-0">
          <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity blur-[1px] animate-gradient-shift pointer-events-none" />
          <button
            onClick={onOpenContactModal}
            className="relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium rounded-full px-4 py-1.5 bg-[#141414] text-white hover:bg-[#1f1f1f] border border-white/10 transition-colors cursor-pointer font-body"
          >
            <span>Say hi</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-2 p-1.5 rounded-full text-neutral-300 hover:text-white cursor-pointer"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-20 left-4 right-4 bg-[#141414]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-2 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(item.id);
              }}
              className={`text-left text-sm font-medium py-2 px-4 rounded-xl font-body transition-colors ${
                activeSection === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenContactModal();
            }}
            className="mt-2 w-full py-2.5 rounded-xl accent-gradient text-black font-semibold text-sm flex items-center justify-center gap-2 font-body"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
