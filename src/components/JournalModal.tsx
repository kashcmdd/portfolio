import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, JournalBlock } from '../types';
import { X, Calendar, Clock, Tag, Link2, Check } from 'lucide-react';

const renderBlock = (block: JournalBlock, key: number) => {
  switch (block.type) {
    case 'heading':
      return (
        <h3
          key={key}
          className="text-lg sm:text-xl font-body font-semibold text-white mt-8 first:mt-0 mb-1 tracking-tight"
        >
          {block.text}
        </h3>
      );

    case 'code':
      return (
        <figure key={key} className="my-5">
          <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                {block.language}
              </span>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-200 whitespace-pre">
                {block.code}
              </code>
            </pre>
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-[11px] font-mono text-neutral-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          key={key}
          className={`my-4 space-y-2 pl-5 text-neutral-200 marker:text-[#89AACC] ${
            block.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ListTag>
      );
    }

    case 'quote':
      return (
        <blockquote
          key={key}
          className="my-6 pl-4 border-l-2 border-[#89AACC]/60 italic text-neutral-300"
        >
          <p>{block.text}</p>
          {block.attribution && (
            <footer className="mt-2 text-xs not-italic font-mono text-neutral-500">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      );

    case 'image':
      return (
        <figure key={key} className="my-6">
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-2xl border border-white/10"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="mt-2 text-[11px] font-mono text-neutral-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'paragraph':
    default:
      return (
        <p key={key} className="text-sm sm:text-base text-neutral-200 leading-relaxed mb-4 last:mb-0">
          {block.text}
        </p>
      );
  }
};

interface JournalModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ entry, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [entry?.id]);

  if (!entry) return null;

  // The static article page is the canonical, shareable URL: it carries its
  // own title and image, so a link preview shows the post and not the site.
  const permalink = `${window.location.origin}${window.location.pathname}journal/${entry.id}/`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(permalink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the address bar still shows the in-app route.
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="liquid-glass-strong w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl border border-white/20 overflow-hidden my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-body text-neutral-400 mb-3">
            <span className="liquid-glass px-3 py-1 rounded-full text-white font-medium flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#89AACC]" /> {entry.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {entry.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {entry.readTime}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="ml-auto flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1 hover:bg-white/20 transition-colors cursor-pointer text-white"
              aria-label="Copy a link to this post"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Link2 className="w-3 h-3 text-[#89AACC]" />
                  Copy link
                </>
              )}
            </button>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display italic text-white tracking-tight mb-3">
            {entry.title}
          </h2>

          <p className="text-sm font-body text-neutral-300 font-light mb-6 border-b border-white/10 pb-4 italic">
            {entry.subtitle}
          </p>

          {/* Banner Image */}
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 border border-white/10">
            <img
              src={entry.image}
              alt={entry.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="font-body font-light mb-8">
            {entry.content.map(renderBlock)}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="liquid-glass-strong rounded-full py-2.5 px-6 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Close Article
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
