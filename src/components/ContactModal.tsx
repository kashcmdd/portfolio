import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { warriorDetails } from '../data/portfolioData';
import { X, Sparkles } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="liquid-glass-strong w-full max-w-xl rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors text-white cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 flex items-start gap-4">
            <img
              src={warriorDetails.avatarUrl}
              alt={`${warriorDetails.name} Avatar`}
              className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-lg shrink-0 mt-1"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>Get in Touch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display italic text-white">
                Let's build something <span className="accent-text-gradient">exceptional</span>
              </h2>
              <p className="text-xs sm:text-sm font-body font-light text-neutral-300 mt-1">
                Web projects, Discord bots, or just a question — my inbox is open.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full accent-gradient flex items-center justify-center text-black font-bold shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display italic text-white">Contact details coming soon</h3>
            <p className="text-xs text-neutral-300 font-body max-w-sm leading-relaxed">
              I'm setting up my public contact links. Check back shortly — or say hi wherever
              you already know how to reach me.
            </p>
            {warriorDetails.discord && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(warriorDetails.discord);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="mt-2 text-xs font-mono text-[#89AACC] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <span>Copied!</span> : <span>Copy Discord</span>}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};