import React from 'react';
import { ArrowUpRight, Hammer } from 'lucide-react';
import { currentlyBuildingData } from '../data/portfolioData';

/**
 * A single-line "what I am working on right now" band.
 *
 * Portfolio pages tend to describe finished work, which makes a visitor wonder
 * whether any of it is still alive. One honest line about current work answers
 * that without a blog post, and it is the one thing on the site that changes
 * without a redesign, so it is kept to a single field in the data file.
 */
export const NowBuildingStrip: React.FC = () => {
  const item = currentlyBuildingData;
  if (!item) return null;

  return (
    <div className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#89AACC]">
          <Hammer className="h-3 w-3" />
          Currently building
        </span>

        <span className="hidden h-4 w-px bg-white/10 sm:block" />

        <p className="min-w-0 flex-1 text-sm text-neutral-300">
          <span className="font-medium text-white">{item.name}</span>
          <span className="mx-2 text-neutral-700">-</span>
          {item.description}
        </p>

        {item.status && (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {item.status}
          </span>
        )}

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-sm text-[#89AACC] transition-colors hover:text-white"
          >
            Take a look
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
