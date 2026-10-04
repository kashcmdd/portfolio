import React from 'react';
import { motion } from 'motion/react';

const LINKS = [
  { href: import.meta.env.BASE_URL, label: 'Back to portfolio' },
  { href: `${import.meta.env.BASE_URL}journal/`, label: 'Journal' },
  { href: `${import.meta.env.BASE_URL}projects/`, label: 'Projects' },
  { href: `${import.meta.env.BASE_URL}resume/`, label: 'Resume' },
  { href: `${import.meta.env.BASE_URL}uses/`, label: 'Uses' },
];

// Rendered when the app is reached at a path it does not recognise, which
// happens on hosts that fall back to index.html instead of serving the static
// 404.html. Both routes show the same thing so the experience does not depend
// on how the host is configured.
export const NotFoundView: React.FC = () => (
  <section
    id="not-found"
    className="relative w-full bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center px-6 py-24"
  >
    <div className="max-w-xl text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="font-display text-7xl sm:text-8xl md:text-9xl font-medium tracking-tight accent-gradient-text bg-clip-text text-transparent"
      >
        404
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="mt-4 text-2xl sm:text-3xl font-body font-medium text-white"
      >
        This page doesn't exist.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="mt-3 text-sm font-body font-light text-neutral-400 leading-relaxed"
      >
        The link may be broken, or the page may have moved. Nothing here is
        broken on your end.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
        className="mt-6 font-mono text-xs text-[#FF8C42] break-all"
      >
        {typeof window !== 'undefined' ? window.location.pathname : ''}
      </motion.p>

      <motion.nav
        aria-label="Suggested pages"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.36, ease: 'easeOut' }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-full border border-white/10 bg-[#141414] px-5 py-2.5 text-xs font-body text-neutral-200 transition-colors hover:bg-[#1f1f1f] hover:border-white/20 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </motion.nav>
    </div>
  </section>
);

export default NotFoundView;
