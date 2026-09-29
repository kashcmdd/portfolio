import React from 'react';
import { JournalEntry } from '../types';
import { journalEntriesData } from '../data/portfolioData';
import { ArrowUpRight } from 'lucide-react';

interface DecisionLogProps {
  onSelectEntry: (entry: JournalEntry) => void;
}

/**
 * #15 - Tech stack comparison, framed honestly.
 *
 * These five articles already read as "why I chose X over Y"; what was missing
 * was a place that says so in one screen. A comparison table of the same five
 * facts would be the same content padded out, so this lists the actual choice
 * and the alternative that lost, and links into the full reasoning.
 *
 * Only entries that declare `decision` appear, so a new post about something
 * else does not silently join a series it was never part of.
 */
export const DecisionLog: React.FC<DecisionLogProps> = ({ onSelectEntry }) => {
  const decisions = journalEntriesData.filter((entry) => entry.decision);
  if (decisions.length === 0) return null;

  return (
    <div className="mt-12 md:mt-16 rounded-[28px] border border-neutral-800 bg-[#141414]/40 p-6 md:p-8">
      <div className="flex items-center gap-2 text-xs font-body text-neutral-400 uppercase tracking-[0.3em] mb-2">
        <span className="w-8 h-px bg-neutral-800" />
        <span>Engineering decisions</span>
      </div>
      <p className="text-sm font-body font-light text-neutral-400 max-w-xl mb-6">
        Every entry above is really a record of a choice. Here is what each one picked, and what it
        turned down.
      </p>

      <ul className="divide-y divide-white/5">
        {decisions.map((entry, idx) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelectEntry(entry)}
              className="group w-full flex items-start gap-4 md:gap-6 py-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC] rounded-lg"
            >
              <span className="font-mono text-xs text-neutral-600 pt-0.5 shrink-0 tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm md:text-base font-body font-medium text-white group-hover:text-neutral-200 transition-colors">
                    {entry.title}
                  </span>
                  <span className="text-[10px] font-body uppercase tracking-wider text-neutral-500">
                    {entry.category}
                  </span>
                </span>
                <span className="mt-1 block text-xs md:text-sm font-body text-neutral-400 leading-relaxed">
                  Chose{' '}
                  <span className="text-[#89AACC]">{entry.decision?.chose}</span>
                  {' '}over{' '}
                  <span className="text-neutral-300">{entry.decision?.over}</span>.
                </span>
              </span>

              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0 mt-1 transition-colors" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
