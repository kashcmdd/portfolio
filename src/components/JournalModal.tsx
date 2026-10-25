import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, JournalBlock } from '../types';
import { X, Calendar, Clock, Tag, ExternalLink, ChevronDown, List, ArrowRight } from 'lucide-react';
import { JournalComments } from './JournalComments';
import { JournalCodeBlock } from './JournalCodeBlock';
import { articleOutline, outlineSlugs } from '../../scripts/lib/journal-outline.mjs';
import { journalEntriesData } from '../data/portfolioData';
import { SmartImage } from './SmartImage';
import ShareBar from './ShareBar';
import { articleUrl } from '../utils/share';
import { useFocusTrap } from '../utils/useFocusTrap';

const renderBlock = (block: JournalBlock, key: number, slug: string | null) => {
  switch (block.type) {
    case 'heading':
      return (
        <h3
          key={key}
          data-slug={slug || undefined}
          className="text-lg sm:text-xl font-body font-semibold text-white mt-8 first:mt-0 mb-1 tracking-tight scroll-mt-4"
        >
          {block.text}
        </h3>
      );

    case 'code':
      return (
        <JournalCodeBlock
          key={key}
          code={block.code}
          language={block.language}
          caption={block.caption}
        />
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
            <SmartImage
              src={block.src}
              alt={block.alt}
              ratio="16 / 9"
              className="w-full rounded-2xl border border-white/10"
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
  onSelectEntry: (entry: JournalEntry) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  entry,
  onClose,
  onSelectEntry,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>(Boolean(entry));
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);

  const outline = useMemo(() => articleOutline(entry?.content ?? []), [entry]);
  const slugs = useMemo(() => outlineSlugs(entry?.content ?? []), [entry]);

  // Two posts from the same subject first, so "read next" is a suggestion
  // rather than just the newest thing in the list.
  const related = useMemo(() => {
    if (!entry) return [];
    const others = journalEntriesData.filter((e) => e.id !== entry.id);
    const sameCategory = others.filter((e) => e.category === entry.category);
    const rest = others.filter((e) => e.category !== entry.category);
    return [...sameCategory, ...rest].slice(0, 2);
  }, [entry]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setProgress(0);
    setActiveId(null);
    setShowToc(false);
  }, [entry?.id]);

  const scrollToHeading = useCallback((id: string) => {
    const container = bodyRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-slug="${id}"]`);
    if (!target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top: container.scrollTop + offset - 12, behavior: 'smooth' });
  }, []);

  // The panel scrolls internally, so reading progress and the current section
  // both have to be measured against it rather than the window. Scroll events
  // are coalesced into one frame because a fling can fire dozens per second and
  // each one would otherwise walk every heading to find the active one.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 8 ? Math.min(1, el.scrollTop / max) : 1);
      const top = el.getBoundingClientRect().top;
      let current: string | null = null;
      for (const heading of outline) {
        const node = el.querySelector<HTMLElement>(`[data-slug="${heading.id}"]`);
        if (!node) continue;
        if (node.getBoundingClientRect().top - top <= 72) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entry?.id, outline]);

  // The panel scrolls internally, so the page behind it has to stop moving.
  useEffect(() => {
    if (!entry) return;
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
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label={entry.title}
          tabIndex={-1}
          className="liquid-glass-strong w-full max-w-3xl my-auto max-h-[calc(100dvh_-_1.5rem)] sm:max-h-[calc(100dvh_-_3rem)] rounded-3xl border border-white/20 text-white shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Reading progress: how far through the article you are */}
          <div className="h-0.5 shrink-0 bg-white/5" aria-hidden="true">
            <div
              className="h-full bg-[#89AACC] transition-[width] duration-150 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {/* Header: stays put while the article scrolls underneath it */}
          <div className="shrink-0 px-6 pt-6 pb-4 sm:px-8 sm:pt-7 border-b border-white/10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white z-10"
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
              <a
                href={`journal/${entry.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1 hover:bg-white/20 transition-colors text-white"
                aria-label="Open this post as a full page in a new tab"
              >
                <ExternalLink className="w-3 h-3 text-[#89AACC]" />
                Read full page
              </a>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display italic text-white tracking-tight pr-12">
              {entry.title}
            </h2>

            <ShareBar
              url={articleUrl(entry.id)}
              title={entry.title}
              className="mt-4"
            />

            {/* Contents. Hidden for short posts, where a two-item list of
                links would be more chrome than help. */}
            {outline.length >= 3 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowToc((open) => !open)}
                  aria-expanded={showToc}
                  aria-controls="journal-toc"
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 transition-colors hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <List className="w-3 h-3 text-[#89AACC]" />
                  Contents
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showToc ? 'rotate-180' : ''}`}
                  />
                </button>
                {showToc && (
                  <ol
                    id="journal-toc"
                    className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/30 py-2 pr-2"
                  >
                    {outline.map((heading, i) => (
                      <li key={heading.id}>
                        <button
                          type="button"
                          onClick={() => scrollToHeading(heading.id)}
                          className={`flex w-full items-baseline gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                            activeId === heading.id
                              ? 'bg-white/10 text-white'
                              : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-neutral-600 tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {heading.text}
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Article Body: the only part that scrolls */}
          <div
            ref={bodyRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 scroll-smooth"
          >
            <p className="text-sm font-body text-neutral-300 font-light mb-6 border-b border-white/10 pb-4 italic">
              {entry.subtitle}
            </p>

            {/* Banner Image */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 border border-white/10">
              <SmartImage
                src={entry.image}
                alt={entry.title}
                ratio="2 / 1"
                priority
                className="w-full h-full object-cover"
              />
            </div>

            <div className="font-body font-light">
              {entry.content.map((block, i) => renderBlock(block, i, slugs[i] ?? null))}
            </div>

            {/* Read next */}
            {related.length > 0 && (
              <div className="mt-10 border-t border-white/10 pt-6">
                <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Read next
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectEntry(item)}
                      className="group flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-colors hover:border-[#89AACC]/40 hover:bg-white/[0.05] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                        {item.category}
                        <span className="text-neutral-700" aria-hidden="true">&middot;</span>
                        {item.readTime}
                      </span>
                      <span className="flex items-start justify-between gap-2 text-sm leading-snug text-white">
                        {item.title}
                        <ArrowRight className="mt-0.5 w-4 h-4 shrink-0 text-neutral-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#89AACC]" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <JournalComments entryId={entry.id} />
          </div>

          {/* Footer: the second way out stays reachable too */}
          <div className="shrink-0 px-6 py-4 sm:px-8 border-t border-white/10 flex justify-end">
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
