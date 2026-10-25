import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { warriorDetails } from '../data/portfolioData';
import { X, Sparkles, Github, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFocusTrap } from '../utils/useFocusTrap';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  // Cleared on unmount so the reset does not fire on a closed modal.
  const copyTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    []
  );

  // The message form posts to Formspree, so a portfolio with no backend still
  // has a way to reach its owner that is not "copy a GitHub handle".
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const statusTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xqazkygq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
        statusTimer.current = window.setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        // Formspree answers with a JSON error body, but a proxy or a network
        // change can return something that is not JSON; the parse is guarded so
        // the message still falls back rather than throwing.
        const data = await response.json().catch(() => ({}));
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Get in touch"
          tabIndex={-1}
          className="liquid-glass-strong w-full max-w-xl rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden my-auto"
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
                Web projects, Discord bots, or just a question — GitHub is where I'm quickest to reach.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full accent-gradient flex items-center justify-center text-black font-bold shadow-lg">
              <Github className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display italic text-white">@{warriorDetails.githubHandle}</h3>
            <p className="text-xs text-neutral-300 font-body max-w-sm leading-relaxed">
              Open an issue, send a message, or point me at a repo you want built on.
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
              <a
                href={warriorDetails.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-strong rounded-full py-2.5 px-5 text-xs font-semibold text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Github className="w-3.5 h-3.5" />
                Open profile
              </a>
              <button
                type="button"
                onClick={() => {
                  // Best-effort copy: a refused clipboard should not throw, and the
                  // label still confirms the intent either way.
                  navigator.clipboard?.writeText(warriorDetails.githubHandle).catch(() => {});
                  setCopied(true);
                  if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
                  copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs font-mono text-[#89AACC] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <span>Copied!</span> : <span>Copy handle</span>}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-widest mb-4">
              <Send className="w-3.5 h-3.5 text-[#89AACC]" aria-hidden="true" />
              <span>Or send a message</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                aria-label="Your name"
                required
                className="w-full px-4 py-3 rounded-xl liquid-glass text-white placeholder-neutral-500 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#89AACC]/50 transition-all"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                aria-label="Your email"
                required
                className="w-full px-4 py-3 rounded-xl liquid-glass text-white placeholder-neutral-500 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#89AACC]/50 transition-all"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message"
                aria-label="Your message"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl liquid-glass text-white placeholder-neutral-500 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#89AACC]/50 transition-all resize-none"
              />
              {submitStatus === 'success' && (
                <div className="flex items-center gap-2 text-xs text-green-400 font-body" role="status">
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Message sent successfully!</span>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400 font-body" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl accent-gradient text-black font-semibold text-sm font-body hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Send message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
