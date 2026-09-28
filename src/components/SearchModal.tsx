import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Clock } from 'lucide-react';
import {
  projectsData,
  journalEntriesData,
  techSkillsData,
  explorationItemsData,
  warriorDetails,
} from '../data/portfolioData';
import { entryPlainText } from '../utils/journalText';
import { useMotionPref } from './MotionPrefProvider';
import { useFocusTrap } from '../utils/useFocusTrap';

type ResultType = 'project' | 'journal' | 'skill' | 'exploration' | 'action' | 'nav' | 'external';

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
  { id: 'journal', label: 'Go to Journal' },
  { id: 'stack', label: 'Go to Stack' },
  { id: 'explorations', label: 'Go to Explorations' },
  { id: 'contact', label: 'Go to Contact' },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
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
        title: 'Open the journal as static pages',
        description: 'Full articles, no app required',
        url: 'journal/',
        keywords: 'journal article static page full no app rss feed',
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

    const searchResults: SearchResult[] = commands.filter((command) =>
      matches(
        `${command.title} ${command.description} ${command.keywords || ''}`.toLowerCase()
      )
    );

    // Every whitespace-separated term has to appear somewhere in the haystack.
    // A single `includes` over a joined string would also match "type react",
    // which no field contains.
    projectsData.forEach((project) => {
      const titleMatch = matches(project.title.toLowerCase());
      const descMatch = matches(project.description.toLowerCase());
      const tagMatch = project.tags.some((tag) => matches(tag.toLowerCase()));
      const categoryMatch = matches(project.category.toLowerCase());

      if (titleMatch || descMatch || tagMatch || categoryMatch) {
        searchResults.push({
          type: 'project',
          title: project.title,
          description: project.subtitle,
          url: `#work`,
          tags: project.tags,
          category: project.category,
        });
      }
    });

    journalEntriesData.forEach((entry) => {
      const titleMatch = matches(entry.title.toLowerCase());
      const descMatch = matches(entry.subtitle.toLowerCase());
      const categoryMatch = matches(entry.category.toLowerCase());
      // The body is what makes a specific word findable, and it is a much
      // larger haystack, so it is checked on its own and reported separately
      // rather than folded into the title match.
      const bodyMatch = matches(articleBodies.get(entry.id) || '');

      if (titleMatch || descMatch || categoryMatch || bodyMatch) {
        searchResults.push({
          type: 'journal',
          title: entry.title,
          description: bodyMatch && !titleMatch && !descMatch && !categoryMatch
            ? 'Mentioned in the article body'
            : entry.subtitle,
          url: `#journal/${entry.id}`,
          category: entry.category,
          date: entry.date,
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
      if (
        matches(skill.name.toLowerCase()) ||
        matches(skill.category.toLowerCase()) ||
        matches(skill.description.toLowerCase()) ||
        matches(skill.level.toLowerCase())
      ) {
        searchResults.push({
          type: 'skill',
          title: skill.name,
          description: skill.description,
          // techSkillsData is rendered by TechStackSection, not SkillsSection.
          url: `#stack`,
          category: skill.category,
          tags: [skill.level],
        });
      }
    });

    explorationItemsData.forEach((item) => {
      if (
        matches(item.title.toLowerCase()) ||
        matches(item.description.toLowerCase()) ||
        matches(item.category.toLowerCase())
      ) {
        searchResults.push({
          type: 'exploration',
          title: item.title,
          description: item.description,
          url: `#explorations`,
          category: item.category,
        });
      }
    });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, articleBodies, pref, toggle]);

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
