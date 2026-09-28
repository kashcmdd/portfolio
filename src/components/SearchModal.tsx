import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ExternalLink, Clock, Tag } from 'lucide-react';
import { Project, JournalEntry } from '../types';
import { projectsData, journalEntriesData } from '../data/portfolioData';

interface SearchResult {
  type: 'project' | 'journal';
  title: string;
  description: string;
  url: string;
  tags?: string[];
  category?: string;
  date?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

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
            window.location.href = results[selectedIndex].url;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search projects
    projectsData.forEach((project) => {
      const titleMatch = project.title.toLowerCase().includes(searchQuery);
      const descMatch = project.description.toLowerCase().includes(searchQuery);
      const tagMatch = project.tags.some(tag => tag.toLowerCase().includes(searchQuery));
      const categoryMatch = project.category.toLowerCase().includes(searchQuery);

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

    // Search journal entries
    journalEntriesData.forEach((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(searchQuery);
      const descMatch = entry.subtitle.toLowerCase().includes(searchQuery);
      const categoryMatch = entry.category.toLowerCase().includes(searchQuery);

      if (titleMatch || descMatch || categoryMatch) {
        searchResults.push({
          type: 'journal',
          title: entry.title,
          description: entry.subtitle,
          url: `#journal/${entry.id}`,
          category: entry.category,
          date: entry.date,
        });
      }
    });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [query]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.split('').join('')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 bg-black/80 backdrop-blur-md">
        <motion.div
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
              placeholder="Search projects, journal, skills..."
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
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 font-body">Type to search projects and journal entries</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
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
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-neutral-400 font-body">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.title}`}
                    onClick={() => {
                      if (result.url.startsWith('#')) {
                        window.location.hash = result.url;
                      } else {
                        window.location.href = result.url;
                      }
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-colors cursor-pointer ${
                      index === selectedIndex
                        ? 'bg-white/20 border border-[#89AACC]'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                        {result.type === 'project' ? (
                          <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center">
                            <span className="text-black text-xs font-bold">P</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#89AACC]/20 border border-[#89AACC]/30 flex items-center justify-center">
                            <span className="text-[#89AACC] text-xs font-bold">J</span>
                          </div>
                        )}
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
