import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Clock } from 'lucide-react';
import {
  projectsData,
  journalEntriesData,
  techSkillsData,
  explorationItemsData,
  experienceData,
  warriorDetails,
} from '../data/portfolioData';
import { entryPlainText } from '../utils/journalText';
import { useMotionPref } from './MotionPrefProvider';
import { useFocusTrap } from '../utils/useFocusTrap';

type ResultType =
  | 'project'
  | 'journal'
  | 'skill'
  | 'exploration'
  | 'experience'
  | 'action'
  | 'nav'
  | 'external';

interface SearchResult {
  type: ResultType;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  category?: string;
  date?: string;
  /** Words the query may match, when they are not already in title/description. */
  keywords?: string;
  /** Present on actions that do something rather than navigate somewhere. */
  run?: () => void;
}

const TYPE_BADGES: Record<ResultType, { letter: string; className: string }> = {
  project: { letter: 'P', className: 'accent-gradient text-black' },
  journal: {
    letter: 'J',
    className: 'bg-[#89AACC]/20 border border-[#89AACC]/30 text-[#89AACC]',
  },
  skill: {
    letter: 'S',
    className: 'bg-white/10 border border-white/20 text-neutral-300',
  },
  exploration: {
    letter: 'E',
    className: 'bg-neutral-700/60 border border-neutral-500/40 text-neutral-200',
  },
  experience: {
    letter: 'X',
    className: 'bg-[#89AACC]/20 border border-[#89AACC]/30 text-[#89AACC]',
  },
  action: {
    letter: 'A',
    className: 'bg-[#e0af68]/15 border border-[#e0af68]/30 text-[#e0af68]',
  },
  nav: {
    letter: '↓',
    className: 'bg-white/10 border border-white/20 text-neutral-300',
  },
  external: {
    letter: 'G',
    className: 'bg-white/10 border border-white/20 text-neutral-300',
  },
};

const SECTION_LINKS: { id: string; label: string }[] = [
  { id: 'about', label: 'Go to About' },
  { id: 'skills', label: 'Go to Skills' },
  { id: 'work', label: 'Go to Projects' },
  { id: 'experience', label: 'Go to Experience' },
  { id: 'stack', label: 'Go to Stack' },
  { id: 'journal', label: 'Go to Journal' },
  { id: 'explorations', label: 'Go to Explorations' },
  { id: 'contact', label: 'Go to Contact' },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowShortcuts?: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onShowShortcuts }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { pref, toggle } = useMotionPref();
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Article bodies are indexed once. Doing it per keystroke would re-walk every
  // code sample in the journal on every character typed.
  const articleBodies = useMemo(
    () => new Map(journalEntriesData.map((entry) => [entry.id, entryPlainText(entry)])),
    []
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const activate = (result: SearchResult) => {
    if (result.run) {
      result.run();
      onClose();
      return;
    }
    if (result.url.startsWith('#')) {
      window.location.hash = result.url;
    } else {
      window.location.href = result.url;
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            activate(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (haystack: string) => terms.every((term) => haystack.includes(term));

    // Actions are always available, including with an empty query, because a
    // palette that can do things is more useful than one that can only find
    // things. With no query they are the entire list.
    const commands: SearchResult[] = [
      {
        type: 'action',
        title: 'Copy GitHub profile link',
        description: warriorDetails.githubUrl,
        url: '',
        keywords: `copy github profile link url ${warriorDetails.githubUrl}`,
        run: () => navigator.clipboard.writeText(warriorDetails.githubUrl),
      },
      {
        type: 'action',
        title: 'Copy GitHub handle',
        description: `@${warriorDetails.githubHandle}`,
        url: '',
        keywords: `copy github handle username @${warriorDetails.githubHandle}`,
        run: () => navigator.clipboard.writeText(warriorDetails.githubHandle),
      },
      {
        type: 'action',
        title: pref === 'reduced' ? 'Enable animations' : 'Reduce motion',
        description:
          pref === 'reduced'
            ? 'Turn scrolling and entrance animations back on'
            : 'Turn off scrolling and entrance animations',
        url: '',
        keywords: 'motion animation accessibility reduce toggle quiet still',
        run: toggle,
      },
      {
        type: 'action',
        title: 'Show keyboard shortcuts',
        description: 'Every shortcut the site responds to',
        url: '',
        keywords: 'keyboard shortcuts keys help cheatsheet hotkeys accessibility',
        run: () => onShowShortcuts?.(),
      },
      {
        type: 'action',
        title: 'Open the project pages',
        description: 'One static page per project, no app required',
        url: 'projects/',
        keywords: 'projects work case study static page full html no app',
      },
      {
        type: 'action',
        title: 'Open the journal as static pages',
        description: 'Full articles, no app required',
        url: 'journal/',
        keywords: 'journal article static page full no app rss feed',
      },
      {
        type: 'action',
        title: 'Download the resume PDF',
        description: 'One-page resume, generated from this site',
        url: 'KashhCMD-Resume.pdf',
        keywords: 'resume cv pdf download hire work history',
      },
      {
        type: 'action',
        title: 'Read the uses page',
        description: 'The tools and setup behind the work',
        url: 'uses/',
        keywords: 'uses setup tools stack gear editor how i work',
      },
      {
        type: 'external',
        title: 'Open GitHub',
        description: warriorDetails.githubUrl,
        url: warriorDetails.githubUrl,
        keywords: 'github profile repository source code external',
      },
      ...SECTION_LINKS.map<SearchResult>((section) => ({
        type: 'nav',
        title: section.label,
        description: `Jump to #${section.id}`,
        url: `#${section.id}`,
        keywords: `go jump to ${section.id} section navigate`,
      })),
    ];

    if (terms.length === 0) {
      setResults(commands);
      setSelectedIndex(0);
      return;
    }

    // Results render as one flat list, so order is the only signal a reader gets
    // about confidence. Every result is scored, then the whole set is sorted by
    // that score. Before this, results were emitted grouped by type, which meant
    // a passing mention in an article body could sit above an exact project
    // title purely because of which array it was pushed onto.
    //
    // Membership is still an AND over the terms, so the set of results does not
    // change — only their order does.
    const rank = (field: string, weight: number) => {
      const lower = field.toLowerCase();
      let total = 0;
      for (const term of terms) {
        const at = lower.indexOf(term);
        // A missing term drops the whole field, matching the previous behaviour
        // where every term had to appear within a single field.
        if (at === -1) return 0;
        const startsClean = at === 0 || !/[a-z0-9]/.test(lower[at - 1]);
        const endsAt = at + term.length;
        const endsClean = endsAt >= lower.length || !/[a-z0-9]/.test(lower[endsAt]);
        const wholeWord = startsClean && endsClean;
        // Earlier is a better hit; the cap stops a long body from drowning out
        // an exact title match.
        const earliness = 1 - Math.min(at, 160) / 320;
        total += (wholeWord ? 1.7 : 1) * earliness;
      }
      return (total / terms.length) * weight;
    };

    const scored: Array<{ score: number; result: SearchResult }> = [];

    commands.forEach((command) => {
      const haystack = `${command.title} ${command.description} ${command.keywords || ''}`;
      if (!matches(haystack.toLowerCase())) return;
      scored.push({
        score:
          rank(command.title, 5) +
          rank(command.description, 2) +
          rank(command.keywords || '', 1),
        result: command,
      });
    });

    projectsData.forEach((project) => {
      const titleMatch = matches(project.title.toLowerCase());
      const descMatch = matches(project.description.toLowerCase());
      const tagMatch = project.tags.some((tag) => matches(tag.toLowerCase()));
      const categoryMatch = matches(project.category.toLowerCase());

      if (titleMatch || descMatch || tagMatch || categoryMatch) {
        scored.push({
          score:
            (titleMatch ? 6 : 0) +
            rank(project.subtitle, 3) +
            (descMatch ? 2.5 : 0) +
            (categoryMatch ? 1.5 : 0) +
            (tagMatch ? 1 : 0),
          result: {
            type: 'project',
            title: project.title,
            description: project.subtitle,
            url: `#work`,
            tags: project.tags,
            category: project.category,
          },
        });
      }
    });

    // The experience timeline reuses each project's `outcome` sentence, which is
    // not in the project haystack above. It is indexed on its own so a search for
    // the impact ("conflict-safe", "audited") reaches the timeline entry. A query
    // that already matches the project title is skipped here to avoid emitting
    // the same work twice under two result types.
    experienceData.forEach((entry) => {
      const titleMatch = matches(entry.title.toLowerCase());
      const summaryMatch = matches(entry.summary.toLowerCase());
      const orgMatch = matches(entry.org.toLowerCase());
      const stackMatch = (entry.stack || []).some((tech) => matches(tech.toLowerCase()));

      if (!titleMatch && (summaryMatch || orgMatch || stackMatch)) {
        scored.push({
          score: (summaryMatch ? 3 : 0) + (orgMatch ? 1.5 : 0) + (stackMatch ? 1 : 0),
          result: {
            type: 'experience',
            title: entry.title,
            description: entry.summary,
            url: `#experience`,
            category: entry.period,
            tags: entry.stack?.slice(0, 3),
          },
        });
      }
    });

    journalEntriesData.forEach((entry) => {
      const titleMatch = matches(entry.title.toLowerCase());
      const descMatch = matches(entry.subtitle.toLowerCase());      const categoryMatch = matches(entry.category.toLowerCase());
      // The body is what makes a specific word findable, and it is a much
      // larger haystack, so it is checked on its own and reported separately
      // rather than folded into the title match.
      const bodyMatch = matches(articleBodies.get(entry.id) || '');

      if (titleMatch || descMatch || categoryMatch || bodyMatch) {
        scored.push({
          score:
            (titleMatch ? 6 : 0) +
            (descMatch ? 3 : 0) +
            (categoryMatch ? 1.5 : 0) +
            (bodyMatch ? 1 : 0),
          result: {
            type: 'journal',
            title: entry.title,
            description:
              bodyMatch && !titleMatch && !descMatch && !categoryMatch
                ? 'Mentioned in the article body'
                : entry.subtitle,
            url: `#journal/${entry.id}`,
            category: entry.category,
            date: entry.date,
          },
        });
      }
    });

    // A bare level word ("expert") would otherwise sweep in the whole skill
    // list, so it is only searchable alongside a real term. The set of level
    // words is read off the data so a new level needs no second edit here.
    const bareLevel =
      terms.length === 1 &&
      techSkillsData.some((skill) => skill.level.toLowerCase() === terms[0]);

    techSkillsData.forEach((skill) => {
      if (bareLevel) return;
      const nameMatch = matches(skill.name.toLowerCase());
      const categoryMatch = matches(skill.category.toLowerCase());
      const descMatch = matches(skill.description.toLowerCase());
      const levelMatch = matches(skill.level.toLowerCase());

      if (nameMatch || categoryMatch || descMatch || levelMatch) {
        scored.push({
          score:
            (nameMatch ? 6 : 0) +
            (categoryMatch ? 2 : 0) +
            (descMatch ? 1.5 : 0) +
            (levelMatch ? 1 : 0),
          result: {
            type: 'skill',
            title: skill.name,
            description: skill.description,
            // techSkillsData is rendered by TechStackSection, not SkillsSection.
            url: `#stack`,
            category: skill.category,
            tags: [skill.level],
          },
        });
      }
    });

    explorationItemsData.forEach((item) => {
      const titleMatch = matches(item.title.toLowerCase());
      const descMatch = matches(item.description.toLowerCase());
      const categoryMatch = matches(item.category.toLowerCase());

      if (titleMatch || descMatch || categoryMatch) {
        scored.push({
          score: (titleMatch ? 6 : 0) + (descMatch ? 2 : 0) + (categoryMatch ? 1.5 : 0),
          result: {
            type: 'exploration',
            title: item.title,
            description: item.description,
            url: `#explorations`,
            category: item.category,
          },
        });
      }
    });

    // Highest score first. Array.prototype.sort is stable, so equal scores keep
    // their insertion order, which preserves the old type grouping as a
    // tie-break.
    scored.sort((a, b) => b.score - a.score);

    setResults(scored.map(({ result }) => result));
    setSelectedIndex(0);
  }, [query, articleBodies, pref, toggle, onShowShortcuts]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 bg-black/80 backdrop-blur-md">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search and commands"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.97, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="liquid-glass-strong w-full max-w-2xl rounded-3xl border border-white/20 text-white shadow-2xl overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <Search className="w-5 h-5 text-[#89AACC]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search everything, or run a command..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 font-body text-lg"
            />
            <div className="text-xs text-neutral-500 font-body hidden sm:block">
              <kbd className="px-2 py-1 rounded bg-white/10">ESC</kbd> to close
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="p-2">
                <p className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                  Commands
                </p>
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.title}`}
                    onClick={() => activate(result)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors cursor-pointer ${
                      index === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${TYPE_BADGES[result.type].className}`}
                    >
                      {TYPE_BADGES[result.type].letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white font-body">{result.title}</p>
                      <p className="truncate text-xs text-neutral-500 font-body">
                        {result.description}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="p-4">
                  <p className="mb-2 text-center text-neutral-400 font-body text-sm">
                    Or search projects, journal, skills and explorations
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['React', 'TypeScript', 'Discord', 'Performance', 'Database'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="px-3 py-1.5 rounded-full liquid-glass text-sm text-neutral-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer font-body"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-neutral-400 font-body">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.title}`}
                    onClick={() => activate(result)}
                    className={`w-full text-left p-4 rounded-xl transition-colors cursor-pointer ${
                      index === selectedIndex
                        ? 'bg-white/20 border border-[#89AACC]'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_BADGES[result.type].className}`}
                      >
                        <span className="text-xs font-bold">
                          {TYPE_BADGES[result.type].letter}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white font-body text-sm">
                            {result.title}
                          </h4>
                          {result.category && (
                            <span className="text-xs text-[#89AACC] font-body">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 font-body line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {result.tags && result.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 font-body"
                            >
                              {tag}
                            </span>
                          ))}
                          {result.date && (
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-body">
                              <Clock className="w-3 h-3" />
                              {result.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500 font-body">
            <div className="flex items-center gap-4">
              <span>{results.length} results</span>
              <span className="hidden sm:inline">Use ↑↓ to navigate, Enter to select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10">↑↓</kbd>
              <kbd className="px-2 py-1 rounded bg-white/10">Enter</kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
