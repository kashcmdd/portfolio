import React from 'react';
import { ArrowUpRight, Hammer } from 'lucide-react';
import { currentlyBuildingData, recentWorkData } from '../data/portfolioData';
import { RecentWork } from '../types';

/**
 * A "what I am working on right now" band, plus a short dated changelog.
 *
 * Portfolio pages tend to describe finished work, which makes a visitor wonder
 * whether any of it is still alive. One honest line about current work answers
 * that without a blog post, and the changelog below it shows the work is moving
 * without pretending to be a live feed — the dates are real, so a reader can
 * see exactly how fresh the page is.
 */
const KIND_STYLES: Record<RecentWork['kind'], string> = {
  Feature: 'text-[#89AACC]',
  Fix: 'text-[#9ECE6A]',
  Refactor: 'text-[#C099FF]',
  Content: 'text-[#E0AF68]',
};

export const NowBuildingStrip: React.FC = () => {
  const item = currentlyBuildingData;
  if (!item) return null;

  const recent = recentWorkData.slice(0, 3);

  return (
    <div className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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

        {recent.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-neutral-500">
            <li className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
              Recently
            </li>
            {recent.map((work) => (
              <li key={work.title} className="flex items-center gap-1.5">
                <span className={KIND_STYLES[work.kind]}>{work.kind}</span>
                <span className="text-neutral-300">{work.title}</span>
                <span className="text-neutral-600">{work.date}</span>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/kashcmdd/portfolio-dev/commits/main"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#89AACC] transition-colors hover:text-white"
              >
                Full changelog
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
